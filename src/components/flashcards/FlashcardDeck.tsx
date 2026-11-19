"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Lightbulb, RotateCcw, Shuffle, Undo2, X } from "lucide-react";
import { btn } from "@/components/ui/Button";
import { B2Mark } from "@/components/brand/B2";

export type Card = {
  id: string;
  stem: string;
  pearl: string | null;
  pyq_year: number | null;
  pyq_session: string | null;
  options: { label: string; text: string; is_true: boolean }[];
};

function shuffled<T>(a: T[]) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/**
 * Topic flashcards: front = the MCQ stem, back = which statements are true/false + the pearl.
 * "Got it" removes the card from this round; "Again" sends it to the back of the pile.
 * Tap / Space flips; on the back, swipe right or → = got it, swipe left or ← = again.
 */
export function FlashcardDeck({
  deckKey,
  title,
  subject,
  cards,
  locked,
}: {
  deckKey: string;
  title: string;
  subject: string;
  cards: Card[];
  locked?: React.ReactNode;
}) {
  const [queue, setQueue] = useState<number[]>(() => cards.map((_, i) => i));
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [againIds, setAgainIds] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<{ queue: number[]; known: number; again: Set<string> }[]>([]);
  const [drag, setDrag] = useState(0);
  const startX = useRef<number | null>(null);

  const card = queue.length ? cards[queue[0]] : null;
  const total = cards.length;
  const firstTry = total - againIds.size; // read only once the deck is finished

  const answer = useCallback(
    (gotIt: boolean) => {
      if (!card) return;
      setHistory((h) => [...h.slice(-30), { queue, known, again: againIds }]);
      setFlipped(false);
      setDrag(0);
      if (gotIt) {
        setKnown((k) => k + 1);
        setQueue((q) => q.slice(1));
      } else {
        setAgainIds((s) => new Set(s).add(card.id));
        setQueue((q) => [...q.slice(1), q[0]]);
      }
    },
    [card, queue, known, againIds]
  );

  function undo() {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setQueue(prev.queue);
    setKnown(prev.known);
    setAgainIds(prev.again);
    setFlipped(false);
  }

  function restart(mix: boolean) {
    const order = cards.map((_, i) => i);
    setQueue(mix ? shuffled(order) : order);
    setKnown(0);
    setAgainIds(new Set());
    setHistory([]);
    setFlipped(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && e.target.closest("input,textarea")) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && e.key === "ArrowRight") answer(true);
      else if (flipped && e.key === "ArrowLeft") answer(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, answer]);

  // ───── deck finished ─────
  if (!card) {
    return (
      <div>
        <div className="b2-film spring rounded-[32px] p-6 text-center sm:p-10">
          <B2Mark className="is-heartbeat mx-auto" size={64} decorative />
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em]">Deck complete · {title}</p>
          <p className="tabular mt-3 text-6xl font-semibold tracking-[-0.03em]">
            {Math.max(0, firstTry)}
            <span className="text-2xl font-normal text-b2-flash/70"> / {total}</span>
          </p>
          <p className="mt-2 text-b2-flash/80">known on the first try</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => restart(true)} className={btn("primary", "md")}>
              <Shuffle size={18} /> Shuffle and go again
            </button>
            <Link href="/flashcards" className={btn("secondary", "md")}>
              All decks
            </Link>
          </div>
        </div>
        {locked}
      </div>
    );
  }

  const when = card.pyq_year ? `${card.pyq_session ?? ""} ${card.pyq_year}`.trim() : null;
  const done = total - queue.length;

  return (
    <div key={deckKey} className="mx-auto max-w-2xl">
      {/* header */}
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-b2-pistachio">{subject}</p>
          <h1 className="truncate text-[24px] font-semibold tracking-[-0.02em] md:text-[28px]">{title}</h1>
        </div>
        <div className="flex flex-none gap-2">
          <button type="button" onClick={undo} disabled={!history.length} className={btn("ghost", "sm", "px-3")} aria-label="Undo last card">
            <Undo2 size={18} />
          </button>
          <button type="button" onClick={() => restart(true)} className={btn("ghost", "sm", "px-3")} aria-label="Shuffle deck">
            <Shuffle size={18} />
          </button>
        </div>
      </div>

      {/* progress */}
      <div className="mb-2 flex justify-between text-xs text-b2-pistachio">
        <span className="tabular">
          {done} of {total} done
        </span>
        <span className="tabular">
          <span className="text-b2-caribbean">{known} got it</span> · <span className="text-[#F5A524]">{againIds.size} to review</span>
        </span>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-b2-pine">
        <div className="h-full bg-[#7C9CFF] transition-all" style={{ width: `${(done / total) * 100}%` }} />
      </div>

      {/* the card (both faces stacked in one grid cell so the taller face sets the height) */}
      <div className="relative" style={{ perspective: "1400px" }}>
        {queue.length > 1 && (
          <div className="absolute inset-x-4 -bottom-2 top-2 rounded-[28px] border border-b2-border bg-b2-pine/60" aria-hidden />
        )}
        <button
          type="button"
          onClick={() => Math.abs(drag) < 6 && setFlipped((f) => !f)}
          onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
          onTouchMove={(e) => flipped && startX.current !== null && setDrag(e.touches[0].clientX - startX.current)}
          onTouchEnd={() => {
            if (flipped && drag > 90) answer(true);
            else if (flipped && drag < -90) answer(false);
            else setDrag(0);
            startX.current = null;
          }}
          aria-label={flipped ? "Show question" : "Show answer"}
          className="relative grid w-full text-left transition-transform duration-500 [transform-style:preserve-3d]"
          style={{
            transform: `translateX(${drag}px) rotate(${drag / 30}deg) rotateY(${flipped ? 180 : 0}deg)`,
            transition: drag ? "none" : undefined,
          }}
        >
          {/* front */}
          <div className="col-start-1 row-start-1 flex min-h-[340px] flex-col rounded-[28px] border border-b2-border bg-b2-dark p-6 shadow-xl [backface-visibility:hidden] sm:min-h-[380px] sm:p-8">
            <div className="flex items-center justify-between gap-2 text-xs text-b2-pistachio">
              <span className="rounded-full bg-[#7C9CFF]/15 px-2.5 py-1 font-semibold text-[#5B7BE0]">Question</span>
              {when && <span>BMDC {when}</span>}
            </div>
            <p className="my-auto py-6 text-center text-[24px] font-semibold leading-snug tracking-[-0.01em] sm:text-[28px]">{card.stem}</p>
            <p className="text-center text-sm text-b2-stone">Tap to see the answer</p>
          </div>

          {/* back */}
          <div className="col-start-1 row-start-1 flex min-h-[340px] flex-col rounded-[28px] border border-b2-caribbean/40 bg-b2-dark p-5 shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)] sm:min-h-[380px] sm:p-7">
            <p className="text-[15px] font-semibold leading-snug text-b2-pistachio">{card.stem}</p>
            <ul className="mt-3 space-y-2">
              {card.options.map((o) => (
                <li
                  key={o.label}
                  className={`flex items-start gap-3 rounded-2xl border px-3 py-2.5 ${
                    o.is_true ? "border-b2-caribbean/40 bg-b2-caribbean/10" : "border-b2-border bg-b2-black/30"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid size-6 flex-none place-items-center rounded-full ${
                      o.is_true ? "bg-b2-caribbean text-b2-ink" : "bg-[#FF6B6B]/20 text-[#E5484D]"
                    }`}
                  >
                    {o.is_true ? <Check size={15} strokeWidth={3} /> : <X size={15} strokeWidth={3} />}
                  </span>
                  <span className="flex-1 text-[15px] leading-snug">{o.text}</span>
                  <span className={`text-xs font-bold ${o.is_true ? "text-b2-caribbean" : "text-[#E5484D]"}`}>{o.is_true ? "T" : "F"}</span>
                </li>
              ))}
            </ul>
            {card.pearl && (
              <div className="mt-3 flex gap-2.5 rounded-2xl bg-[#F5B13D]/10 p-3 text-[14px] leading-snug">
                <Lightbulb size={18} className="mt-0.5 flex-none text-[#F5B13D]" />
                <span>{card.pearl}</span>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* actions */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {flipped ? (
          <>
            <button
              type="button"
              onClick={() => answer(false)}
              className="pressable flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[#F5A524]/50 bg-[#F5A524]/10 font-semibold text-[#D98A1C]"
            >
              <RotateCcw size={18} /> Again
            </button>
            <button
              type="button"
              onClick={() => answer(true)}
              className="pressable flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-b2-caribbean font-semibold text-b2-ink"
            >
              <Check size={20} strokeWidth={2.5} /> Got it
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setFlipped(true)} className={btn("primary", "lg", "col-span-2 min-h-14")}>
            Show answer
          </button>
        )}
      </div>
      <p className="mt-3 hidden text-center text-xs text-b2-stone md:block">Space to flip · ← again · → got it</p>
      <p className="mt-3 text-center text-xs text-b2-stone md:hidden">Tap to flip · swipe the answer right if you got it, left to see it again</p>
      {locked}
    </div>
  );
}
