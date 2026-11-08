import { Lock } from "lucide-react";
import { EnrollButton } from "@/components/enroll/Enroll";
import { btn } from "@/components/ui/Button";
import type { SiteSettings } from "@/lib/site";
import { taka } from "@/lib/format";

/**
 * Blurred stand-ins for the questions a free account can't open, with the join message.
 * The blurred cards are placeholder text only: locked questions are never sent to the browser.
 */
export function LockedQuestions({
  lockedCount,
  total,
  s,
  email,
  compact = false,
}: {
  lockedCount: number;
  total: number;
  s: SiteSettings;
  email: string;
  compact?: boolean;
}) {
  if (lockedCount <= 0) return null;
  const ghosts = compact ? 1 : 2;
  return (
    <section aria-label="Locked questions" className="relative mt-6 overflow-hidden rounded-[24px]">
      <div aria-hidden className="pointer-events-none select-none space-y-3 blur-[6px]">
        {Array.from({ length: ghosts }, (_, n) => (
          <div key={n} className="rounded-[20px] border border-b2-border bg-b2-dark p-5">
            <div className="h-3 w-40 rounded-full bg-b2-divider" />
            <div className="mt-3 h-5 w-3/4 rounded-full bg-b2-divider" />
            {["w-2/3", "w-1/2", "w-3/5", "w-2/5"].map((w) => (
              <div key={w} className="mt-4 flex items-center gap-3">
                <span className="size-6 rounded-full border-2 border-b2-stone" />
                <span className="size-6 rounded-full border-2 border-b2-stone" />
                <span className={`h-4 rounded-full bg-b2-divider ${w}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 grid items-start justify-items-center bg-gradient-to-b from-b2-black/60 via-b2-black/75 to-b2-black/90 p-5 pt-8">
        <div className="max-w-sm text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-b2-caribbean text-b2-ink shadow-[0_8px_24px_rgba(0,223,129,.35)]">
            <Lock size={22} />
          </span>
          <p className="mt-3 text-lg font-semibold">
            {lockedCount} more question{lockedCount === 1 ? "" : "s"} in this set
          </p>
          <p className="mt-1 text-[15px] text-b2-pistachio">
            Join the batch to unlock all {total} with answers and explanations, plus every other paper, chapter, class and note.
          </p>
          <div className="mt-4">
            <EnrollButton s={s} email={email} label={`Join the batch · ${taka(s.offer_price)}`} className={btn("primary", "md")} />
          </div>
        </div>
      </div>
    </section>
  );
}
