-- Guest checkout: anyone can order with name + phone + email + bKash sender number, no account needed.
-- Approving unlocks the account with that email; if there is none yet, the account unlocks automatically
-- the moment the student signs up with that email (trigger on profiles).

alter table public.orders alter column user_id drop not null;
alter table public.orders add column if not exists full_name text;
alter table public.orders add column if not exists email text;
alter table public.orders add column if not exists phone text;
alter table public.orders add column if not exists access_until date;
alter table public.orders add column if not exists client_ip text;
alter table public.orders add column if not exists user_agent text;

-- backfill contact details for orders placed by signed-in students
update public.orders o set full_name = p.full_name, email = p.email, phone = p.phone
  from public.profiles p where p.id = o.user_id and o.email is null;

create unique index if not exists orders_one_pending_email on public.orders (lower(email)) where status = 'pending';
create index if not exists orders_email on public.orders (lower(email));

drop function if exists public.place_order(text, text, text, jsonb);

-- Signed-in or not. Returns the order id (unguessable, used for the receipt page) and number.
create or replace function public.create_order(
  p_full_name text,
  p_email text,
  p_phone text,
  p_bkash_number text,
  p_fbp text default null,
  p_fbc text default null,
  p_utm jsonb default null,
  p_client_ip text default null,
  p_user_agent text default null
) returns table (id uuid, number bigint, event_id uuid)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  em text := lower(trim(p_email));
  price int;
  o public.orders;
begin
  if length(trim(coalesce(p_full_name, ''))) < 2 then raise exception 'invalid name'; end if;
  if em !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid email'; end if;
  if p_phone !~ '^01[3-9][0-9]{8}$' then raise exception 'invalid phone'; end if;
  if p_bkash_number !~ '^01[3-9][0-9]{8}$' then raise exception 'invalid bkash number'; end if;
  select coalesce((select (value #>> '{}')::int from public.settings where key = 'offer_price'), 7999) into price;

  -- signed in → that account; otherwise link to an existing account with this email, if any
  if uid is null then
    select p.id into uid from public.profiles p where lower(p.email) = em limit 1;
  end if;

  update public.orders x
     set full_name = left(trim(p_full_name), 120), phone = p_phone, bkash_number = p_bkash_number,
         amount = price, user_id = coalesce(x.user_id, uid), created_at = now(),
         fbp = coalesce(left(p_fbp, 200), x.fbp), fbc = coalesce(left(p_fbc, 300), x.fbc), utm = coalesce(p_utm, x.utm),
         client_ip = coalesce(left(p_client_ip, 64), x.client_ip), user_agent = coalesce(left(p_user_agent, 400), x.user_agent)
   where x.status = 'pending' and (lower(x.email) = em or (uid is not null and x.user_id = uid))
  returning * into o;

  if not found then
    insert into public.orders (user_id, full_name, email, phone, amount, bkash_number, fbp, fbc, utm, client_ip, user_agent)
    values (uid, left(trim(p_full_name), 120), em, p_phone, price, p_bkash_number,
            left(p_fbp, 200), left(p_fbc, 300), p_utm, left(p_client_ip, 64), left(p_user_agent, 400))
    returning * into o;
  end if;
  return query select o.id, o.number, o.event_id;
end $$;
revoke execute on function public.create_order(text, text, text, text, text, text, jsonb, text, text) from public;
grant execute on function public.create_order(text, text, text, text, text, text, jsonb, text, text) to anon, authenticated;

-- Receipt for the order page (whoever has the order id).
create or replace function public.get_order_receipt(p_id uuid)
returns table (number bigint, amount int, bkash_number text, status text, email text, full_name text,
               created_at timestamptz, event_id uuid, has_account boolean)
language sql stable security definer set search_path = public as $$
  select o.number, o.amount, o.bkash_number, o.status, o.email, o.full_name, o.created_at, o.event_id,
         (o.user_id is not null or exists (select 1 from public.profiles p where lower(p.email) = lower(o.email)))
    from public.orders o where o.id = p_id;
$$;
revoke execute on function public.get_order_receipt(uuid) from public;
grant execute on function public.get_order_receipt(uuid) to anon, authenticated;

-- unlock one profile from one approved order
create or replace function public.apply_order_to_profile(p_order public.orders, p_user uuid, p_by uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.orders set user_id = p_user where id = p_order.id;
  insert into public.payments (user_id, amount, method, paid_on, recorded_by, order_id, sender_number)
  values (p_user, p_order.amount, 'bkash', (now() at time zone 'Asia/Dhaka')::date, p_by, p_order.id, p_order.bkash_number);
  update public.profiles
     set is_paid = true,
         access_expires_at = case when p_order.access_until is null then null
                                  else ((p_order.access_until::text || ' 23:59:59')::timestamp at time zone 'Asia/Dhaka') end
   where id = p_user;
end $$;
revoke execute on function public.apply_order_to_profile(public.orders, uuid, uuid) from public, anon, authenticated;

-- Admin approve: unlock now if the account exists, otherwise on signup.
-- Returns true if an account was unlocked now.
drop function if exists public.approve_order(uuid, date);
create or replace function public.approve_order(p_order_id uuid, p_access_end date)
returns boolean language plpgsql security definer set search_path = public as $$
declare o public.orders; uid uuid;
begin
  if not public.is_admin() then raise exception 'admins only'; end if;
  select * into o from public.orders where id = p_order_id for update;
  if not found then raise exception 'order not found'; end if;
  if o.status = 'approved' then return o.user_id is not null; end if;
  update public.orders set status = 'approved', access_until = p_access_end, reviewed_at = now(), reviewed_by = auth.uid()
   where id = o.id returning * into o;
  uid := o.user_id;
  if uid is null then select p.id into uid from public.profiles p where lower(p.email) = lower(o.email) limit 1; end if;
  if uid is null then return false; end if;
  perform public.apply_order_to_profile(o, uid, auth.uid());
  return true;
end $$;
revoke execute on function public.approve_order(uuid, date) from public, anon;
grant execute on function public.approve_order(uuid, date) to authenticated;

-- New account → claim approved orders for its email
create or replace function public.claim_orders_for_new_profile()
returns trigger language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  if new.email is null then return new; end if;
  for o in select * from public.orders
            where status = 'approved' and user_id is null and lower(email) = lower(new.email)
            order by created_at loop
    perform public.apply_order_to_profile(o, new.id, o.reviewed_by);
  end loop;
  -- pending orders get linked too, so the student sees "verifying" on the dashboard
  update public.orders set user_id = new.id where status = 'pending' and user_id is null and lower(email) = lower(new.email);
  return new;
end $$;
revoke execute on function public.claim_orders_for_new_profile() from public, anon, authenticated;
drop trigger if exists on_profile_claim_orders on public.profiles;
create trigger on_profile_claim_orders after insert on public.profiles
  for each row execute function public.claim_orders_for_new_profile();
