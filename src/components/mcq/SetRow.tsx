import { Lock, Timer } from "lucide-react";
import { startAttempt } from "@/app/(student)/mcq/actions";
import { SubmitButton } from "@/components/ui/client";
import { Pill } from "@/components/ui/primitives";

export type SetSummary = {
  id: string;
  title: string;
  kind: "pyq" | "model" | "topic";
  duration_min: number;
  is_free_sample: boolean;
  count: number;
  best: number | null; // best exam %
};

export function SetRow({ set, open, showFree, enroll }: { set: SetSummary; open: boolean; showFree: boolean; enroll: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-3 rounded-[20px] border border-b2-border bg-b2-dark p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{set.title}</p>
          {showFree && set.is_free_sample && <Pill>Free</Pill>}
          {!open && <Lock size={16} className="text-b2-stone" />}
        </div>
        <p className="mt-1 text-sm text-b2-pistachio">
          {set.count} question{set.count === 1 ? "" : "s"} · <Timer size={14} className="inline -translate-y-px" /> {set.duration_min} min
          {set.best !== null && <span className="ml-2 text-b2-caribbean">Best {set.best}%</span>}
        </p>
      </div>
      {open ? (
        <form action={startAttempt} className="flex gap-2">
          <input type="hidden" name="set_id" value={set.id} />
          <SubmitButton name="mode" value="practice" variant="secondary" size="sm" className="flex-1 sm:flex-none" pending="Opening">
            Practice
          </SubmitButton>
          <SubmitButton name="mode" value="exam" size="sm" className="flex-1 sm:flex-none" pending="Starting">
            Exam
          </SubmitButton>
        </form>
      ) : (
        enroll
      )}
    </li>
  );
}
