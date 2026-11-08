"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { btn } from "@/components/ui/Button";
import { B2Mark } from "@/components/brand/B2";
import { QuestionCard } from "./QuestionCard";
import { sourceLine, type AttemptData, type Option, type Question } from "./types";

type Answers = Record<string, boolean | null>;

/** Practice mode: check each question → instant answer + explanation. */
export function PracticeRunner({ data }: { data: AttemptData }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [questions, setQuestions] = useState<Question[]>(data.questions);
  const firstOpen = Math.max(0, data.questions.findIndex((q) => q.options.every((o) => o.is_true === null)));
  const [i, setI] = useState(firstOpen);
  const [answers, setAnswers] = useState<Answers>(() =>
    Object.fromEntries(data.questions.flatMap((q) => q.options.map((o) => [o.id, o.answer])))
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const top = useRef<HTMLDivElement>(null);

  const q = questions[i];
  const revealed = q.options.every((o) => o.is_true !== null);
  const checkedCount = questions.filter((x) => x.options.every((o) => o.is_true !== null)).length;
  const last = i === questions.length - 1;

  async function check() {
    setBusy(true);
    setError(null);
    const payload = Object.fromEntries(q.options.map((o) => [o.id, answers[o.id] ?? null]));
    const { data: res, error } = await supabase.rpc("check_practice_question", {
      p_attempt_id: data.attempt.id,
      p_question_id: q.id,
      p_answers: payload,
    });
    setBusy(false);
    if (error || !res) {
      setError("That didn't go through. Check your connection and try again.");
      return;
    }
    const r = res as { pearl: string | null; options: Option[] };
    setQuestions((qs) =>
      qs.map((x) =>
        x.id !== q.id
          ? x
          : {
              ...x,
              pearl: r.pearl,
              options: x.options.map((o) => {
                const m = r.options.find((ro) => ro.id === o.id)!;
                return { ...o, is_true: m.is_true, is_correct: m.is_correct, explanation: m.explanation, answer: m.answer };
              }),
            }
      )
    );
    requestAnimationFrame(() =>
      document.getElementById("explanation-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  }

  async function finish() {
    setBusy(true);
    await supabase.rpc("submit_attempt", { p_attempt_id: data.attempt.id });
    router.refresh();
  }

  function go(n: number) {
    setI(n);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={top} className="scroll-mt-20">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href={`/mcq/${data.set.kind}`}
          aria-label="Exit practice"
          className="pressable -ml-1 flex min-h-11 flex-none items-center gap-1 rounded-full border border-b2-border px-3 text-sm font-medium text-b2-pistachio hover:text-b2-flash"
        >
          <X size={16} /> Exit
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-b2-pistachio">Practice · {data.set.title}</p>
          <p className="font-semibold">
            Question {i + 1} <span className="text-b2-stone">of {questions.length}</span>
          </p>
        </div>
        <span className="tabular flex-none rounded-full bg-b2-pine px-3 py-1 text-xs font-semibold text-b2-meadow">
          {checkedCount} checked
        </span>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-b2-pine">
        <div className="h-full bg-b2-caribbean transition-all" style={{ width: `${((i + 1) / questions.length) * 100}%` }} />
      </div>

      <QuestionCard
        q={q}
        number={i + 1}
        source={sourceLine(q, data.set.kind)}
        answers={answers}
        revealed={revealed}
        onChange={(id, v) => setAnswers((a) => ({ ...a, [id]: v }))}
      />
      <div id="explanation-anchor" className="scroll-mt-24" />
      {error && <p className="mt-3 text-sm text-b2-error">{error}</p>}

      {/* sticky action bar */}
      <div className="safe-bottom sticky bottom-16 z-20 -mx-4 mt-6 border-t border-b2-border bg-b2-black/95 px-4 py-3 backdrop-blur-md md:bottom-0 md:mx-0 md:rounded-2xl md:border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(i - 1)}
            disabled={i === 0}
            className={btn("ghost", "md", "px-3")}
            aria-label="Previous question"
          >
            <ChevronLeft size={20} />
          </button>
          {!revealed ? (
            <button type="button" onClick={check} disabled={busy} className={btn("primary", "md", "flex-1")}>
              {busy ? <B2Mark className="is-loading" size={20} grain={false} decorative /> : null}
              Check answer
            </button>
          ) : last ? (
            <button type="button" onClick={finish} disabled={busy} className={btn("primary", "md", "flex-1")}>
              Finish practice
            </button>
          ) : (
            <button type="button" onClick={() => go(i + 1)} className={btn("primary", "md", "flex-1")}>
              Next <ChevronRight size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => go(i + 1)}
            disabled={last}
            className={btn("ghost", "md", "px-3")}
            aria-label="Skip to next question"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
