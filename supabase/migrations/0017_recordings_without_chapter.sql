-- Recordings that don't belong to a chapter (orientation, introductions) are shown first under "Start here".
alter table public.recordings alter column chapter_id drop not null;
