import type { Metadata } from "next";
import { BackLink } from "@/components/app/BackLink";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/access";
import { getSettings } from "@/lib/settings";
import { freeQuestionCount, loadSets } from "@/lib/mcq";
import { FreeNote } from "@/components/mcq/FreeNote";
import { SetRow } from "@/components/mcq/SetRow";
import { EnrollButton } from "@/components/enroll/Enroll";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { btn } from "@/components/ui/Button";

export const metadata: Metadata = { title: "MCQ sets" };

const TITLES = {
  pyq: ["Previous-year questions", "Structured according to the BMDC exam pattern."],
  model: ["Model tests", "Full mock papers with exact RQE marking."],
  topic: ["Topic-wise", "Chapter by chapter, following the course."],
} as const;

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(section in TITLES)) notFound();
  const kind = section as keyof typeof TITLES;
  const { supabase, profile, full } = await requireUser();
  const [sets, s, allSets, { count: totalQ }] = await Promise.all([
    loadSets(supabase, kind),
    getSettings(),
    full ? Promise.resolve([]) : loadSets(supabase),
    full ? Promise.resolve({ count: 0 }) : supabase.from("questions").select("id", { count: "exact", head: true }),
  ]);
  const freeQ = full ? 0 : await freeQuestionCount(supabase, allSets);
  const enroll = <EnrollButton s={s} email={profile.email ?? ""} className={btn("primary", "sm")} />;

  let body: React.ReactNode;
  if (sets.length === 0) {
    body = <EmptyState title="No sets here yet." sub="New questions are added regularly. Check back soon." />;
  } else if (kind === "topic") {
    const { data: chapters } = await supabase.from("chapters").select("id,sort,subjects(name,sort)").order("sort");
    const subjOf = new Map((chapters ?? []).map((c) => [c.id, (c.subjects as unknown as { name: string } | null)?.name ?? "Other"]));
    const groups = new Map<string, typeof sets>();
    for (const st of sets) {
      const k = subjOf.get(st.chapter_id ?? "") ?? "Other";
      groups.set(k, [...(groups.get(k) ?? []), st]);
    }
    body = (
      <div className="space-y-8">
        {[...groups.entries()].map(([subject, list]) => (
          <section key={subject}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-b2-caribbean">{subject}</h2>
            <ul className="space-y-3">
              {list.map((st) => (
                <SetRow key={st.id} set={st} full={full} enroll={enroll} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  } else {
    body = (
      <ul className="space-y-3">
        {sets.map((st) => (
          <SetRow key={st.id} set={st} full={full} enroll={enroll} />
        ))}
      </ul>
    );
  }

  return (
    <>
      <BackLink href="/mcq" label="MCQ" />
      <PageHeader title={TITLES[kind][0]} sub={TITLES[kind][1]} />
      {!full && <FreeNote freeQuestions={freeQ} totalQuestions={totalQ ?? 0} s={s} email={profile.email ?? ""} />}
      {body}
    </>
  );
}
