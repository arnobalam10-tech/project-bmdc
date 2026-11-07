import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/access";
import { PracticeRunner } from "@/components/mcq/PracticeRunner";
import { ExamRunner } from "@/components/mcq/ExamRunner";
import type { AttemptData } from "@/components/mcq/types";
import { B2Mark } from "@/components/brand/B2";
import { btn } from "@/components/ui/Button";
import { startAttempt } from "../../actions";
import { SubmitButton } from "@/components/ui/client";

export const metadata: Metadata = { title: "MCQ" };

export default async function AttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("get_attempt", { p_attempt_id: id });
  if (error || !data) notFound();
  const d = data as AttemptData;

  if (!d.attempt.submitted_at) {
    return d.attempt.mode === "exam" ? <ExamRunner data={d} /> : <PracticeRunner data={d} />;
  }

  // ───── result ─────
  const a = d.attempt;
  const max = a.n_questions;
  const score = Number(a.score ?? 0);
  const pct = max ? Math.round((1000 * score) / max) / 10 : 0;
  const bySubject = new Map<string, { c: number; t: number }>();
  for (const q of d.questions) {
    const k = q.subject ?? "Other";
    const cur = bySubject.get(k) ?? { c: 0, t: 0 };
    for (const o of q.options) if (o.is_correct !== null) { cur.t++; if (o.is_correct) cur.c++; }
    bySubject.set(k, cur);
  }
  const started = new Date(a.started_at).getTime();
  const used = Math.max(0, Math.round((new Date(a.submitted_at!).getTime() - started) / 60000));

  return (
    <div className="space-y-6">
      <div className="b2-film spring rounded-[32px] p-6 text-center sm:p-10">
        <B2Mark className="is-heartbeat mx-auto" size={64} decorative />
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em]">
          {a.mode === "exam" ? "Exam submitted" : "Practice complete"} · {d.set.title}
        </p>
        <p className="tabular mt-3 text-6xl font-semibold tracking-[-0.03em] sm:text-7xl">
          {score.toFixed(2)}
          <span className="text-2xl font-normal text-b2-flash/70"> / {max}</span>
        </p>
        <p className="mt-2 text-lg">{pct}% · RQE marking</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
          <span className="rounded-full bg-b2-black/50 px-3 py-1.5">✓ {a.n_correct} correct</span>
          <span className="rounded-full bg-b2-black/50 px-3 py-1.5">✗ {a.n_wrong} wrong</span>
          <span className="rounded-full bg-b2-black/50 px-3 py-1.5">○ {a.n_blank} blank</span>
          {a.mode === "exam" && <span className="rounded-full bg-b2-black/50 px-3 py-1.5">{used} min used</span>}
        </div>
      </div>

      {bySubject.size > 0 && (
        <div className="rounded-[20px] border border-b2-border bg-b2-dark p-5 sm:p-6">
          <p className="mb-4 font-semibold">By subject</p>
          <ul className="space-y-3">
            {[...bySubject.entries()].map(([k, v]) => {
              const p = v.t ? Math.round((100 * v.c) / v.t) : 0;
              return (
                <li key={k}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{k}</span>
                    <span className="tabular text-b2-pistachio">{v.t ? `${p}%` : "—"}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-b2-pine">
                    <div className={`h-full ${p < 50 ? "bg-b2-warning" : "bg-b2-caribbean"}`} style={{ width: `${p}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={`/mcq/attempt/${a.id}/review`} className={btn("primary", "lg", "flex-1")}>
          Review answers & explanations
        </Link>
        <form action={startAttempt} className="flex-1">
          <input type="hidden" name="set_id" value={d.set.id} />
          <SubmitButton name="mode" value={a.mode} variant="secondary" size="lg" className="w-full" pending="Starting">
            Try again
          </SubmitButton>
        </form>
        <Link href="/mcq" className={btn("ghost", "lg", "flex-1")}>
          Back to MCQ
        </Link>
      </div>
    </div>
  );
}
