-- Device limit per account: 1 (default), 2, or unlimited (multi_device = true).
-- devices now holds one row per bound device.

alter table public.profiles add column if not exists max_devices int not null default 1 check (max_devices between 1 and 5);

alter table public.devices drop constraint if exists devices_pkey;
alter table public.devices add primary key (user_id, device_id);

-- returns 'bound' (first device just bound), 'ok' (known device, extra device within the limit, admin), or 'blocked'
create or replace function public.claim_device(p_device_id uuid, p_user_agent text default null)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); p public.profiles; n int;
begin
  if uid is null then return 'blocked'; end if;
  if public.is_admin() then return 'ok'; end if;
  select * into p from public.profiles where id = uid;
  if p.last_active_at is null or p.last_active_at < now() - interval '5 minutes' then
    update public.profiles set last_active_at = now() where id = uid;
  end if;
  if p.multi_device then return 'ok'; end if;

  if exists (select 1 from public.devices where user_id = uid and device_id = p_device_id) then
    update public.devices set last_seen_at = now()
     where user_id = uid and device_id = p_device_id and last_seen_at < now() - interval '5 minutes';
    return 'ok';
  end if;

  select count(*) into n from public.devices where user_id = uid;
  if n >= coalesce(p.max_devices, 1) then return 'blocked'; end if;
  insert into public.devices (user_id, device_id, user_agent) values (uid, p_device_id, left(p_user_agent, 300));
  return case when n = 0 then 'bound' else 'ok' end;   -- 'bound' signs out other sessions; a 2nd device must not
end $$;
