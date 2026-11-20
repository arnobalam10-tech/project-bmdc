-- Flashcards are for paid students only: unpaid users get no cards.
create or replace function public.flashcard_free_count() returns int language sql immutable as $$ select 0 $$;
