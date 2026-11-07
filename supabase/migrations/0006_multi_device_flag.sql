-- Admin can allow an account on several devices (e.g. test accounts, special cases).
alter table public.profiles add column if not exists multi_device boolean not null default false;

create or replace function public.claim_device(p_device_id uuid, p_user_agent text default null)
returns text language plpgsql security definer set search_path = public as $$
declare d public.devices; uid uuid := auth.uid();
begin
  if uid is null then return 'blocked'; end if;
  if public.is_admin() then return 'ok'; end if;
  -- accounts the admin has allowed on several devices skip the lock
  if exists (select 1 from public.profiles where id = uid and multi_device) then
    update public.profiles set last_active_at = now() where id = uid
      and (last_active_at is null or last_active_at < now() - interval '5 minutes');
    return 'ok';
  end if;
  select * into d from public.devices where user_id = uid;
  if not found then
    insert into public.devices (user_id, device_id, user_agent) values (uid, p_device_id, left(p_user_agent, 300));
    return 'bound';
  end if;
  if d.device_id = p_device_id then
    if d.last_seen_at < now() - interval '5 minutes' then
      update public.devices set last_seen_at = now() where user_id = uid;
      update public.profiles set last_active_at = now() where id = uid;
    end if;
    return 'ok';
  end if;
  return 'blocked';
end $$;
revoke execute on function public.claim_device(uuid, text) from public, anon;

-- applied remotely together with: enable for the test student + clear its device binding
