import { Lock, Sparkles, Timer } from "lucide-react";
import { startAttempt } from "@/app/(student)/mcq/actions";
import { SubmitButton } from "@/components/ui/client";
import { Pill } from "@/components/ui/primitives";

export type SetSummary = {
  id: string;
  title: string;
  kind: "pyq" | "model" | "topic";
  duration_min: number;
  is_free_sample: boolean;
  free_count: number;
  count: number;
  best: number | null; // best exam %
};

/** How a set looks to this student: fully open, a free preview of the first N questions, or locked. */
export function setAccess(set: Pick<SetSummary, "is_free_sample" | "free_count" | "count">, full: boolean) {
  if (full || set.is_free_sample) return { mode: "full" as const, freeN: set.count };
  const freeN = Math.min(set.free_count, set.count);
  return freeN > 0 ? { mode: "preview" as const, freeN } : { mode: "locked" as const, freeN: 0 };
}

export function SetRow({ set, full, enroll }: { set: SetSummary; full: boolean; enroll: React.ReactNode }) {
  const access = setAccess(set, full);
  const minutes =
    access.mode === "preview" ? Math.max(1, Math.ceil((set.duration_min * access.freeN) / Math.max(set.count, 1))) : set.duration_min;
  return (
    <li className="flex flex-col gap-3 rounded-[20px] border border-b2-border bg-b2-dark p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{set.title}</p>
          {access.mode === "preview" && (
            <Pill>
              <Sparkles size={12} /> {access.freeN} free of {set.count}
            </Pill>
          )}
          {!full && set.is_free_sample && <Pill>Free</Pill>}
          {access.mode === "locked" && <Lock size={16} className="text-b2-stone" />}
        </div>
        <p className="mt-1 text-sm text-b2-pistachio">
          {access.mode === "preview" ? (
            <>
              Try the first {access.freeN} · {set.count - access.freeN} more with the full course
            </>
          ) : (
            <>
              {set.count} question{set.count === 1 ? "" : "s"}
            </>
          )}{" "}
          · <Timer size={14} className="inline -translate-y-px" /> {minutes} min
          {set.best !== null && <span className="ml-2 text-b2-caribbean">Best {set.best}%</span>}
        </p>
      </div>
      {access.mode === "locked" ? (
        enroll
      ) : (
        <form action={startAttempt} className="flex gap-2">
          <input type="hidden" name="set_id" value={set.id} />
          <SubmitButton name="mode" value="practice" variant="secondary" size="sm" className="flex-1 sm:flex-none" pending="Opening">
            Practice
          </SubmitButton>
          <SubmitButton name="mode" value="exam" size="sm" className="flex-1 sm:flex-none" pending="Starting">
            Exam
          </SubmitButton>
        </form>
      )}
    </li>
  );
}
