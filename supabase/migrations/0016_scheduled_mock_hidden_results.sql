-- Scheduled mock tests with hidden results (first one: Project BMDC Free Mock Test, opens 22 Nov 2026 7 PM BST).
--   opens_at              : nobody but admins can start it before this time
--   hide_results          : one exam attempt per student; submitting stores the answers only (no score, no
--                           right/wrong marks), so nothing can be read back until results are published
--   results_published_at  : set by publish_mock_results(), which scores every attempt; then the normal
--                           result page, review, My mistakes and a per-test leaderboard switch on

alter table public.question_sets
  add column if not exists opens_at timestamptz,
  add column if not exists hide_results boolean not null default false,
  add column if not exists results_published_at timestamptz;

create or replace function public.results_hidden(p_set_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.question_sets where id = p_set_id and hide_results and results_published_at is null);
$$;

-- not open before opens_at (admins can preview)
create or replace function public.can_open_set(p_set_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.question_sets s
     where s.id = p_set_id and s.published
       and (s.opens_at is null or s.opens_at <= now() or public.is_admin())
       and (s.is_free_sample or public.has_paid_access() or s.free_count > 0)
  );
$$;

create or replace function public.start_attempt(p_set_id uuid, p_mode text)
returns uuid language plpgsql security definer set search_path = public as $$
declare a_id uuid; s public.question_sets; n int; v_full boolean; v_limit int; v_n int; v_minutes int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_mode not in ('practice','exam') then raise exception 'bad mode'; end if;
  if not public.can_open_set(p_set_id) then raise exception 'locked'; end if;
  select * into s from public.question_sets where id = p_set_id;
  select count(*) into n from public.question_set_items where set_id = p_set_id;

  -- hidden-result mocks: exam only, one attempt each (a returning student gets their attempt back)
  if s.hide_results then
    if p_mode <> 'exam' then raise exception 'exam only'; end if;
    select id into a_id from public.attempts
     where user_id = auth.uid() and set_id = p_set_id and mode = 'exam'
     order by started_at desc limit 1;
    if a_id is not null then return a_id; end if;
  end if;

  v_full := s.is_free_sample or public.has_paid_access();
  v_limit := case when v_full then null else least(s.free_count, n) end;
  if not v_full and coalesce(v_limit, 0) = 0 then raise exception 'locked'; end if;
  v_n := coalesce(v_limit, n);
  v_minutes := case when v_limit is null then greatest(s.duration_min, 1)
                    else greatest(1, ceil(greatest(s.duration_min, 1)::numeric * v_limit / greatest(n, 1))::int) end;

  if p_mode = 'exam' then
    select id into a_id from public.attempts
     where user_id = auth.uid() and set_id = p_set_id and mode = 'exam' and submitted_at is null
       and deadline_at + interval '30 seconds' > now()
       and free_limit is not distinct from v_limit
     order by started_at desc limit 1;
    if a_id is not null then return a_id; end if;
  end if;

  insert into public.attempts (user_id, set_id, mode, n_questions, deadline_at, free_limit)
  values (auth.uid(), p_set_id, p_mode, v_n,
          case when p_mode = 'exam' then now() + make_interval(mins => v_minutes) end, v_limit)
  returning id into a_id;
  return a_id;
end $$;

-- marks every statement of one attempt and stores the score (does not touch submitted_at)
create or replace function public.score_attempt(p_attempt_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare a public.attempts; c int; w int;
begin
  select * into a from public.attempts where id = p_attempt_id;
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
   where i.set_id = a.set_id and (a.free_limit is null or i.position <= a.free_limit);
  update public.attempts
     set n_correct = c, n_wrong = w, n_blank = a.n_questions * 4 - c - w, score = round(c * 0.25 - w * 0.06, 2)
   where id = a.id;
end $$;

create or replace function public.submit_attempt(p_attempt_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare a public.attempts; answered_q int;
begin
  select * into a from public.attempts where id = p_attempt_id;
  if not found or (a.user_id <> auth.uid() and not public.is_admin()) then raise exception 'not found'; end if;
  if a.submitted_at is not null then
    if public.results_hidden(a.set_id) then return jsonb_build_object('hidden', true); end if;
    return jsonb_build_object('score', a.score, 'n_correct', a.n_correct, 'n_wrong', a.n_wrong, 'n_blank', a.n_blank);
  end if;

  select count(distinct question_id) into answered_q from public.attempt_answers
   where attempt_id = a.id and answer is not null and not checked;

  if public.results_hidden(a.set_id) then
    -- answers stay unmarked until the results are published
    update public.attempts set submitted_at = least(now(), coalesce(a.deadline_at + interval '30 seconds', now()))
     where id = a.id;
  else
    perform public.score_attempt(a.id);
    update public.attempts set submitted_at = now() where id = a.id;
  end if;

  if a.mode = 'exam' and answered_q > 0 and a.user_id = auth.uid() then
    perform public.bump_activity(answered_q, 0);
  end if;
  if public.results_hidden(a.set_id) then return jsonb_build_object('hidden', true); end if;
  select * into a from public.attempts where id = p_attempt_id;
  return jsonb_build_object('score', a.score, 'n_correct', a.n_correct, 'n_wrong', a.n_wrong, 'n_blank', a.n_blank);
end $$;

create or replace function public.get_attempt(p_attempt_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare a public.attempts; s public.question_sets; reveal_all boolean; hidden boolean; result jsonb; total int;
begin
  select * into a from public.attempts where id = p_attempt_id;
  if not found or (a.user_id <> auth.uid() and not public.is_admin()) then raise exception 'not found'; end if;
  select * into s from public.question_sets where id = a.set_id;
  select count(*) into total from public.question_set_items where set_id = a.set_id;

  if a.mode = 'exam' and a.submitted_at is null and now() > a.deadline_at + interval '30 seconds' then
    perform public.submit_attempt(p_attempt_id);
    select * into a from public.attempts where id = p_attempt_id;
  end if;
  hidden := s.hide_results and s.results_published_at is null;
  reveal_all := a.submitted_at is not null and not hidden;

  select jsonb_build_object(
    'attempt', to_jsonb(a) || jsonb_build_object('server_now', now()),
    'set', jsonb_build_object('id', s.id, 'title', s.title, 'kind', s.kind, 'duration_min', s.duration_min,
                              'total_questions', total, 'hide_results', s.hide_results,
                              'results_published_at', s.results_published_at),
    'results_hidden', hidden and a.submitted_at is not null,
    'locked_count', case when a.free_limit is null then 0 else greatest(total - a.free_limit, 0) end,
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
      where i.set_id = a.set_id and (a.free_limit is null or i.position <= a.free_limit)), '[]'::jsonb)
  ) into result;
  return result;
end $$;

-- the general leaderboard never counts hidden-result mocks (they get their own board) or unscored attempts
create or replace function public.get_leaderboard(p_limit integer default 20)
returns table(rank bigint, user_id uuid, display_name text, best_pct numeric, exams integer, is_me boolean)
language sql stable security definer set search_path = public as $$
  with best as (
    select a.user_id, a.set_id, max(100.0 * a.score / nullif(a.n_questions,0)) pct
      from public.attempts a
      join public.question_sets s on s.id = a.set_id and s.kind in ('model','pyq') and not s.hide_results
     where a.mode = 'exam' and a.submitted_at is not null and a.score is not null
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

create or replace function public.get_my_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare uid uuid := auth.uid(); streak int := 0; d date := (now() at time zone 'Asia/Dhaka')::date;
begin
  if uid is null then return null; end if;
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
       where a.user_id = uid and a.mode = 'exam' and a.submitted_at is not null and a.score is not null), '[]'::jsonb)
  );
end $$;

-- admin: live results (scored on the fly from the stored answers, so answer-key fixes apply immediately)
create or replace function public.admin_mock_results(p_set_id uuid)
returns table(user_id uuid, attempt_id uuid, full_name text, email text, phone text, paid boolean,
              started_at timestamptz, submitted_at timestamptz, minutes int,
              n_correct int, n_wrong int, n_blank int, score numeric, pct numeric, rank bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admins only'; end if;
  return query
  with att as (
    select distinct on (a.user_id) a.* from public.attempts a
     where a.set_id = p_set_id and a.mode = 'exam'
     order by a.user_id, a.started_at
  ), marks as (
    select att.id,
           count(*) filter (where aa.answer is not null and aa.answer = o.is_true)::int c,
           count(*) filter (where aa.answer is not null and aa.answer <> o.is_true)::int w
      from att
      join public.question_set_items i on i.set_id = att.set_id and (att.free_limit is null or i.position <= att.free_limit)
      join public.question_options o on o.question_id = i.question_id
      left join public.attempt_answers aa on aa.attempt_id = att.id and aa.option_id = o.id
     group by att.id
  ), x as (
    select att.user_id, att.id aid, p.full_name, p.email, p.phone, public.has_paid_access(p.id) paid,
           att.started_at, coalesce(att.submitted_at, case when now() > att.deadline_at + interval '30 seconds' then att.deadline_at end) sub,
           m.c, m.w, att.n_questions * 4 - m.c - m.w b, round(m.c * 0.25 - m.w * 0.06, 2) sc, att.n_questions nq
      from att join marks m on m.id = att.id join public.profiles p on p.id = att.user_id
  )
  select x.user_id, x.aid, x.full_name, x.email, x.phone, x.paid, x.started_at, x.sub,
         case when x.sub is null then null else greatest(0, round(extract(epoch from (x.sub - x.started_at)) / 60))::int end,
         x.c, x.w, x.b, x.sc, round(100.0 * x.sc / nullif(x.nq, 0), 1),
         case when x.sub is null then null else rank() over (partition by x.sub is not null order by x.sc desc) end
    from x
   order by x.sub is null, x.sc desc, x.sub;
end $$;

-- admin: score every attempt and publish (safe to run again after fixing the answer key)
create or replace function public.publish_mock_results(p_set_id uuid)
returns int language plpgsql security definer set search_path = public as $$
declare r record; n int := 0;
begin
  if not public.is_admin() then raise exception 'admins only'; end if;
  -- close attempts whose time ran out without a submit
  update public.attempts set submitted_at = deadline_at
   where set_id = p_set_id and mode = 'exam' and submitted_at is null and now() > deadline_at + interval '30 seconds';
  for r in select id from public.attempts where set_id = p_set_id and submitted_at is not null loop
    perform public.score_attempt(r.id);   -- wrong answers flow into My mistakes through the attempt_answers trigger
    n := n + 1;
  end loop;
  update public.question_sets set results_published_at = coalesce(results_published_at, now()) where id = p_set_id;
  return n;
end $$;

-- per-test leaderboard, only once results are published
create or replace function public.get_set_leaderboard(p_set_id uuid, p_limit int default 50)
returns table(rank bigint, display_name text, score numeric, pct numeric, is_me boolean, total bigint)
language sql stable security definer set search_path = public as $$
  with best as (
    select distinct on (a.user_id) a.user_id, a.score, a.n_questions, a.submitted_at - a.started_at took
      from public.attempts a
     where a.set_id = p_set_id and a.mode = 'exam' and a.submitted_at is not null and a.score is not null
     order by a.user_id, a.started_at
  ), ranked as (
    select rank() over (order by b.score desc, b.took) r, count(*) over () t, b.*,
           'Dr. ' || split_part(trim(p.full_name), ' ', 1) ||
             case when position(' ' in trim(p.full_name)) > 0
                  then ' ' || left(split_part(trim(p.full_name), ' ', array_length(string_to_array(trim(p.full_name), ' '), 1)), 1) || '.'
                  else '' end dn
      from best b join public.profiles p on p.id = b.user_id
     where p.role = 'student'
  )
  select r, dn, score, round(100.0 * score / nullif(n_questions, 0), 1), user_id = auth.uid(), t
    from ranked
   where auth.uid() is not null
     and exists (select 1 from public.question_sets s where s.id = p_set_id and s.results_published_at is not null)
     and (r <= p_limit or user_id = auth.uid())
   order by r;
$$;

revoke execute on function public.results_hidden(uuid), public.score_attempt(uuid) from public, anon, authenticated;
revoke execute on function public.admin_mock_results(uuid), public.publish_mock_results(uuid),
  public.get_set_leaderboard(uuid, int) from public, anon;
grant execute on function public.admin_mock_results(uuid), public.publish_mock_results(uuid),
  public.get_set_leaderboard(uuid, int) to authenticated;
