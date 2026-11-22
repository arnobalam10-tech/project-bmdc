-- Hidden-result mocks: the score and the per-test leaderboard show right after submitting;
-- only the correct answers (right/wrong marks, explanations, review, My mistakes) wait until the admin reveals them.
-- Scoring without marking: attempt_answers.is_correct stays null (students can read their own rows, so a mark
-- would give the answer away); attempts.score / n_correct / n_wrong are filled in.

drop function if exists public.score_attempt(uuid);
create or replace function public.score_attempt(p_attempt_id uuid, p_mark boolean default true)
returns void language plpgsql security definer set search_path = public as $$
declare a public.attempts; c int; w int;
begin
  select * into a from public.attempts where id = p_attempt_id;
  if p_mark then
    update public.attempt_answers aa set is_correct = (aa.answer = o.is_true)
      from public.question_options o
     where aa.attempt_id = a.id and o.id = aa.option_id and aa.answer is not null;
    update public.attempt_answers set is_correct = null where attempt_id = a.id and answer is null;
  end if;
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
revoke execute on function public.score_attempt(uuid, boolean) from public, anon, authenticated;

create or replace function public.submit_attempt(p_attempt_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare a public.attempts; answered_q int; hidden boolean;
begin
  select * into a from public.attempts where id = p_attempt_id;
  if not found or (a.user_id <> auth.uid() and not public.is_admin()) then raise exception 'not found'; end if;
  hidden := public.results_hidden(a.set_id);
  if a.submitted_at is null then
    select count(distinct question_id) into answered_q from public.attempt_answers
     where attempt_id = a.id and answer is not null and not checked;
    perform public.score_attempt(a.id, not hidden);   -- hidden mocks: score only, answers stay unmarked
    update public.attempts
       set submitted_at = case when hidden then least(now(), coalesce(a.deadline_at + interval '30 seconds', now())) else now() end
     where id = a.id;
    if a.mode = 'exam' and answered_q > 0 and a.user_id = auth.uid() then
      perform public.bump_activity(answered_q, 0);
    end if;
  end if;
  select * into a from public.attempts where id = p_attempt_id;
  return jsonb_build_object('score', a.score, 'n_correct', a.n_correct, 'n_wrong', a.n_wrong, 'n_blank', a.n_blank,
                            'answers_hidden', hidden);
end $$;

-- the per-test leaderboard is visible as soon as people submit
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
   where auth.uid() is not null and (r <= p_limit or user_id = auth.uid())
   order by r;
$$;
