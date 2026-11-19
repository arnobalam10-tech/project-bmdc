"use client";

import { useMemo, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, RotateCcw, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { btn } from "@/components/ui/Button";
import { B2Mark } from "@/components/brand/B2";
import { QuestionCard } from "./QuestionCard";
import type { Option, Question } from "./types";

export type MistakeQuestion = Question & { chapter_id: string | null; times_wrong: number; last_wrong_at: string };
type Answers = Record<string, boolean | null>;
type Result = "cleared" | "missed";

function source(q: MistakeQuestion) {
  const when = q.pyq_year ? `${q.pyq_session ?? ""} ${q.pyq_year}`.trim() : null;
  return [when ? `Previous year ${when}` : null, q.chapter, `Wrong ${q.times_wrong}×`].filter(Boolean).join(" · ");
}

/** Re-try logged mistakes: all four statements right clears the question from the list. */
export function MistakeRunner({ questions: initial }: { questions: MistakeQuestion[] }) {
  const supabase = useMemo(() => createClient(), []);
  const top = useRef<HTMLDivElement>(null);

  const chapters = useMemo(() => {
    const m = new Map<string, { name: string; n: number }>();
    for (const q of initial) {
      const k = q.chapter_id ?? "other";
      m.set(k, { name: q.chapter ?? "Other", n: (m.get(k)?.n ?? 0) + 1 });
    }
    return [...m.entries()].sort((a, b) => b[1].n - a[1].n);
  }, [initial]);

  const [filter, setFilter] = useState<string | null>(null);
  const [questions, setQuestions] = useState(initial);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [answers, setAnswers] = useState<Answers>({});
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const list = filter ? questions.filter((q) => (q.chapter_id ?? "other") === filter) : questions;
  const q = list[Math.min(i, list.length - 1)];
  const revealed = !!q && q.options.every((o) => o.is_true !== null);
  const cleared = Object.values(results).filter((r) => r === "cleared").length;
  const [finished, setFinished] = useState(false);
  const allChecked = list.length > 0 && list.every((x) => results[x.id]);
  const done = finished && allChecked;
  const last = i >= list.length - 1;

  function go(n: number) {
    setI(n);
    setError(null);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function check() {
    if (!q) return;
    setBusy(true);
    setError(null);
    const payload = Object.fromEntries(q.options.map((o) => [o.id, answers[o.id] ?? null]));
    const { data, error } = await supabase.rpc("check_mistake", { p_question_id: q.id, p_answers: payload });
    setBusy(false);
    if (error || !data) {
      setError("That didn't go through. Check your connection and try again.");
      return;
    }
    const r = data as { resolved: boolean; pearl: string | null; options: Option[] };
    setResults((x) => ({ ...x, [q.id]: r.resolved ? "cleared" : "missed" }));
    setQuestions((qs) =>
      qs.map((x) =>
        x.id !== q.id
          ? x
          : {
              ...x,
              pearl: r.pearl,
              times_wrong: r.resolved ? x.times_wrong : x.times_wrong + 1,
              options: x.options.map((o) => {
                const m = r.options.find((ro) => ro.id === o.id)!;
                return { ...o, is_true: m.is_true, is_correct: m.is_correct, explanation: m.explanation, answer: m.answer };
              }),
            }
      )
    );
    requestAnimationFrame(() => document.getElementById("mistake-result")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  if (done) {
    const missed = list.filter((x) => results[x.id] === "missed").length;
    return (
      <div className="b2-film spring rounded-[32px] p-6 text-center sm:p-10">
        <B2Mark className="is-heartbeat mx-auto" size={64} decorative />
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em]">Round complete</p>
        <p className="tabular mt-3 text-6xl font-semibold tracking-[-0.03em]">
          {cleared}
          <span className="text-2xl font-normal text-b2-flash/70"> cleared</span>
        </p>
        <p className="mt-2 text-b2-flash/80">
          {missed > 0 ? `${missed} still need work. They stay in your list for next time.` : "Every mistake in this round is fixed. Great work!"}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {missed > 0 && (
            <button type="button" onClick={() => window.location.reload()} className={btn("primary", "md")}>
              <RotateCcw size={18} /> Try the rest again
            </button>
          )}
          <a href="/dashboard" className={btn("secondary", "md")}>
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div ref={top} className="scroll-mt-20">
      {/* summary + chapter filter */}
      <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          ["To fix", questions.length - cleared, "text-[#E5484D]"],
          ["Cleared now", cleared, "text-b2-caribbean"],
          ["Chapters", chapters.length, "text-b2-flash"],
        ].map(([label, n, tone]) => (
          <div key={label as string} className="rounded-2xl border border-b2-border bg-b2-dark px-3 py-3 text-center">
            <p className={`tabular text-2xl font-semibold ${tone}`}>{n}</p>
            <p className="text-xs text-b2-pistachio">{label}</p>
          </div>
        ))}
      </div>
      {chapters.length > 1 && (
        <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {[[null, { name: "All", n: questions.length }] as const, ...chapters].map(([id, c]) => (
            <button
              key={id ?? "all"}
              type="button"
              onClick={() => {
                setFilter(id);
                go(0);
              }}
              className={`pressable flex-none rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                filter === id ? "border-b2-caribbean bg-b2-caribbean text-b2-ink" : "border-b2-border text-b2-pistachio hover:text-b2-flash"
              }`}
            >
              {c.name} <span className="tabular opacity-70">{c.n}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold">
          Mistake {Math.min(i, list.length - 1) + 1} <span className="text-b2-stone">of {list.length}</span>
        </p>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-b2-pine">
        <div className="h-full bg-[#FF6B6B] transition-all" style={{ width: `${((Math.min(i, list.length - 1) + 1) / list.length) * 100}%` }} />
      </div>

      {q && (
        <QuestionCard
          q={q}
          number={Math.min(i, list.length - 1) + 1}
          source={source(q)}
          answers={answers}
          revealed={revealed}
          onChange={(id, v) => setAnswers((a) => ({ ...a, [id]: v }))}
        />
      )}

      <div id="mistake-result" className="scroll-mt-24">
        {q && results[q.id] === "cleared" && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-b2-caribbean/40 bg-b2-caribbean/10 p-4">
            <CheckCircle2 className="flex-none text-b2-caribbean" size={26} />
            <div>
              <p className="font-semibold">Cleared!</p>
              <p className="text-sm text-b2-pistachio">All four right. This one is off your mistakes list.</p>
            </div>
          </div>
        )}
        {q && results[q.id] === "missed" && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#FF6B6B]/40 bg-[#FF6B6B]/10 p-4">
            <XCircle className="flex-none text-[#E5484D]" size={26} />
            <div>
              <p className="font-semibold">Not quite yet</p>
              <p className="text-sm text-b2-pistachio">Read the explanations. It stays on your list for another go.</p>
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-b2-error">{error}</p>}

      <div className="safe-bottom sticky bottom-16 z-20 -mx-4 mt-6 border-t border-b2-border bg-b2-black/95 px-4 py-3 backdrop-blur-md md:bottom-0 md:mx-0 md:rounded-2xl md:border">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className={btn("ghost", "md", "px-3")} aria-label="Previous mistake">
            <ChevronLeft size={20} />
          </button>
          {!revealed ? (
            <button
              type="button"
              onClick={check}
              aria-busy={busy || undefined}
              className={btn("primary", "md", `flex-1 ${busy ? "pointer-events-none" : ""}`)}
            >
              {busy ? <B2Mark className="is-loading" size={20} grain={false} decorative /> : null}
              Check answer
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (allChecked) return setFinished(true);
                const next = list.findIndex((x, k) => k > i && !results[x.id]);
                const first = list.findIndex((x) => !results[x.id]);
                go(next >= 0 ? next : first);
              }}
              className={btn("primary", "md", "flex-1")}
            >
              {allChecked ? "See summary" : "Next mistake"} <ChevronRight size={18} />
            </button>
          )}
          <button type="button" onClick={() => go(i + 1)} disabled={last} className={btn("ghost", "md", "px-3")} aria-label="Skip">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
