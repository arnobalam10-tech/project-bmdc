-- Orders: a student places an order on /enroll after sending the bKash payment.
-- The admin checks the bKash sender number in the bKash app, then approves (→ paid) or rejects.
-- fbp / fbc / utm / event_id are kept so a later Meta Conversions API "Purchase" can be matched to the ad.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 1001),
  user_id uuid not null references public.profiles on delete cascade,
  amount integer not null check (amount >= 0),
  bkash_number text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_note text,
  fbp text,
  fbc text,
  utm jsonb,
  event_id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles
);
create index if not exists orders_status_created on public.orders (status, created_at desc);
create index if not exists orders_user on public.orders (user_id, created_at desc);
-- at most one open order per student
create unique index if not exists orders_one_pending on public.orders (user_id) where status = 'pending';

alter table public.orders enable row level security;
create policy "orders: read own" on public.orders for select using (user_id = auth.uid());
create policy "orders: admin all" on public.orders for all using (public.is_admin()) with check (public.is_admin());

-- payments: link to the order + the bKash number the money came from
alter table public.payments add column if not exists order_id uuid references public.orders on delete set null;
alter table public.payments add column if not exists sender_number text;

-- Students place orders only through this function: the price comes from settings, not the browser.
-- Returns the order (an existing pending order is updated instead of creating a second one).
create or replace function public.place_order(
  p_bkash_number text,
  p_fbp text default null,
  p_fbc text default null,
  p_utm jsonb default null
) returns public.orders
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); o public.orders; price int;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if p_bkash_number !~ '^01[3-9][0-9]{8}$' then raise exception 'invalid bkash number'; end if;
  select coalesce((select (value #>> '{}')::int from public.settings where key = 'offer_price'), 7999) into price;

  update public.orders
     set bkash_number = p_bkash_number, amount = price, created_at = now(),
         fbp = coalesce(p_fbp, fbp), fbc = coalesce(p_fbc, fbc), utm = coalesce(p_utm, utm)
   where user_id = uid and status = 'pending'
  returning * into o;
  if found then return o; end if;

  insert into public.orders (user_id, amount, bkash_number, fbp, fbc, utm)
  values (uid, price, p_bkash_number, left(p_fbp, 200), left(p_fbc, 300), p_utm)
  returning * into o;
  return o;
end $$;
revoke execute on function public.place_order(text, text, text, jsonb) from public, anon;
grant execute on function public.place_order(text, text, text, jsonb) to authenticated;

-- Admin: approve → payment row + paid access until p_access_end (end of that day, Dhaka)
create or replace function public.approve_order(p_order_id uuid, p_access_end date)
returns void language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  if not public.is_admin() then raise exception 'admins only'; end if;
  select * into o from public.orders where id = p_order_id for update;
  if not found then raise exception 'order not found'; end if;
  if o.status = 'approved' then return; end if;
  update public.orders set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid() where id = o.id;
  insert into public.payments (user_id, amount, method, paid_on, recorded_by, order_id, sender_number)
  values (o.user_id, o.amount, 'bkash', (now() at time zone 'Asia/Dhaka')::date, auth.uid(), o.id, o.bkash_number);
  update public.profiles
     set is_paid = true,
         access_expires_at = case when p_access_end is null then null
                                  else ((p_access_end::text || ' 23:59:59')::timestamp at time zone 'Asia/Dhaka') end
   where id = o.user_id;
end $$;
revoke execute on function public.approve_order(uuid, date) from public, anon;
grant execute on function public.approve_order(uuid, date) to authenticated;
