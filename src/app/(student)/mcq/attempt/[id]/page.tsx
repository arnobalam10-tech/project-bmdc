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
  // per-statement accuracy by subject and by system (chapter)
  type Agg = { c: number; w: number; t: number };
  const bySubject = new Map<string, Agg>();
  const bySystem = new Map<string, Agg & { subject: string }>();
  for (const q of d.questions) {
    const sk = q.subject ?? "Other";
    const ck = q.chapter ?? sk;
    const sub = bySubject.get(sk) ?? { c: 0, w: 0, t: 0 };
    const sys = bySystem.get(ck) ?? { c: 0, w: 0, t: 0, subject: sk };
    for (const o of q.options) {
      if (o.is_true === null) continue;
      sub.t++;
      sys.t++;
      if (o.is_correct) {
        sub.c++;
        sys.c++;
      } else if (o.answer !== null) {
        sub.w++;
        sys.w++;
      }
    }
    bySubject.set(sk, sub);
    bySystem.set(ck, sys);
  }
  const pctOf = (v: Agg) => (v.t ? Math.round((100 * v.c) / v.t) : 0);
  const subjects = [...bySubject.entries()].filter(([, v]) => v.t).sort((x, y) => pctOf(x[1]) - pctOf(y[1]));
  const systems = [...bySystem.entries()].filter(([, v]) => v.t).sort((x, y) => pctOf(x[1]) - pctOf(y[1]) || y[1].t - x[1].t);
  const weakest = systems.filter(([, v]) => pctOf(v) < 70).slice(0, 3);
  const mistakeQs = d.questions.filter((q) => q.options.some((o) => o.is_true !== null && !o.is_correct)).length;
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

      {!answersHidden && subjects.length > 0 && (
        <>
          {weakest.length > 0 && (
            <div className="rounded-[20px] border border-b2-warning/40 bg-b2-dark p-5 sm:p-6">
              <p className="font-semibold">Where you are weakest</p>
              <p className="mt-1 text-sm text-b2-pistachio">Revise these systems first. Accuracy is counted per true/false statement.</p>
              <ol className="mt-4 grid gap-3 sm:grid-cols-3">
                {weakest.map(([k, v], i) => (
                  <li key={k} className="rounded-2xl border border-b2-border bg-b2-black/40 p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-b2-stone">
                      #{i + 1} · {v.subject}
                    </p>
                    <p className="mt-1 font-medium leading-snug">{k}</p>
                    <p className="tabular mt-2 text-2xl font-semibold text-b2-warning">{pctOf(v)}%</p>
                    <p className="tabular text-xs text-b2-pistachio">
                      {v.c} of {v.t} right · {v.w} wrong
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            <AnalysisCard title="By subject" rows={subjects.map(([k, v]) => ({ k, v, p: pctOf(v) }))} />
            <AnalysisCard title="By system" rows={systems.map(([k, v]) => ({ k, sub: v.subject, v, p: pctOf(v) }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href={`/mcq/attempt/${a.id}/review?show=mistakes`} className={btn("secondary", "lg")}>
              Only my mistakes ({mistakeQs} questions)
            </Link>
            <Link href="/mistakes" className={btn("ghost", "lg")}>
              Practise them in My mistakes
            </Link>
          </div>
        </>
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

function AnalysisCard({
  title,
  rows,
}: {
  title: string;
  rows: { k: string; sub?: string; v: { c: number; w: number; t: number }; p: number }[];
}) {
  return (
    <div className="rounded-[20px] border border-b2-border bg-b2-dark p-5 sm:p-6">
      <p className="font-semibold">{title}</p>
      <p className="mb-4 text-xs text-b2-pistachio">Weakest first · statements right / total</p>
      <ul className="space-y-3">
        {rows.map(({ k, sub, v, p }) => (
          <li key={k}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">
                {k}
                {sub && <span className="text-b2-stone"> · {sub}</span>}
              </span>
              <span className="tabular flex-none text-b2-pistachio">
                {v.c}/{v.t} ·{" "}
                <span className={p < 50 ? "text-b2-warning" : p < 70 ? "text-b2-flash" : "text-b2-caribbean"}>{p}%</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-b2-pine">
              <div className={`h-full ${p < 50 ? "bg-b2-warning" : p < 70 ? "bg-b2-meadow" : "bg-b2-caribbean"}`} style={{ width: `${p}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
