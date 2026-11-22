-- Dummy entries on the model-test leaderboards. Not real accounts: they never appear in Students,
-- Payments or stats. Students see them as normal rows; only admins get is_dummy = true.
create table if not exists public.mock_dummy_results (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.question_sets(id) on delete cascade,
  full_name text not null,
  n_correct int not null,
  n_wrong int not null,
  n_blank int not null,
  score numeric not null,
  took interval not null,
  created_at timestamptz not null default now()
);
alter table public.mock_dummy_results enable row level security;
create policy "dummy results: admin all" on public.mock_dummy_results for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.leaderboard_name(n text) returns text language sql immutable as $f$
  select 'Dr. ' || split_part(trim(n), ' ', 1) ||
         case when position(' ' in trim(n)) > 0
              then ' ' || left(split_part(trim(n), ' ', array_length(string_to_array(trim(n), ' '), 1)), 1) || '.'
              else '' end
$f$;

drop function if exists public.get_set_leaderboard(uuid, int);
create function public.get_set_leaderboard(p_set_id uuid, p_limit int default 50)
returns table(rank bigint, display_name text, score numeric, pct numeric, is_me boolean, total bigint, is_dummy boolean)
language sql stable security definer set search_path = public as $$
  with best as (
    select distinct on (a.user_id) a.user_id, a.score, a.n_questions, a.submitted_at - a.started_at took,
           public.leaderboard_name(p.full_name) dn, false dummy
      from public.attempts a join public.profiles p on p.id = a.user_id
     where a.set_id = p_set_id and a.mode = 'exam' and a.submitted_at is not null and a.score is not null and p.role = 'student'
     order by a.user_id, a.started_at
  ), allrows as (
    select * from best
    union all
    select null, d.score, (select count(*)::int from public.question_set_items where set_id = d.set_id), d.took,
           public.leaderboard_name(d.full_name), true
      from public.mock_dummy_results d where d.set_id = p_set_id
  ), ranked as (
    select rank() over (order by score desc, took) r, count(*) over () t, allrows.* from allrows
  )
  select r, dn, score, round(100.0 * score / nullif(n_questions, 0), 1), coalesce(user_id = auth.uid(), false), t,
         dummy and public.is_admin()
    from ranked
   where auth.uid() is not null and (r <= p_limit or user_id = auth.uid())
   order by r;
$$;
revoke execute on function public.get_set_leaderboard(uuid, int) from public, anon;
grant execute on function public.get_set_leaderboard(uuid, int) to authenticated;

create or replace function public.get_public_mock_leaderboard(p_limit int default 100)
returns jsonb language sql stable security definer set search_path = public as $$
  with s as (
    select id, title, opens_at, (select count(*) from public.question_set_items where set_id = qs.id) n
      from public.question_sets qs
     where hide_results and published and opens_at <= now()
     order by opens_at desc limit 1
  ), best as (
    select distinct on (a.user_id) a.user_id, a.score, a.n_questions, a.submitted_at - a.started_at took,
           public.leaderboard_name(p.full_name) dn, false dummy
      from public.attempts a join s on s.id = a.set_id join public.profiles p on p.id = a.user_id
     where a.mode = 'exam' and a.submitted_at is not null and a.score is not null and p.role = 'student'
     order by a.user_id, a.started_at
  ), allrows as (
    select score, n_questions, took, dn, dummy from best
    union all
    select d.score, s.n::int, d.took, public.leaderboard_name(d.full_name), true
      from public.mock_dummy_results d join s on s.id = d.set_id
  ), ranked as (
    select rank() over (order by score desc, took) r, * from allrows
  )
  select jsonb_build_object(
    'set', (select jsonb_build_object('title', title, 'questions', n, 'opens_at', opens_at) from s),
    'total', (select count(*) from ranked),
    'rows', coalesce((select jsonb_agg(jsonb_build_object('rank', r, 'name', dn, 'score', score,
                                                          'pct', round(100.0 * score / nullif(n_questions, 0), 1),
                                                          'dummy', dummy and public.is_admin()) order by r)
                        from (select * from ranked order by r limit p_limit) x), '[]'::jsonb));
$$;
grant execute on function public.get_public_mock_leaderboard(int) to anon, authenticated;

-- the 25 dummy results for the free mock (scores sit between the real top 10 and the bottom)
insert into public.mock_dummy_results (set_id, full_name, n_correct, n_wrong, n_blank, score, took)
select '9f5f4b40-82ab-4c17-97d8-9c7d35787e81', v.* from (values
  ('Sumaiya Khan', 262, 126, 12, 57.94, interval '61 minutes'),
  ('Farzana Akter', 256, 144, 0, 55.36, interval '88 minutes'),
  ('Lamia Sultana', 266, 134, 0, 58.46, interval '94 minutes'),
  ('Sabbir Rahman', 256, 140, 4, 55.6, interval '88 minutes'),
  ('Imran Kabir', 252, 148, 0, 54.12, interval '98 minutes'),
  ('তাহমিদ হাসান', 241, 159, 0, 50.71, interval '83 minutes'),
  ('sleepydoc404', 241, 147, 12, 51.43, interval '99 minutes'),
  ('Rakibul Islam', 248, 152, 0, 52.88, interval '61 minutes'),
  ('Arif Hossain', 261, 139, 0, 56.91, interval '98 minutes'),
  ('Ishrat Jahan', 248, 148, 4, 53.12, interval '77 minutes'),
  ('Sadia Rahman', 261, 139, 0, 56.91, interval '83 minutes'),
  ('Shakil Mahmud', 270, 130, 0, 59.7, interval '72 minutes'),
  ('Tanvir Ahmed', 240, 152, 8, 50.88, interval '85 minutes'),
  ('মাহমুদুল হক', 271, 129, 0, 60.01, interval '90 minutes'),
  ('Rumana Begum', 264, 124, 12, 58.56, interval '77 minutes'),
  ('nightowl_md22', 255, 145, 0, 55.05, interval '98 minutes'),
  ('Nabila Haque', 263, 137, 0, 57.53, interval '86 minutes'),
  ('Mehedi Hasan', 265, 131, 4, 58.39, interval '98 minutes'),
  ('stetho_queen7', 255, 137, 8, 55.53, interval '84 minutes'),
  ('সাবরিনা আক্তার', 260, 136, 4, 56.84, interval '66 minutes'),
  ('Tasnim Chowdhury', 252, 148, 0, 54.12, interval '65 minutes'),
  ('bubblegum3451', 255, 133, 12, 55.77, interval '91 minutes'),
  ('রাইসা ইসলাম', 256, 144, 0, 55.36, interval '98 minutes'),
  ('cardiac.kid09', 249, 151, 0, 53.19, interval '91 minutes'),
  ('ফারহানা রহমান', 250, 146, 4, 53.74, interval '92 minutes')
) v(full_name, n_correct, n_wrong, n_blank, score, took)
where not exists (select 1 from public.mock_dummy_results where set_id = '9f5f4b40-82ab-4c17-97d8-9c7d35787e81');
