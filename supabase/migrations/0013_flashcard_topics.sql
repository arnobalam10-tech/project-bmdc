-- Flashcards as topic revision cards, not MCQs: front = a topic ("Causes of exudative ascites"),
-- back = the correct points merged from every MCQ on that topic + the teaching pearls.
-- Built by scripts/build_flashcards.py from the question bank; wrong options never appear.

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  position int not null,
  title text not null,
  points text[] not null default '{}',
  notes text[] not null default '{}',
  years int[] not null default '{}',
  question_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists flashcards_chapter_idx on public.flashcards (chapter_id, position);
alter table public.flashcards enable row level security;
-- no table policies: students read cards only through the RPCs below

-- free users see this many cards per deck
create or replace function public.flashcard_free_count() returns int language sql immutable as $$ select 10 $$;

create or replace function public.get_topic_decks()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'chapter_id', c.id, 'chapter', c.name, 'slug', c.slug, 'subject', sub.name,
      'total', x.total,
      'open', case when public.has_paid_access() then x.total else least(x.total, public.flashcard_free_count()) end
    ) order by sub.sort, c.sort), '[]'::jsonb)
  from public.chapters c
  join public.subjects sub on sub.id = c.subject_id
  cross join lateral (select count(*)::int as total from public.flashcards f where f.chapter_id = c.id) x
  where x.total > 0;
$$;

create or replace function public.get_topic_cards(p_chapter_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare lim int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  lim := case when public.has_paid_access() then null else public.flashcard_free_count() end;
  return jsonb_build_object(
    'deck', (select jsonb_build_object('chapter_id', c.id, 'chapter', c.name, 'subject', sub.name,
                    'total', (select count(*) from public.flashcards where chapter_id = c.id))
               from public.chapters c join public.subjects sub on sub.id = c.subject_id where c.id = p_chapter_id),
    'cards', coalesce((
      select jsonb_agg(jsonb_build_object('id', f.id, 'title', f.title, 'points', f.points, 'notes', f.notes, 'years', f.years)
                       order by f.position)
        from public.flashcards f
       where f.chapter_id = p_chapter_id and (lim is null or f.position <= lim)), '[]'::jsonb));
end $$;

revoke execute on function public.get_topic_decks() from public, anon;
revoke execute on function public.get_topic_cards(uuid) from public, anon;
grant execute on function public.get_topic_decks(), public.get_topic_cards(uuid) to authenticated;

-- the old MCQ-based get_flashcard_decks/get_flashcards stay until the new UI is live; drop them afterwards
