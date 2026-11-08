import { Sparkles } from "lucide-react";
import { EnrollButton } from "@/components/enroll/Enroll";
import { btn } from "@/components/ui/Button";
import type { SiteSettings } from "@/lib/site";
import { taka } from "@/lib/format";

/** Shown to free accounts on the MCQ pages: what's free, what the course unlocks. */
export function FreeNote({
  freeQuestions,
  totalQuestions,
  s,
  email,
}: {
  freeQuestions: number;
  totalQuestions: number;
  s: SiteSettings;
  email: string;
}) {
  const locked = Math.max(totalQuestions - freeQuestions, 0);
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-[20px] border border-b2-caribbean/40 bg-b2-pine p-4 sm:flex-row sm:items-center sm:p-5">
      <span className="grid size-11 flex-none place-items-center rounded-2xl bg-b2-caribbean text-b2-ink">
        <Sparkles size={22} />
      </span>
      <div className="flex-1">
        <p className="font-semibold">
          Free account: {freeQuestions} questions to try, with full answers and explanations.
        </p>
        <p className="mt-1 text-[15px] text-b2-pistachio">
          The first 10 of May 2025 and the first 2 of every other paper and chapter. The other {locked} unlock when you join
          the batch.
        </p>
      </div>
      <EnrollButton s={s} email={email} label={`Unlock all ${totalQuestions} · ${taka(s.offer_price)}`} className={btn("primary", "sm")} />
    </div>
  );
}
