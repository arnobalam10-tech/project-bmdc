-- Public model-test leaderboard (no login): names are "Dr. First L." only, nothing else about the student.
create or replace function public.get_public_mock_leaderboard(p_limit int default 100)
returns jsonb language sql stable security definer set search_path = public as $$
  with s as (
    select id, title, opens_at, (select count(*) from public.question_set_items where set_id = qs.id) n
      from public.question_sets qs
     where hide_results and published and opens_at <= now()
     order by opens_at desc limit 1
  ), best as (
    select distinct on (a.user_id) a.user_id, a.score, a.n_questions, a.submitted_at - a.started_at took
      from public.attempts a join s on s.id = a.set_id
     where a.mode = 'exam' and a.submitted_at is not null and a.score is not null
     order by a.user_id, a.started_at
  ), ranked as (
    select rank() over (order by b.score desc, b.took) r, b.score, b.n_questions,
           'Dr. ' || split_part(trim(p.full_name), ' ', 1) ||
             case when position(' ' in trim(p.full_name)) > 0
                  then ' ' || left(split_part(trim(p.full_name), ' ', array_length(string_to_array(trim(p.full_name), ' '), 1)), 1) || '.'
                  else '' end dn
      from best b join public.profiles p on p.id = b.user_id
     where p.role = 'student'
  )
  select jsonb_build_object(
    'set', (select jsonb_build_object('title', title, 'questions', n, 'opens_at', opens_at) from s),
    'total', (select count(*) from ranked),
    'rows', coalesce((select jsonb_agg(jsonb_build_object('rank', r, 'name', dn, 'score', score,
                                                          'pct', round(100.0 * score / nullif(n_questions, 0), 1)) order by r)
                        from (select * from ranked order by r limit p_limit) x), '[]'::jsonb));
$$;
grant execute on function public.get_public_mock_leaderboard(int) to anon, authenticated;
