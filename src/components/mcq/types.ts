export type Option = {
  id: string;
  label: "A" | "B" | "C" | "D";
  text: string;
  answer: boolean | null;
  is_true: boolean | null; // revealed only after check / submit
  is_correct: boolean | null;
  explanation: string | null;
};

export type Question = {
  id: string;
  position: number;
  stem: string;
  subject: string | null;
  chapter: string | null;
  pyq_year: number | null;
  pyq_session: string | null;
  pearl: string | null;
  options: Option[];
};

export type AttemptData = {
  attempt: {
    id: string;
    mode: "practice" | "exam";
    started_at: string;
    deadline_at: string | null;
    submitted_at: string | null;
    n_questions: number;
    score: number | null;
    n_correct: number | null;
    n_wrong: number | null;
    n_blank: number | null;
    server_now: string;
    free_limit: number | null;
  };
  set: { id: string; title: string; kind: "pyq" | "model" | "topic"; duration_min: number; total_questions: number };
  locked_count: number;
  flags: string[];
  questions: Question[];
};

export const KIND_LABEL = { pyq: "Previous year", model: "Model test", topic: "Topic-wise" } as const;

export function sourceLine(q: Question, kind: AttemptData["set"]["kind"]) {
  const bits = [q.pyq_year ? `Previous year ${q.pyq_session ?? ""} ${q.pyq_year}`.replace(/\s+/g, " ") : KIND_LABEL[kind], q.subject, q.chapter];
  return bits.filter(Boolean).join(" · ");
}
