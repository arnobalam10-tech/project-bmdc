-- Free accounts get the first N questions of every set (question_sets.free_count); the rest stay locked
-- server-side: start_attempt stores attempts.free_limit, and get_attempt / check_practice_question /
-- save_exam_answers never return or accept questions beyond it.
-- Defaults: 2 per set; May 2025 = 10. Owner can change per set in Admin → MCQ sets.
-- (Applied remotely via MCP on 2026-11-08. Function bodies = 0002 versions plus the free_limit checks:
--  can_open_set allows free_count > 0; start_attempt sets free_limit = least(free_count, n) for non-paid
--  users and scales exam minutes; get_attempt filters position <= free_limit and returns locked_count and
--  set.total_questions; check/save reject positions > free_limit.)
alter table public.question_sets add column if not exists free_count int not null default 2 check (free_count >= 0);
alter table public.attempts add column if not exists free_limit int;
update public.question_sets set free_count = 2 where kind in ('topic','pyq','model');
update public.question_sets set free_count = 10 where ext_id = 'pyq-2025-may';
