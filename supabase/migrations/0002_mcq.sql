-- Project BMDC — MCQ engine (RQE True/False only)
-- Students never read question_options.is_true / explanation directly.
-- All answer checking and scoring happens in security-definer functions.

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  ext_id text not null unique,
  stem text not null,
  subject_id uuid references public.subjects on delete set null,
  chapter_id uuid references public.chapters on delete set null,
  pyq_year int,
  pyq_session text,
  pearl text,
  created_at timestamptz not null default now()
);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions on delete cascade,
  label char(1) not null check (label in ('A','B','C','D')),
  text text not null,
  is_true boolean not null,
  explanation text,
  unique (question_id, label)
);

create table public.question_sets (
  id uuid primary key default gen_random_uuid(),
  ext_id text not null unique,
  kind text not null check (kind in ('pyq','model','topic')),
  title text not null,
  subject_id uuid references public.subjects on delete set null,
  chapter_id uuid references public.chapters on delete set null,
  pyq_year int,
  pyq_session text,
  duration_min int not null default 60,
  is_free_sample boolean not null default false,
  published boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table public.question_set_items (
  set_id uuid not null references public.question_sets on delete cascade,
  question_id uuid not null references public.questions on delete cascade,
  position int not null,
  primary key (set_id, question_id)
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  set_id uuid not null references public.question_sets on delete cascade,
  mode text not null check (mode in ('practice','exam')),
  started_at timestamptz not null default now(),
  deadline_at timestamptz,
  submitted_at timestamptz,
  n_questions int not null default 0,
  score numeric(7,2),
  n_correct int,
  n_wrong int,
  n_blank int
);
create index on public.attempts (user_id, started_at desc);

create table public.attempt_answers (
  attempt_id uuid not null references public.attempts on delete cascade,
  question_id uuid not null references public.questions on delete cascade,
  option_id uuid not null references public.question_options on delete cascade,
  answer boolean,
  is_correct boolean,
  checked boolean not null default false,
  primary key (attempt_id, option_id)
);

create table public.attempt_flags (
  attempt_id uuid not null references public.attempts on delete cascade,
  question_id uuid not null references public.questions on delete cascade,
  primary key (attempt_id, question_id)
);

alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_sets enable row level security;
alter table public.question_set_items enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.attempt_flags enable row level security;

-- metadata readable by signed-in users (so locked sets can be listed); options are admin-only
create policy "q: signed-in read" on public.questions for select using (auth.uid() is not null);
create policy "q: admin write" on public.questions for all using (public.is_admin()) with check (public.is_admin());
create policy "qo: admin only" on public.question_options for all using (public.is_admin()) with check (public.is_admin());
create policy "qs: signed-in read" on public.question_sets for select using (auth.uid() is not null and (published or public.is_admin()));
create policy "qs: admin write" on public.question_sets for all using (public.is_admin()) with check (public.is_admin());
create policy "qsi: signed-in read" on public.question_set_items for select using (auth.uid() is not null);
create policy "qsi: admin write" on public.question_set_items for all using (public.is_admin()) with check (public.is_admin());
create policy "attempts: read own" on public.attempts for select using (user_id = auth.uid() or public.is_admin());
create policy "aa: read own" on public.attempt_answers for select using (
  exists (select 1 from public.attempts a where a.id = attempt_id and (a.user_id = auth.uid() or public.is_admin())));
create policy "af: read own" on public.attempt_flags for select using (
  exists (select 1 from public.attempts a where a.id = attempt_id and a.user_id = auth.uid()));

-- ───────────── helpers ─────────────
create or replace function public.can_open_set(p_set_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.question_sets s
     where s.id = p_set_id and s.published and (s.is_free_sample or public.has_paid_access())
  );
$$;

-- rebuild one topic set per chapter from chapter tags (keeps is_free_sample on existing sets)
create or replace function public.refresh_topic_sets()
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.question_sets (ext_id, kind, title, subject_id, chapter_id, duration_min, sort)
  select 'topic-' || c.slug, 'topic', c.name, c.subject_id, c.id, 0, c.sort
    from public.chapters c
   where exists (select 1 from public.questions q where q.chapter_id = c.id)
  on conflict (ext_id) do update set title = excluded.title, subject_id = excluded.subject_id, chapter_id = excluded.chapter_id;

  delete from public.question_set_items i using public.question_sets s
   where i.set_id = s.id and s.kind = 'topic';

  insert into public.question_set_items (set_id, question_id, position)
  select s.id, q.id, row_number() over (partition by s.id order by q.pyq_year desc nulls last, q.ext_id)
    from public.question_sets s join public.questions q on q.chapter_id = s.chapter_id
   where s.kind = 'topic';

  -- topic sets: ~1 minute per question in exam mode
  update public.question_sets s
     set duration_min = greatest(5, (select count(*) from public.question_set_items i where i.set_id = s.id))
   where s.kind = 'topic';
end $$;

-- ───────────── start an attempt ─────────────
create or replace function public.start_attempt(p_set_id uuid, p_mode text)
returns uuid language plpgsql security definer set search_path = public as $$
declare a_id uuid; s public.question_sets; n int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_mode not in ('practice','exam') then raise exception 'bad mode'; end if;
  if not public.can_open_set(p_set_id) then raise exception 'locked'; end if;
  select * into s from public.question_sets where id = p_set_id;
  select count(*) into n from public.question_set_items where set_id = p_set_id;

  -- resume an unfinished exam on the same set
  if p_mode = 'exam' then
    select id into a_id from public.attempts
     where user_id = auth.uid() and set_id = p_set_id and mode = 'exam' and submitted_at is null
       and deadline_at + interval '30 seconds' > now()
     order by started_at desc limit 1;
    if a_id is not null then return a_id; end if;
  end if;

  insert into public.attempts (user_id, set_id, mode, n_questions, deadline_at)
  values (auth.uid(), p_set_id, p_mode, n,
          case when p_mode = 'exam' then now() + make_interval(mins => greatest(s.duration_min, 1)) end)
  returning id into a_id;
  return a_id;
end $$;

-- ───────────── load an attempt (no answers unless allowed) ─────────────
create or replace function public.get_attempt(p_attempt_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare a public.attempts; s public.question_sets; reveal_all boolean; result jsonb;
begin
  select * into a from public.attempts where id = p_attempt_id;
  if not found or (a.user_id <> auth.uid() and not public.is_admin()) then raise exception 'not found'; end if;
  select * into s from public.question_sets where id = a.set_id;

  -- auto-submit expired exams
  if a.mode = 'exam' and a.submitted_at is null and now() > a.deadline_at + interval '30 seconds' then
    perform public.submit_attempt(p_attempt_id);
    select * into a from public.attempts where id = p_attempt_id;
  end if;
  reveal_all := a.submitted_at is not null;

  select jsonb_build_object(
    'attempt', to_jsonb(a) || jsonb_build_object('server_now', now()),
    'set', jsonb_build_object('id', s.id, 'title', s.title, 'kind', s.kind, 'duration_min', s.duration_min),
    'flags', coalesce((select jsonb_agg(f.question_id) from public.attempt_flags f where f.attempt_id = a.id), '[]'::jsonb),
    'questions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', q.id, 'position', i.position, 'stem', q.stem,
        'subject', sub.name, 'chapter', ch.name, 'pyq_year', q.pyq_year, 'pyq_session', q.pyq_session,
        'pearl', case when reveal_all or qchecked.checked then q.pearl end,
        'options', (
          select jsonb_agg(jsonb_build_object(
            'id', o.id, 'label', o.label, 'text', o.text,
            'answer', aa.answer,
            'is_true', case when reveal_all or coalesce(aa.checked,false) then o.is_true end,
            'is_correct', case when reveal_all or coalesce(aa.checked,false) then aa.is_correct end,
            'explanation', case when reveal_all or coalesce(aa.checked,false) then o.explanation end
          ) order by o.label)
          from public.question_options o
          left join public.attempt_answers aa on aa.attempt_id = a.id and aa.option_id = o.id
          where o.question_id = q.id)
      ) order by i.position)
      from public.question_set_items i
      join public.questions q on q.id = i.question_id
      left join public.subjects sub on sub.id = q.subject_id
      left join public.chapters ch on ch.id = q.chapter_id
      left join lateral (
        select bool_or(aa2.checked) as checked from public.attempt_answers aa2
         where aa2.attempt_id = a.id and aa2.question_id = q.id) qchecked on true
      where i.set_id = a.set_id), '[]'::jsonb)
  ) into result;
  return result;
end $$;

-- ───────────── practice: check one question ─────────────
-- p_answers: {"<option_id>": true|false|null, ...}
create or replace function public.check_practice_question(p_attempt_id uuid, p_question_id uuid, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare a public.attempts; o record; ans boolean; already boolean;
begin
  select * into a from public.attempts where id = p_attempt_id and user_id = auth.uid();
  if not found or a.mode <> 'practice' or a.submitted_at is not null then raise exception 'invalid attempt'; end if;
  if not exists (select 1 from public.question_set_items where set_id = a.set_id and question_id = p_question_id) then
    raise exception 'question not in set';
  end if;
  select exists(select 1 from public.attempt_answers where attempt_id = a.id and question_id = p_question_id and checked)
    into already;
  if not already then
    for o in select * from public.question_options where question_id = p_question_id loop
      ans := case when p_answers ? o.id::text and jsonb_typeof(p_answers -> o.id::text) = 'boolean'
                  then (p_answers ->> o.id::text)::boolean end;
      insert into public.attempt_answers (attempt_id, question_id, option_id, answer, is_correct, checked)
      values (a.id, p_question_id, o.id, ans, case when ans is null then null else ans = o.is_true end, true)
      on conflict (attempt_id, option_id) do update
        set answer = excluded.answer, is_correct = excluded.is_correct, checked = true;
    end loop;
    perform public.bump_activity(1, 0);
  end if;
  return (
    select jsonb_build_object(
      'pearl', q.pearl,
      'options', jsonb_agg(jsonb_build_object(
        'id', o2.id, 'label', o2.label, 'answer', aa.answer, 'is_true', o2.is_true,
        'is_correct', aa.is_correct, 'explanation', o2.explanation) order by o2.label))
    from public.questions q
    join public.question_options o2 on o2.question_id = q.id
    left join public.attempt_answers aa on aa.attempt_id = a.id and aa.option_id = o2.id
    where q.id = p_question_id
    group by q.pearl
  );
end $$;

-- ───────────── exam: save answers ─────────────
create or replace function public.save_exam_answers(p_attempt_id uuid, p_question_id uuid, p_answers jsonb, p_flagged boolean)
returns void language plpgsql security definer set search_path = public as $$
declare a public.attempts; o record; ans boolean;
begin
  select * into a from public.attempts where id = p_attempt_id and user_id = auth.uid();
  if not found or a.mode <> 'exam' or a.submitted_at is not null then raise exception 'invalid attempt'; end if;
  if now() > a.deadline_at + interval '30 seconds' then raise exception 'time is up'; end if;
  if not exists (select 1 from public.question_set_items where set_id = a.set_id and question_id = p_question_id) then
    raise exception 'question not in set';
  end if;
  for o in select * from public.question_options where question_id = p_question_id loop
    ans := case when p_answers ? o.id::text and jsonb_typeof(p_answers -> o.id::text) = 'boolean'
                then (p_answers ->> o.id::text)::boolean end;
    insert into public.attempt_answers (attempt_id, question_id, option_id, answer)
    values (a.id, p_question_id, o.id, ans)
    on conflict (attempt_id, option_id) do update set answer = excluded.answer;
  end loop;
  if p_flagged then
    insert into public.attempt_flags values (a.id, p_question_id) on conflict do nothing;
  else
    delete from public.attempt_flags where attempt_id = a.id and question_id = p_question_id;
  end if;
end $$;

-- ───────────── submit + RQE scoring ─────────────
-- correct option +0.25, wrong −0.06, blank 0
create or replace function public.submit_attempt(p_attempt_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare a public.attempts; c int; w int; b int; answered_q int;
begin
  select * into a from public.attempts where id = p_attempt_id;
  if not found or (a.user_id <> auth.uid() and not public.is_admin()) then raise exception 'not found'; end if;
  if a.submitted_at is not null then
    return jsonb_build_object('score', a.score, 'n_correct', a.n_correct, 'n_wrong', a.n_wrong, 'n_blank', a.n_blank);
  end if;

  update public.attempt_answers aa set is_correct = (aa.answer = o.is_true)
    from public.question_options o
   where aa.attempt_id = a.id and o.id = aa.option_id and aa.answer is not null;
  update public.attempt_answers set is_correct = null where attempt_id = a.id and answer is null;

  select count(*) filter (where aa.answer is not null and aa.answer = o.is_true),
         count(*) filter (where aa.answer is not null and aa.answer <> o.is_true)
    into c, w
    from public.question_set_items i
    join public.question_options o on o.question_id = i.question_id
    left join public.attempt_answers aa on aa.attempt_id = a.id and aa.option_id = o.id
   where i.set_id = a.set_id;
  b := a.n_questions * 4 - c - w;

  select count(distinct question_id) into answered_q from public.attempt_answers
   where attempt_id = a.id and answer is not null and not checked;

  update public.attempts
     set submitted_at = now(), n_correct = c, n_wrong = w, n_blank = b,
         score = round(c * 0.25 - w * 0.06, 2)
   where id = a.id;
  if a.mode = 'exam' and answered_q > 0 and a.user_id = auth.uid() then
    perform public.bump_activity(answered_q, 0);
  end if;
  return jsonb_build_object('score', round(c * 0.25 - w * 0.06, 2), 'n_correct', c, 'n_wrong', w, 'n_blank', b);
end $$;

-- ───────────── stats & leaderboard ─────────────
create or replace function public.get_my_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); streak int := 0; d date := (now() at time zone 'Asia/Dhaka')::date;
begin
  if uid is null then return null; end if;
  -- streak: consecutive active days ending today (or yesterday)
  if not exists (select 1 from public.daily_activity where user_id = uid and day = d) then d := d - 1; end if;
  while exists (select 1 from public.daily_activity where user_id = uid and day = d) loop
    streak := streak + 1; d := d - 1;
  end loop;

  return jsonb_build_object(
    'streak', streak,
    'questions_done', (select count(distinct aa.question_id) from public.attempt_answers aa
                         join public.attempts a on a.id = aa.attempt_id
                        where a.user_id = uid and aa.answer is not null and (aa.checked or a.submitted_at is not null)),
    'options_correct', (select count(*) from public.attempt_answers aa join public.attempts a on a.id = aa.attempt_id
                         where a.user_id = uid and aa.is_correct),
    'options_answered', (select count(*) from public.attempt_answers aa join public.attempts a on a.id = aa.attempt_id
                          where a.user_id = uid and aa.is_correct is not null),
    'watch_seconds', (select coalesce(sum(seconds_watched),0) from public.watch_progress where user_id = uid),
    'recordings_completed', (select count(*) from public.watch_progress where user_id = uid and completed),
    'notes_viewed', (select count(*) from public.note_views where user_id = uid),
    'subjects', coalesce((
      select jsonb_agg(x order by (x->>'accuracy')::numeric) from (
        select jsonb_build_object('subject', s.name,
                 'answered', count(*),
                 'accuracy', round(100.0 * count(*) filter (where aa.is_correct) / count(*), 1)) x
          from public.attempt_answers aa
          join public.attempts a on a.id = aa.attempt_id
          join public.questions q on q.id = aa.question_id
          join public.subjects s on s.id = q.subject_id
         where a.user_id = uid and aa.is_correct is not null
         group by s.name) t), '[]'::jsonb),
    'exam_history', coalesce((
      select jsonb_agg(jsonb_build_object('at', a.submitted_at, 'title', qs.title, 'score', a.score,
                                          'max', a.n_questions, 'pct', round(100.0 * a.score / nullif(a.n_questions,0), 1))
                       order by a.submitted_at)
        from public.attempts a join public.question_sets qs on qs.id = a.set_id
       where a.user_id = uid and a.mode = 'exam' and a.submitted_at is not null), '[]'::jsonb)
  );
end $$;

-- best exam % per student (paid students only), across model tests + PYQ papers
create or replace function public.get_leaderboard(p_limit int default 20)
returns table (rank bigint, user_id uuid, display_name text, best_pct numeric, exams int, is_me boolean)
language sql stable security definer set search_path = public as $$
  with best as (
    select a.user_id, a.set_id, max(100.0 * a.score / nullif(a.n_questions,0)) pct
      from public.attempts a
      join public.question_sets s on s.id = a.set_id and s.kind in ('model','pyq')
     where a.mode = 'exam' and a.submitted_at is not null
     group by a.user_id, a.set_id
  ), agg as (
    select b.user_id, round(avg(b.pct), 1) avg_pct, count(*)::int n
      from best b join public.profiles p on p.id = b.user_id
     where p.role = 'student' and public.has_paid_access(p.id)
     group by b.user_id
  ), ranked as (
    select rank() over (order by avg_pct desc) r, agg.*,
           'Dr. ' || split_part(trim(p.full_name), ' ', 1) ||
             case when position(' ' in trim(p.full_name)) > 0
                  then ' ' || left(split_part(trim(p.full_name), ' ', array_length(string_to_array(trim(p.full_name), ' '), 1)), 1) || '.'
                  else '' end as dn
      from agg join public.profiles p on p.id = agg.user_id
  )
  select r, ranked.user_id, dn, avg_pct, n, ranked.user_id = auth.uid()
    from ranked
   where auth.uid() is not null and (r <= p_limit or ranked.user_id = auth.uid())
   order by r;
$$;

-- ───────────── admin overview ─────────────
create or replace function public.admin_overview()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return jsonb_build_object(
    'total', (select count(*) from public.profiles where role = 'student'),
    'paid', (select count(*) from public.profiles where role = 'student' and is_paid and (access_expires_at is null or access_expires_at > now())),
    'expired', (select count(*) from public.profiles where role = 'student' and is_paid and access_expires_at <= now()),
    'free', (select count(*) from public.profiles where role = 'student' and not is_paid),
    'today', (select count(*) from public.profiles where role = 'student' and created_at >= date_trunc('day', now() at time zone 'Asia/Dhaka') at time zone 'Asia/Dhaka'),
    'week', (select count(*) from public.profiles where role = 'student' and created_at >= now() - interval '7 days'),
    'revenue', (select coalesce(sum(amount),0) from public.payments),
    'signups_by_day', coalesce((
      select jsonb_agg(jsonb_build_object('day', d, 'count', n) order by d) from (
        select (created_at at time zone 'Asia/Dhaka')::date d, count(*) n
          from public.profiles where role = 'student' and created_at > now() - interval '30 days'
         group by 1) t), '[]'::jsonb)
  );
end $$;
