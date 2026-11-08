import type { Metadata } from "next";
import { BackLink } from "@/components/app/BackLink";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/access";
import { QuestionCard } from "@/components/mcq/QuestionCard";
import { sourceLine, type AttemptData } from "@/components/mcq/types";

export const metadata: Metadata = { title: "Review" };

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("get_attempt", { p_attempt_id: id });
  if (error || !data) notFound();
  const d = data as AttemptData;
  if (!d.attempt.submitted_at) redirect(`/mcq/attempt/${id}`);

  return (
    <div>
      <BackLink href={`/mcq/attempt/${id}`} label="Result" />
      <h1 className="text-[26px] font-semibold tracking-tight">Review · {d.set.title}</h1>
      <p className="mt-1 text-b2-pistachio">Every statement with the correct answer and the reason.</p>
      <div className="mt-6 space-y-10">
        {d.questions.map((q, n) => (
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
