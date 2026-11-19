import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  const { data: chapter } = await supabase.from("chapters").select("id").eq("slug", slug).maybeSingle();
  if (!chapter) notFound();
  const { data, error } = await supabase.rpc("get_topic_cards",{ p_chapter_id: chapter.id });
  if (error || !data) notFound();
  const d = data as { deck: { chapter: string; subject: string; total: number }; cards: Card[] };
  const locked = d.deck.total - d.cards.length;

  return (
    <div>
      <BackLink href="/flashcards" label="Flashcards" />
      <FlashcardDeck
        deckKey={slug}
        title={d.deck.chapter}
        subject={d.deck.subject}
        cards={d.cards}
        locked={
          !full && locked > 0 ? (
            <div className="mt-6 rounded-[20px] border border-b2-border bg-b2-dark p-4 text-center sm:p-5">
              <p className="text-b2-pistachio">
                {locked} more cards in this deck unlock with the April 2027 batch.
              </p>
              <div className="mt-3 flex justify-center">
                <EnrollButton s={await getSettings()} email={profile.email ?? ""} className={btn("primary", "sm")} />
              </div>
            </div>
          ) : null
        }
      />
    </div>
  );
}
