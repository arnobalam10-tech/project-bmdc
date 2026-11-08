import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, ClipboardList, Timer } from "lucide-react";
import { requireUser } from "@/lib/access";
import { freeQuestionCount, loadSets } from "@/lib/mcq";
import { getSettings } from "@/lib/settings";
import { FreeNote } from "@/components/mcq/FreeNote";
import { Alert, PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "MCQ" };

export default async function McqHub({ searchParams }: { searchParams: Promise<{ locked?: string }> }) {
  const { locked } = await searchParams;
  const { supabase, profile, full } = await requireUser();
  const sets = await loadSets(supabase);
  const [s, freeQ, { count: totalQ }] = full
    ? [null, 0, { count: 0 }]
    : await Promise.all([
        getSettings(),
        freeQuestionCount(supabase, sets),
        supabase.from("questions").select("id", { count: "exact", head: true }),
      ]);
  const count = (k: string) => sets.filter((s) => s.kind === k);
  const qCount = (k: string) => count(k).reduce((n, s) => n + s.count, 0);

  const sections = [
    {
      key: "pyq",
      title: "Previous-year questions",
      body: "Structured according to the BMDC exam pattern, with the answer and the reason.",
      icon: ClipboardList,
      meta: `${count("pyq").length} papers · ${qCount("pyq")} questions`,
    },
    {
      key: "model",
      title: "Model tests",
      body: "Full mock papers: 100 questions, 100 minutes, exact RQE marking.",
      icon: Timer,
      meta: count("model").length ? `${count("model").length} tests` : "Coming soon",
    },
    {
      key: "topic",
      title: "Topic-wise",
      body: "Practise chapter by chapter, from Hepatology to Obstetrics.",
      icon: BookOpenCheck,
      meta: `${count("topic").length} chapters`,
    },
  ];

  return (
    <>
      <PageHeader title="MCQ practice" sub="RQE format: 4 True/False statements per question. +0.25 right, −0.06 wrong, 0 blank." />
      {!full && s && <FreeNote freeQuestions={freeQ} totalQuestions={totalQ ?? 0} s={s} email={profile.email ?? ""} />}
      {locked && (
        <div className="mb-5">
          <Alert tone="warning">That set is for enrolled students. Join the batch to unlock every MCQ.</Alert>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {sections.map(({ key, title, body, icon: Icon, meta }) => (
          <Link
            key={key}
            href={`/mcq/${key}`}
            className="group flex flex-col rounded-[20px] border border-b2-border bg-b2-dark p-5 transition-colors hover:border-b2-meadow sm:p-6"
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-b2-pine text-b2-meadow">
              <Icon size={24} strokeWidth={1.75} />
            </span>
            <h2 className="mt-4 text-[20px] font-medium tracking-[-0.01em]">{title}</h2>
            <p className="mt-1.5 flex-1 text-[15px] text-b2-pistachio">{body}</p>
            <p className="mt-4 flex items-center justify-between text-sm text-b2-caribbean">
              {meta} <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-6 rounded-[20px] border border-b2-border bg-b2-dark p-5 text-[15px] text-b2-pistachio">
        <b className="text-b2-flash">Practice</b> shows the answer and explanation right after each question.{" "}
        <b className="text-b2-flash">Exam</b> is timed, lets you flag and review, and shows your score and all explanations at the end.
      </div>
    </>
  );
}
