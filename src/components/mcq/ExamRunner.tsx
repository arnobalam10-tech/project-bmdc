"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Flag, Grid3x3, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signalNavStart } from "@/components/app/NavigationProgress";
import { btn } from "@/components/ui/Button";
import { B2Mark } from "@/components/brand/B2";
import { QuestionCard } from "./QuestionCard";
import { sourceLine, type AttemptData } from "./types";

type Answers = Record<string, boolean | null>;

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h > 0 ? `${String(h).padStart(2, "0")}:` : ""}${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** Exam mode: server-anchored countdown, autosave, flag & palette, auto-submit at 0. */
export function ExamRunner({ data }: { data: AttemptData }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const qs = data.questions;
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() =>
    Object.fromEntries(qs.flatMap((q) => q.options.map((o) => [o.id, o.answer])))
  );
  const [flags, setFlags] = useState<Set<string>>(new Set(data.flags));
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  // server clock offset, measured once on mount (lazy initialiser)
  const [offset] = useState(() => new Date(data.attempt.server_now).getTime() - Date.now());
  const deadline = new Date(data.attempt.deadline_at!).getTime();
  const [left, setLeft] = useState(() => deadline - (Date.now() + offset));
  const dirty = useRef<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const top = useRef<HTMLDivElement>(null);
  // refs so flush() always sends the latest values
  const answersRef = useRef(answers);
  const flagsRef = useRef(flags);
  useEffect(() => {
    answersRef.current = answers;
    flagsRef.current = flags;
  }, [answers, flags]);

  const answeredQ = (qid: string) => qs.find((q) => q.id === qid)!.options.some((o) => answers[o.id] !== null && answers[o.id] !== undefined);
  const blankStatements = qs.reduce((n, q) => n + q.options.filter((o) => answers[o.id] === null || answers[o.id] === undefined).length, 0);

  const flush = useCallback(async () => {
    const ids = [...dirty.current];
    dirty.current.clear();
    if (!ids.length) return true;
    setSaveState("saving");
    let ok = true;
    for (const qid of ids) {
      const q = qs.find((x) => x.id === qid)!;
      const { error } = await supabase.rpc("save_exam_answers", {
        p_attempt_id: data.attempt.id,
        p_question_id: qid,
        p_answers: Object.fromEntries(q.options.map((o) => [o.id, answersRef.current[o.id] ?? null])),
        p_flagged: flagsRef.current.has(qid),
      });
      if (error) {
        ok = false;
        dirty.current.add(qid);
      }
    }
    setSaveState(ok ? "saved" : "error");
    return ok;
  }, [qs, supabase, data.attempt.id]);

  const schedule = useCallback(
    (qid: string) => {
      dirty.current.add(qid);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, 800);
    },
    [flush]
  );

  const submit = useCallback(async () => {
    setSubmitting(true);
    await flush();
    await supabase.rpc("submit_attempt", { p_attempt_id: data.attempt.id });
    router.refresh();
  }, [flush, supabase, data.attempt.id, router]);

  useEffect(() => {
    const t = setInterval(() => {
      const l = deadline - (Date.now() + offset);
      setLeft(l);
      if (l <= 0) {
        clearInterval(t);
        submit();
      }
    }, 500);
    return () => clearInterval(t);
  }, [deadline, submit, offset]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current.size) {
        flush();
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [flush]);

  const q = qs[i];
  const go = (n: number) => {
    setI(n);
    setPaletteOpen(false);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const timerTone = left < 120_000 ? "bg-b2-error text-b2-ink" : left < 600_000 ? "bg-b2-warning text-b2-ink" : "bg-b2-caribbean text-b2-ink";

  const palette = (
    <div>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-5">
        {qs.map((x, n) => {
          const a = answeredQ(x.id);
          const f = flags.has(x.id);
          return (
            <button
              key={x.id}
              type="button"
              onClick={() => go(n)}
              aria-label={`Question ${n + 1}${a ? ", answered" : ""}${f ? ", flagged" : ""}`}
              className={`tabular relative grid h-11 place-items-center rounded-xl border text-sm font-semibold ${
                n === i ? "ring-2 ring-b2-flash ring-offset-2 ring-offset-b2-black" : ""
              } ${a ? "border-transparent bg-b2-caribbean text-b2-ink" : "border-b2-divider text-b2-pistachio"} ${
                f ? "!border-2 !border-b2-warning" : ""
              }`}
            >
              {n + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-b2-pistachio">
        <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded bg-b2-caribbean" /> Answered</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded border-2 border-b2-warning" /> Flagged</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded border border-b2-divider" /> Blank</span>
      </div>
    </div>
  );

  return (
    <div ref={top} className="scroll-mt-20">
      {/* sticky exam header */}
      <div className="sticky top-14 z-30 -mx-4 border-b border-b2-border bg-b2-black/95 px-4 pb-3 pt-3 backdrop-blur-md md:top-0 md:mx-0 md:rounded-b-2xl md:px-0">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setLeaveOpen(true)}
            aria-label="Leave exam"
            className="pressable flex min-h-10 flex-none items-center gap-1 rounded-full border border-b2-border px-3 text-sm font-medium text-b2-pistachio hover:text-b2-flash"
          >
            <X size={16} /> Leave
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-b2-pistachio sm:text-sm">Exam · {data.set.title}</p>
            <p className="text-sm font-semibold sm:text-base">
              Question {i + 1} <span className="text-b2-stone">of {qs.length}</span>
              <span className="ml-2 text-xs font-normal text-b2-stone">
                {saveState === "saving" ? "Saving…" : saveState === "error" ? "Not saved — retrying" : "Saved"}
              </span>
            </p>
          </div>
          <span className={`tabular flex-none rounded-full px-4 py-1.5 text-lg font-semibold ${timerTone}`} aria-live="off">
            {fmt(left)}
          </span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-b2-pine">
          <div
            className="h-full bg-b2-caribbean transition-all"
            style={{ width: `${(qs.filter((x) => answeredQ(x.id)).length / qs.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-[1fr_260px]">
        <div>
          <QuestionCard
            q={q}
            number={i + 1}
            source={sourceLine(q, data.set.kind)}
            answers={answers}
            revealed={false}
            onChange={(id, v) => {
              setAnswers((a) => ({ ...a, [id]: v }));
              schedule(q.id);
            }}
          />
        </div>
        <aside className="hidden md:block">
          <div className="sticky top-28 rounded-[20px] border border-b2-border bg-b2-dark p-4">
            <p className="mb-3 font-semibold">Questions</p>
            {palette}
            <button type="button" onClick={() => setConfirm(true)} className={btn("primary", "md", "mt-5 w-full")}>
              Submit exam
            </button>
          </div>
        </aside>
      </div>

      {/* sticky bottom action bar */}
      <div className="safe-bottom sticky bottom-16 z-20 -mx-4 mt-6 border-t border-b2-border bg-b2-black/95 px-4 py-3 backdrop-blur-md md:bottom-0 md:mx-0 md:rounded-2xl md:border">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className={btn("ghost", "md", "px-3")} aria-label="Previous">
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => {
              setFlags((f) => {
                const n = new Set(f);
                if (n.has(q.id)) n.delete(q.id);
                else n.add(q.id);
                flagsRef.current = n;
                return n;
              });
              schedule(q.id);
            }}
            className={btn(flags.has(q.id) ? "primary" : "secondary", "md", `px-4 ${flags.has(q.id) ? "!bg-b2-warning" : ""}`)}
          >
            <Flag size={16} /> {flags.has(q.id) ? "Flagged" : "Flag"}
          </button>
          <button type="button" onClick={() => setPaletteOpen(true)} className={btn("secondary", "md", "px-4 md:hidden")} aria-label="All questions">
            <Grid3x3 size={16} />
          </button>
          {i < qs.length - 1 ? (
            <button type="button" onClick={() => go(i + 1)} className={btn("primary", "md", "ml-auto flex-1 sm:flex-none")}>
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} className={btn("primary", "md", "ml-auto flex-1 sm:flex-none")}>
              Submit
            </button>
          )}
        </div>
      </div>

      {/* mobile palette bottom sheet */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 md:hidden" onClick={() => setPaletteOpen(false)}>
          <div className="safe-bottom w-full rounded-t-[28px] border-t border-b2-border bg-b2-dark p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold">All questions</p>
              <button type="button" onClick={() => setPaletteOpen(false)} aria-label="Close" className="grid size-10 place-items-center">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[50dvh] overflow-y-auto">{palette}</div>
            <button type="button" onClick={() => { setPaletteOpen(false); setConfirm(true); }} className={btn("primary", "lg", "mt-5 w-full")}>
              Submit exam
            </button>
          </div>
        </div>
      )}

      {/* leave confirm */}
      {leaveOpen && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 sm:place-items-center" role="dialog" aria-modal="true">
          <div className="safe-bottom w-full rounded-t-[28px] border border-b2-border bg-b2-dark p-6 sm:max-w-md sm:rounded-[28px]">
            <p className="text-xl font-semibold">Leave the exam?</p>
            <p className="mt-2 text-b2-pistachio">
              Your answers are saved. The timer keeps running: open this paper again from the list to continue before
              time runs out.
            </p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setLeaveOpen(false)} className={btn("primary", "md", "flex-1")}>
                Keep going
              </button>
              <button
                type="button"
                disabled={leaving}
                aria-busy={leaving || undefined}
                onClick={async () => {
                  setLeaving(true);
                  await flush();
                  signalNavStart();
                  router.push(`/mcq/${data.set.kind}`);
                }}
                className={btn("secondary", "md", "flex-1")}
              >
                {leaving ? (
                  <>
                    <B2Mark className="is-loading" size={18} grain={false} decorative /> Saving…
                  </>
                ) : (
                  "Leave"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* submit confirm */}
      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 sm:place-items-center" role="dialog" aria-modal="true">
          <div className="safe-bottom w-full rounded-t-[28px] border border-b2-border bg-b2-dark p-6 sm:max-w-md sm:rounded-[28px]">
            {submitting ? (
              <div className="grid place-items-center gap-3 py-6">
                <B2Mark className="is-loading" size={56} decorative />
                <p>Submitting your exam…</p>
              </div>
            ) : (
              <>
                <p className="text-xl font-semibold">Submit your exam?</p>
                <p className="mt-2 text-b2-pistachio">
                  {blankStatements > 0
                    ? `You have ${blankStatements} blank statement${blankStatements === 1 ? "" : "s"}. A blank scores 0; a wrong answer costs 0.06.`
                    : "You've answered every statement."}
                  {flags.size > 0 && ` ${flags.size} question${flags.size === 1 ? " is" : "s are"} flagged for review.`}
                </p>
                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={() => setConfirm(false)} className={btn("secondary", "md", "flex-1")}>
                    Keep going
                  </button>
                  <button type="button" onClick={submit} className={btn("primary", "md", "flex-1")}>
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
