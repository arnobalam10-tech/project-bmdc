import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { requireUser } from "@/lib/access";
import { PracticeRunner } from "@/components/mcq/PracticeRunner";
import { ExamRunner } from "@/components/mcq/ExamRunner";
import type { AttemptData } from "@/components/mcq/types";
import { B2Mark } from "@/components/brand/B2";
import { BackLink } from "@/components/app/BackLink";
import { LockedQuestions } from "@/components/mcq/LockedQuestions";
import { getSettings } from "@/lib/settings";
import { btn } from "@/components/ui/Button";
import { startAttempt } from "../../actions";
import { SubmitButton } from "@/components/ui/client";

export const metadata: Metadata = { title: "MCQ" };

export default async function AttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireUser();
  const { data, error } = await supabase.rpc("get_attempt", { p_attempt_id: id });
  if (error || !data) notFound();
  const d = data as AttemptData;

  if (!d.attempt.submitted_at) {
    const locked =
      d.locked_count > 0 ? (
        <LockedQuestions lockedCount={d.locked_count} total={d.set.total_questions} s={await getSettings()} email={profile.email ?? ""} />
      ) : null;
    return d.attempt.mode === "exam" ? <ExamRunner data={d} locked={locked} /> : <PracticeRunner data={d} locked={locked} />;
  }

  // ───── mock with results not yet published ─────
  // ───── result (for a mock whose answers aren't revealed yet: score + leaderboard only) ─────
  const answersHidden = !!d.results_hidden;
  const a = d.attempt;
  const board = d.set.hide_results
    ? (((await supabase.rpc("get_set_leaderboard", { p_set_id: d.set.id, p_limit: 20 })).data ?? []) as {
        rank: number;
        display_name: string;
        score: number;
        pct: number;
        is_me: boolean;
        total: number;
      }[])
    : [];
  const me = board.find((r) => r.is_me);
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

  const sectionLabel = { pyq: "Previous-year questions", model: "Model tests", topic: "Topic-wise" }[d.set.kind];
  return (
    <div className="space-y-6">
      <BackLink href={`/mcq/${d.set.kind}`} label={sectionLabel} />
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

      {answersHidden && (
        <div className="flex items-start gap-3 rounded-[20px] border border-b2-border bg-b2-dark p-4 sm:p-5">
          <Lock size={20} className="mt-0.5 flex-none text-b2-caribbean" />
          <p className="text-[15px]">
            <span className="font-semibold">Correct answers will be revealed later.</span>{" "}
            <span className="text-b2-pistachio">
              The full answer key, explanations and your subject-wise analysis open here once we publish them.
            </span>
          </p>
        </div>
      )}

      {board.length > 0 && (
        <div className="rounded-[20px] border border-b2-border bg-b2-dark p-5 sm:p-6">
          {me && (
            <p className="mb-4 text-center">
              <span className="block text-sm text-b2-pistachio">Your rank</span>
              <span className="tabular text-4xl font-semibold">
                #{me.rank} <span className="text-lg font-normal text-b2-pistachio">of {me.total}</span>
              </span>
            </p>
          )}
          <p className="mb-3 font-semibold">Leaderboard · {d.set.title}</p>
          <ol className="divide-y divide-b2-border">
            {board.map((r) => (
              <li key={`${r.rank}-${r.display_name}-${r.is_me}`} className={`flex items-center gap-3 py-2 text-sm ${r.is_me ? "font-semibold text-b2-caribbean" : ""}`}>
                <span className="tabular w-8 text-b2-pistachio">#{r.rank}</span>
                <span className="flex-1 truncate">{r.is_me ? `${r.display_name} (you)` : r.display_name}</span>
                <span className="tabular">{Number(r.score).toFixed(2)}</span>
                <span className="tabular w-14 text-right text-b2-pistachio">{r.pct}%</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {d.locked_count > 0 && (
        <LockedQuestions
          compact
          lockedCount={d.locked_count}
          total={d.set.total_questions}
          s={await getSettings()}
          email={profile.email ?? ""}
        />
      )}

      {!answersHidden && bySubject.size > 0 && (
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
        {answersHidden ? (
          <Link href="/dashboard" className={btn("primary", "lg", "flex-1")}>
            Back to Home
          </Link>
        ) : (
          <Link href={`/mcq/attempt/${a.id}/review`} className={btn("primary", "lg", "flex-1")}>
            Review answers & explanations
          </Link>
        )}
        {!d.set.hide_results && (
          <form action={startAttempt} className="flex-1">
            <input type="hidden" name="set_id" value={d.set.id} />
            <SubmitButton name="mode" value={a.mode} variant="secondary" size="lg" className="w-full" pending="Starting">
              Try again
            </SubmitButton>
          </form>
        )}
        <Link href={`/mcq/${d.set.kind}`} className={btn("ghost", "lg", "flex-1")}>
          Back to {sectionLabel}
        </Link>
      </div>
    </div>
  );
}
