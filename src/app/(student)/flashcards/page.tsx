import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import { requireUser } from "@/lib/access";
import { BackLink } from "@/components/app/BackLink";
import { EmptyState, PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Flashcards" };

type Deck = { chapter_id: string; chapter: string; slug: string; subject: string; total: number; open: number };

export default async function FlashcardsPage() {
  const { supabase, full } = await requireUser();
  const { data } = await supabase.rpc("get_topic_decks");
  const decks = (data ?? []) as Deck[];
  const groups = new Map<string, Deck[]>();
  for (const d of decks) groups.set(d.subject, [...(groups.get(d.subject) ?? []), d]);
  const totalCards = decks.reduce((n, d) => n + d.total, 0);

  return (
    <div>
      <BackLink href="/dashboard" label="Home" />
      <PageHeader
        title="Flashcards"
        sub={`${totalCards.toLocaleString()} quick-revision cards built from every BMDC question. See a topic, recall the points, flip to check.`}
      />
      {decks.length === 0 ? (
        <EmptyState title="No decks yet." sub="Flashcards appear as MCQs are added." />
      ) : (
        <div className="space-y-8">
          {[...groups.entries()].map(([subject, list]) => (
            <section key={subject}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-b2-caribbean">{subject}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {list.map((d) => (
                  <li key={d.chapter_id}>
                    <Link
                      href={`/flashcards/${d.slug}`}
                      className="group flex items-center gap-3 rounded-[20px] border border-b2-border bg-b2-dark p-4 transition-colors hover:border-b2-caribbean/50 active:scale-[0.99]"
                    >
                      {/* little stacked-cards mark */}
                      <span className="relative h-11 w-9 flex-none">
                        <span className="absolute inset-0 translate-x-1.5 -rotate-6 rounded-lg border border-b2-border bg-b2-pine" />
                        <span className="absolute inset-0 grid place-items-center rounded-lg border border-[#7C9CFF]/40 bg-[#7C9CFF]/15 text-xs font-semibold text-[#5B7BE0]">
                          {d.total}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{d.chapter}</span>
                        <span className="block text-[13px] text-b2-pistachio">
                          {full || d.open === d.total ? (
                            `${d.total} cards`
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              {d.open} of {d.total} free <Lock size={12} />
                            </span>
                          )}
                        </span>
                      </span>
                      <ChevronRight size={18} className="flex-none text-b2-stone transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
