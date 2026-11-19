-- New topic flashcards are live; the MCQ-based flashcard RPCs from 0012 are no longer used.
drop function if exists public.get_flashcard_decks();
drop function if exists public.get_flashcards(uuid);
