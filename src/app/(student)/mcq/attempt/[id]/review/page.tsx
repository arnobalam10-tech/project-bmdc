import type { Metadata } from "next";
import Link from "next/link";
import { BackLink } from "@/components/app/BackLink";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/access";
import { QuestionCard } from "@/components/mcq/QuestionCard";
import { sourceLine, type AttemptData } from "@/components/mcq/types";

export const metadata: Metadata = { title: "Review" };

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ show?: string }>;
}) {
  const { id } = await params;
  const onlyMistakes = (await searchParams).show === "mistakes";
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("get_attempt", { p_attempt_id: id });
  if (error || !data) notFound();
  const d = data as AttemptData;
  if (!d.attempt.submitted_at || d.results_hidden) redirect(`/mcq/attempt/${id}`);
  const all = d.questions.map((q, n) => ({ q, n }));
  const mistakes = all.filter(({ q }) => q.options.some((o) => o.is_true !== null && !o.is_correct));
  const shown = onlyMistakes ? mistakes : all;

  return (
    <div>
      <BackLink href={`/mcq/attempt/${id}`} label="Result" />
      <h1 className="text-[26px] font-semibold tracking-tight">Review · {d.set.title}</h1>
      <p className="mt-1 text-b2-pistachio">Every statement with the correct answer and the reason.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(
          [
            ["", `All questions (${all.length})`],
            ["mistakes", `My mistakes (${mistakes.length})`],
          ] as const
        ).map(([v, label]) => (
          <Link
            key={v}
            href={`/mcq/attempt/${id}/review${v ? `?show=${v}` : ""}`}
            className={`min-h-10 rounded-full border px-4 py-2 text-sm font-medium ${
              (v === "mistakes") === onlyMistakes ? "border-transparent bg-b2-caribbean text-b2-ink" : "border-b2-border text-b2-meadow"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="mt-6 space-y-10">
        {shown.map(({ q, n }) => (
          <QuestionCard
            key={q.id}
            q={q}
            number={n + 1}
            source={sourceLine(q, d.set.kind)}
            answers={Object.fromEntries(q.options.map((o) => [o.id, o.answer]))}
            revealed
          />
        ))}
      </div>
    </div>
  );
}
