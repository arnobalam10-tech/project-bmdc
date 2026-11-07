-- Project BMDC — core schema
-- profiles, devices, payments, settings, curriculum, live sessions, recordings, notes, activity

create extension if not exists pgcrypto;

-- ───────────── profiles ─────────────
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  role text not null default 'student' check (role in ('student','admin')),
  is_paid boolean not null default false,
  access_expires_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  last_active_at timestamptz
);
alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.has_paid_access(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.profiles p
    where p.id = uid
      and (p.role = 'admin' or (p.is_paid and (p.access_expires_at is null or p.access_expires_at > now())))
  );
$$;

create policy "profiles: read own" on public.profiles for select using (id = auth.uid());
create policy "profiles: admin all" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- students may only change their own name/phone
create or replace function public.update_my_profile(p_full_name text, p_phone text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  update public.profiles
     set full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
         phone = coalesce(nullif(trim(p_phone), ''), phone)
   where id = auth.uid();
end $$;

-- ───────────── devices (one-device lock) ─────────────
create table public.devices (
  user_id uuid primary key references public.profiles on delete cascade,
  device_id uuid not null,
  user_agent text,
  bound_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
alter table public.devices enable row level security;
create policy "devices: read own" on public.devices for select using (user_id = auth.uid());
create policy "devices: admin all" on public.devices for all using (public.is_admin()) with check (public.is_admin());

-- returns 'bound' (first device just bound), 'ok' (same device / admin), or 'blocked'
create or replace function public.claim_device(p_device_id uuid, p_user_agent text default null)
returns text language plpgsql security definer set search_path = public as $$
declare d public.devices; uid uuid := auth.uid();
begin
  if uid is null then return 'blocked'; end if;
  if public.is_admin() then return 'ok'; end if;
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

-- ───────────── payments ─────────────
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  amount integer not null check (amount >= 0),
  trx_id text,
  method text not null default 'bkash',
  paid_on date not null default current_date,
  recorded_by uuid references public.profiles,
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
create policy "payments: read own" on public.payments for select using (user_id = auth.uid());
create policy "payments: admin all" on public.payments for all using (public.is_admin()) with check (public.is_admin());

-- ───────────── settings (public, non-secret) ─────────────
create table public.settings (
  key text primary key,
  value jsonb not null
);
alter table public.settings enable row level security;
create policy "settings: public read" on public.settings for select using (true);
create policy "settings: admin write" on public.settings for all using (public.is_admin()) with check (public.is_admin());

insert into public.settings (key, value) values
  ('price', '10000'),
  ('offer_price', '8000'),
  ('bkash_number', '"01322654646"'),
  ('whatsapp_number', '"01886688253"'),
  ('batch_start', '"2026-12-01"'),
  ('workshop_at', '"2026-11-20T23:00:00+06:00"'),
  ('default_access_end', '"2027-05-01"'),
  ('facebook_url', '"https://www.facebook.com/profile.php?id=61596008175287"');

-- ───────────── curriculum ─────────────
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort int not null default 0
);
create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects on delete cascade,
  name text not null,
  slug text not null unique,
  sort int not null default 0,
  class_codes text[] not null default '{}',
  unique (subject_id, name)
);
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
create policy "subjects: public read" on public.subjects for select using (true);
create policy "subjects: admin write" on public.subjects for all using (public.is_admin()) with check (public.is_admin());
create policy "chapters: public read" on public.chapters for select using (true);
create policy "chapters: admin write" on public.chapters for all using (public.is_admin()) with check (public.is_admin());

-- ───────────── live sessions ─────────────
create table public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  meet_url text,
  starts_at timestamptz not null,
  duration_min int not null default 90,
  audience text not null default 'paid' check (audience in ('all','paid')),
  created_at timestamptz not null default now()
);
alter table public.live_sessions enable row level security;
create policy "live: admin all" on public.live_sessions for all using (public.is_admin()) with check (public.is_admin());

-- students get sessions through this function; meet_url hidden unless entitled
create or replace function public.get_live_sessions(p_include_past boolean default false)
returns table (id uuid, title text, description text, meet_url text, starts_at timestamptz,
               duration_min int, audience text, locked boolean)
language sql stable security definer set search_path = public as $$
  select s.id, s.title, s.description,
         case when s.audience = 'all' or public.has_paid_access() then s.meet_url else null end,
         s.starts_at, s.duration_min, s.audience,
         not (s.audience = 'all' or public.has_paid_access())
    from public.live_sessions s
   where auth.uid() is not null
     and (p_include_past or s.starts_at + make_interval(mins => s.duration_min) > now())
   order by s.starts_at;
$$;

insert into public.live_sessions (title, description, meet_url, starts_at, duration_min, audience) values
  ('Free workshop: How to pass the BMDC RQE in one attempt',
   'Exam pattern, marking strategy and the 4-month plan with Dr. Nafisa Alam and Dr. Omar.',
   null, '2026-11-20T23:00:00+06:00', 90, 'all');

-- ───────────── recordings ─────────────
create table public.recordings (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters on delete cascade,
  class_code text,
  title text not null,
  sort int not null default 0,
  duration_sec int not null default 0,
  bunny_video_id text,
  is_free_sample boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.recordings enable row level security;
create policy "recordings: signed-in read" on public.recordings for select
  using (auth.uid() is not null and (published or public.is_admin()));
create policy "recordings: admin write" on public.recordings for all using (public.is_admin()) with check (public.is_admin());

create table public.watch_progress (
  user_id uuid not null references public.profiles on delete cascade,
  recording_id uuid not null references public.recordings on delete cascade,
  seconds_watched int not null default 0,
  last_position int not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, recording_id)
);
alter table public.watch_progress enable row level security;
create policy "watch: own" on public.watch_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "watch: admin read" on public.watch_progress for select using (public.is_admin());

-- ───────────── notes ─────────────
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters on delete cascade,
  title text not null,
  storage_path text not null unique,
  page_count int,
  size_bytes bigint,
  sort int not null default 0,
  is_free_sample boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.notes enable row level security;
create policy "notes: signed-in read" on public.notes for select
  using (auth.uid() is not null and (published or public.is_admin()));
create policy "notes: admin write" on public.notes for all using (public.is_admin()) with check (public.is_admin());

create table public.note_views (
  user_id uuid not null references public.profiles on delete cascade,
  note_id uuid not null references public.notes on delete cascade,
  last_viewed_at timestamptz not null default now(),
  primary key (user_id, note_id)
);
alter table public.note_views enable row level security;
create policy "note_views: own" on public.note_views for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- private storage bucket for PDFs
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('notes', 'notes', false, 26214400, array['application/pdf'])
on conflict (id) do nothing;

create policy "notes bucket: entitled read" on storage.objects for select using (
  bucket_id = 'notes' and (
    public.is_admin() or exists (
      select 1 from public.notes n
       where n.storage_path = storage.objects.name and n.published
         and (n.is_free_sample or public.has_paid_access())
    )
  )
);
create policy "notes bucket: admin insert" on storage.objects for insert with check (bucket_id = 'notes' and public.is_admin());
create policy "notes bucket: admin update" on storage.objects for update using (bucket_id = 'notes' and public.is_admin());
create policy "notes bucket: admin delete" on storage.objects for delete using (bucket_id = 'notes' and public.is_admin());

-- ───────────── daily activity (streaks) ─────────────
create table public.daily_activity (
  user_id uuid not null references public.profiles on delete cascade,
  day date not null,
  mcq_count int not null default 0,
  watch_seconds int not null default 0,
  primary key (user_id, day)
);
alter table public.daily_activity enable row level security;
create policy "activity: read own" on public.daily_activity for select using (user_id = auth.uid() or public.is_admin());

create or replace function public.bump_activity(p_mcq int default 0, p_watch int default 0)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  insert into public.daily_activity (user_id, day, mcq_count, watch_seconds)
  values (auth.uid(), (now() at time zone 'Asia/Dhaka')::date, greatest(p_mcq,0), greatest(p_watch,0))
  on conflict (user_id, day) do update
    set mcq_count = daily_activity.mcq_count + greatest(p_mcq,0),
        watch_seconds = daily_activity.watch_seconds + greatest(p_watch,0);
end $$;

create or replace function public.record_watch(p_recording_id uuid, p_seconds int, p_position int, p_completed boolean)
returns void language plpgsql security definer set search_path = public as $$
declare s int := least(greatest(p_seconds, 0), 60);
begin
  if auth.uid() is null then return; end if;
  insert into public.watch_progress (user_id, recording_id, seconds_watched, last_position, completed)
  values (auth.uid(), p_recording_id, s, greatest(p_position,0), coalesce(p_completed,false))
  on conflict (user_id, recording_id) do update
    set seconds_watched = watch_progress.seconds_watched + s,
        last_position = greatest(p_position,0),
        completed = watch_progress.completed or coalesce(p_completed,false),
        updated_at = now();
  perform public.bump_activity(0, s);
end $$;
