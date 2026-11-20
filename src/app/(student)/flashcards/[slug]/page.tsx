import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { requireUser } from "@/lib/access";
import { getSettings } from "@/lib/settings";
import { BackLink } from "@/components/app/BackLink";
import { FlashcardDeck, type Card } from "@/components/flashcards/FlashcardDeck";
import { EnrollButton } from "@/components/enroll/Enroll";
import { btn } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Flashcards" };

export default async function DeckPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, profile, full } = await requireUser();
  const { data: chapter } = await supabase.from("chapters").select("id, name").eq("slug", slug).maybeSingle();
  if (!chapter) notFound();

  // flashcards are for enrolled students only
  if (!full) {
    return (
      <div>
        <BackLink href="/flashcards" label="Flashcards" />
        <div className="mx-auto max-w-xl rounded-[28px] border border-b2-border bg-b2-dark p-6 text-center sm:p-8">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#7C9CFF]/15 text-[#5B7BE0]">
            <Lock size={26} />
          </span>
          <h1 className="mt-4 text-[22px] font-semibold tracking-[-0.01em]">{chapter.name} flashcards are locked</h1>
          <p className="mt-2 text-b2-pistachio">
            Flashcards come with the April 2027 batch: every BMDC topic as quick revision cards, built from all the past questions.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <EnrollButton s={await getSettings()} email={profile.email ?? ""} className={btn("primary", "md")} />
            <Link href="/flashcards" className={btn("secondary", "md")}>
              All decks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data, error } = await supabase.rpc("get_topic_cards", { p_chapter_id: chapter.id });
  if (error || !data) notFound();
  const d = data as { deck: { chapter: string; subject: string; total: number }; cards: Card[] };

  return (
    <div>
      <BackLink href="/flashcards" label="Flashcards" />
      <FlashcardDeck deckKey={slug} title={d.deck.chapter} subject={d.deck.subject} cards={d.cards} />
    </div>
  );
}
