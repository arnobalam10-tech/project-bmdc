-- Mistakes: every question a student gets wrong (any option marked wrong) in practice or in a submitted exam
-- is logged automatically. Answering all four statements right in the Mistakes tab clears it.
-- Flashcards: one card per MCQ, grouped into topic decks (chapters); the back shows the true/false
-- statements and the pearl. Free accounts see the same free questions as in topic-wise MCQs.

create table if not exists public.mistakes (
  user_id uuid not null references public.profiles on delete cascade,
  question_id uuid not null references public.questions on delete cascade,
  times_wrong int not null default 1,
  first_wrong_at timestamptz not null default now(),
  last_wrong_at timestamptz not null default now(),
  resolved_at timestamptz,
  primary key (user_id, question_id)
);
create index if not exists mistakes_open on public.mistakes (user_id, last_wrong_at desc) where resolved_at is null;
alter table public.mistakes enable row level security;
drop policy if exists "mistakes: read own" on public.mistakes;
create policy "mistakes: read own" on public.mistakes for select using (user_id = auth.uid() or public.is_admin());

-- one row per option fires this; now() is fixed within a transaction, so a question counts once per check/submit
create or replace function public.log_mistake()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.mistakes (user_id, question_id)
  select a.user_id, new.question_id from public.attempts a where a.id = new.attempt_id
  on conflict (user_id, question_id) do update
     set times_wrong = public.mistakes.times_wrong + case when public.mistakes.last_wrong_at = now() then 0 else 1 end,
         last_wrong_at = now(),
         resolved_at = null;
  return null;
end $$;

-- insert (practice check) or the first time an answer becomes wrong (exam submit); re-scoring the same
-- wrong answer (practice "finish" re-runs submit_attempt) does not log it again
drop trigger if exists attempt_answers_log_mistake on public.attempt_answers;
drop trigger if exists attempt_answers_log_mistake_ins on public.attempt_answers;
drop trigger if exists attempt_answers_log_mistake_upd on public.attempt_answers;
create trigger attempt_answers_log_mistake_ins
  after insert on public.attempt_answers
  for each row when (new.is_correct is false)
  execute function public.log_mistake();
create trigger attempt_answers_log_mistake_upd
  after update of is_correct on public.attempt_answers
  for each row when (new.is_correct is false and old.is_correct is distinct from false)
  execute function public.log_mistake();

-- open mistakes, in the same shape as get_attempt questions (answers hidden)
create or replace function public.get_mistakes()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', q.id, 'position', 0, 'stem', q.stem,
      'subject', sub.name, 'chapter', ch.name, 'chapter_id', ch.id,
      'pyq_year', q.pyq_year, 'pyq_session', q.pyq_session, 'pearl', null,
      'times_wrong', m.times_wrong, 'last_wrong_at', m.last_wrong_at,
      'options', (select jsonb_agg(jsonb_build_object(
          'id', o.id, 'label', o.label, 'text', o.text, 'answer', null,
          'is_true', null, 'is_correct', null, 'explanation', null) order by o.label)
        from public.question_options o where o.question_id = q.id)
    ) order by m.last_wrong_at desc), '[]'::jsonb)
  from public.mistakes m
  join public.questions q on q.id = m.question_id
  left join public.subjects sub on sub.id = q.subject_id
  left join public.chapters ch on ch.id = q.chapter_id
  where m.user_id = auth.uid() and m.resolved_at is null;
$$;

-- check one mistake; all four statements right → resolved
create or replace function public.check_mistake(p_question_id uuid, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare n_right int; n_opts int; res jsonb;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if not exists (select 1 from public.mistakes where user_id = auth.uid() and question_id = p_question_id) then
    raise exception 'not a mistake';
  end if;

  with a as (
    select o.id, o.label, o.is_true, o.explanation,
           case when p_answers ? o.id::text and jsonb_typeof(p_answers -> o.id::text) = 'boolean'
                then (p_answers ->> o.id::text)::boolean end as ans
      from public.question_options o where o.question_id = p_question_id)
  select count(*) filter (where ans is not null and ans = is_true), count(*),
         jsonb_agg(jsonb_build_object('id', id, 'label', label, 'answer', ans, 'is_true', is_true,
                   'is_correct', case when ans is null then null else ans = is_true end,
                   'explanation', explanation) order by label)
    into n_right, n_opts, res
    from a;

  if n_right = n_opts then
    update public.mistakes set resolved_at = now() where user_id = auth.uid() and question_id = p_question_id;
  else
    update public.mistakes set last_wrong_at = now(), times_wrong = times_wrong + 1, resolved_at = null
     where user_id = auth.uid() and question_id = p_question_id;
  end if;
  perform public.bump_activity(1, 0);

  return jsonb_build_object('resolved', n_right = n_opts, 'options', res,
                            'pearl', (select pearl from public.questions where id = p_question_id));
end $$;

-- flashcard decks: one per chapter, with the number of cards this user can open
create or replace function public.get_flashcard_decks()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'chapter_id', c.id, 'chapter', c.name, 'slug', c.slug, 'subject', sub.name,
      'total', x.total,
      'open', case when public.has_paid_access() then x.total else least(x.total, s.free_count) end
    ) order by sub.sort, c.sort), '[]'::jsonb)
  from public.chapters c
  join public.subjects sub on sub.id = c.subject_id
  join public.question_sets s on s.chapter_id = c.id and s.kind = 'topic' and s.published
  cross join lateral (select count(*)::int as total from public.question_set_items i where i.set_id = s.id) x
  where x.total > 0;
$$;

-- cards of one deck (answers included: a flashcard shows its answer on the back)
create or replace function public.get_flashcards(p_chapter_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare s public.question_sets; lim int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into s from public.question_sets where chapter_id = p_chapter_id and kind = 'topic' and published;
  if not found then raise exception 'not found'; end if;
  lim := case when public.has_paid_access() then null else s.free_count end;
  return jsonb_build_object(
    'deck', (select jsonb_build_object('chapter_id', c.id, 'chapter', c.name, 'subject', sub.name,
                    'total', (select count(*) from public.question_set_items where set_id = s.id))
               from public.chapters c join public.subjects sub on sub.id = c.subject_id where c.id = p_chapter_id),
    'cards', coalesce((
      select jsonb_agg(jsonb_build_object(
          'id', q.id, 'stem', q.stem, 'pearl', q.pearl, 'pyq_year', q.pyq_year, 'pyq_session', q.pyq_session,
          'options', (select jsonb_agg(jsonb_build_object('label', o.label, 'text', o.text, 'is_true', o.is_true) order by o.label)
                        from public.question_options o where o.question_id = q.id)
        ) order by i.position)
      from public.question_set_items i join public.questions q on q.id = i.question_id
      where i.set_id = s.id and (lim is null or i.position <= lim)), '[]'::jsonb));
end $$;

revoke execute on function public.log_mistake() from public, anon, authenticated;
revoke execute on function public.get_mistakes() from public, anon;
revoke execute on function public.check_mistake(uuid, jsonb) from public, anon;
revoke execute on function public.get_flashcard_decks() from public, anon;
revoke execute on function public.get_flashcards(uuid) from public, anon;
grant execute on function public.get_mistakes(), public.check_mistake(uuid, jsonb),
  public.get_flashcard_decks(), public.get_flashcards(uuid) to authenticated;

-- backfill from answers already given (checked practice questions and submitted exams)
insert into public.mistakes (user_id, question_id, times_wrong, first_wrong_at, last_wrong_at)
select a.user_id, aa.question_id, count(distinct a.id), min(coalesce(a.submitted_at, a.started_at)), max(coalesce(a.submitted_at, a.started_at))
  from public.attempt_answers aa join public.attempts a on a.id = aa.attempt_id
 where aa.is_correct is false and (aa.checked or a.submitted_at is not null)
 group by a.user_id, aa.question_id
on conflict do nothing;
