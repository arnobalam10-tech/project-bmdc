"use client";

import { Check, Lightbulb, X } from "lucide-react";
import type { Option, Question } from "./types";

type Answers = Record<string, boolean | null>;

/** The RQE True/False card from our posts: stem + 4 statements, T and F columns, 44px targets. */
export function QuestionCard({
  q,
  number,
  source,
  answers,
  onChange,
  revealed,
}: {
  q: Question;
  number: number;
  source: string;
  answers: Answers;
  onChange?: (optionId: string, value: boolean | null) => void;
  revealed: boolean;
}) {
  const nCorrect = q.options.filter((o) => o.is_correct).length;
  return (
    <div className="space-y-4">
      <div className="rounded-[20px] border border-b2-border bg-b2-dark p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs text-b2-pistachio sm:text-sm">{source}</p>
          {revealed && (
            <span
              className={`flex-none rounded-full px-3 py-1 text-xs font-semibold ${
                nCorrect === 4 ? "bg-b2-caribbean text-b2-ink" : "bg-b2-pine text-b2-caribbean"
              }`}
            >
              {nCorrect} / 4 correct
            </span>
          )}
        </div>
        <h2 className="mt-2 text-[19px] font-medium leading-snug sm:text-[22px]">
          <span className="mr-1.5 text-b2-stone">{number}.</span>
          {q.stem}
        </h2>

        <div className="mt-4">
          <div className="flex items-center gap-1 pl-1 text-xs font-semibold text-b2-pistachio">
            <span className="w-11 text-center">T</span>
            <span className="w-11 text-center">F</span>
          </div>
          <ul className="mt-1 space-y-1.5">
            {q.options.map((o) => (
              <OptionRow
                key={o.id}
                o={o}
                value={answers[o.id] ?? null}
                revealed={revealed}
                onChange={onChange ? (v) => onChange(o.id, v) : undefined}
                qid={q.id}
              />
            ))}
          </ul>
          {!revealed && <p className="mt-3 text-xs italic text-b2-stone">Mark each statement True or False. Tap again to clear.</p>}
          {revealed && (
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-b2-pistachio">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-b2-flash" /> Your answer
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-3 rounded-full border-2 border-dashed border-b2-caribbean" /> Correct answer
              </span>
            </div>
          )}
        </div>
      </div>

      {revealed && <Explanation q={q} answers={answers} />}
    </div>
  );
}

function Radio({
  checked,
  correct,
  wrong,
  label,
  name,
  onClick,
  disabled,
}: {
  checked: boolean;
  correct: boolean;
  wrong: boolean;
  label: string;
  name: string;
  onClick?: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={label}
      name={name}
      disabled={disabled}
      onClick={onClick}
      className="grid size-11 flex-none place-items-center rounded-full disabled:cursor-default"
    >
      <span
        className={`grid size-7 place-items-center rounded-full border-2 transition-colors ${
          checked
            ? wrong
              ? "border-b2-error"
              : "border-b2-caribbean"
            : correct
              ? "border-dashed border-b2-caribbean"
              : "border-b2-stone"
        }`}
      >
        {checked && <span className={`size-3.5 rounded-full ${wrong ? "bg-b2-error" : "bg-b2-caribbean"}`} />}
      </span>
    </button>
  );
}

function OptionRow({
  o,
  value,
  revealed,
  onChange,
  qid,
}: {
  o: Option;
  value: boolean | null;
  revealed: boolean;
  onChange?: (v: boolean | null) => void;
  qid: string;
}) {
  const wrong = revealed && value !== null && o.is_true !== null && value !== o.is_true;
  const set = (v: boolean) => onChange?.(value === v ? null : v);
  return (
    <li
      className={`flex items-center gap-1 rounded-2xl pr-2 ${wrong ? "bg-b2-error/10" : revealed && value === null ? "bg-b2-black/40" : ""}`}
      role="radiogroup"
      aria-label={`${o.label}. ${o.text}`}
    >
      <Radio
        name={`${qid}-${o.id}`}
        label={`${o.label} True`}
        checked={value === true}
        correct={revealed && o.is_true === true}
        wrong={wrong && value === true}
        onClick={() => set(true)}
        disabled={revealed || !onChange}
      />
      <Radio
        name={`${qid}-${o.id}`}
        label={`${o.label} False`}
        checked={value === false}
        correct={revealed && o.is_true === false}
        wrong={wrong && value === false}
        onClick={() => set(false)}
        disabled={revealed || !onChange}
      />
      <span className="min-w-0 flex-1 py-2.5 pl-1 text-[16px] leading-snug sm:text-[17px]">
        <span className="font-medium">{o.label}.</span> {o.text}
      </span>
      {revealed &&
        (value === null ? (
          <span className="flex-none text-xs text-b2-stone">blank</span>
        ) : wrong ? (
          <span className="grid size-6 flex-none place-items-center rounded-full bg-b2-error text-b2-ink">
            <X size={14} strokeWidth={3} />
          </span>
        ) : (
          <span className="grid size-6 flex-none place-items-center rounded-full bg-b2-caribbean text-b2-ink">
            <Check size={14} strokeWidth={3} />
          </span>
        ))}
    </li>
  );
}

export function Explanation({ q, answers }: { q: Question; answers: Answers }) {
  const hasAny = q.options.some((o) => o.explanation) || q.pearl;
  if (!hasAny) return null;
  return (
    <div className="rounded-[20px] border border-b2-border bg-b2-dark p-4 sm:p-6">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-b2-caribbean">
        <Lightbulb size={16} /> Explanation
      </p>
      <ul className="mt-3 space-y-3">
        {q.options.map((o) => {
          const a = answers[o.id] ?? o.answer;
          const wrong = a !== null && a !== undefined && a !== o.is_true;
          return (
            <li key={o.id} className="flex gap-3 text-[15px] leading-relaxed sm:text-base">
              <span
                className={`mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-md text-xs font-bold ${
                  o.is_true ? "bg-b2-caribbean text-b2-ink" : "bg-b2-stone/40 text-b2-flash"
                }`}
              >
                {o.is_true ? "T" : "F"}
              </span>
              <span>
                <b className="font-semibold">{o.text}:</b> {o.explanation ?? ""}{" "}
                {wrong && <span className="font-medium text-b2-error">You marked {a ? "T" : "F"}</span>}
              </span>
            </li>
          );
        })}
      </ul>
      {q.pearl && (
        <p className="mt-4 border-t border-dashed border-b2-divider pt-4 text-[15px] leading-relaxed sm:text-base">
          <b className="text-b2-caribbean">Exam pearl:</b> {q.pearl}
        </p>
      )}
    </div>
  );
}
