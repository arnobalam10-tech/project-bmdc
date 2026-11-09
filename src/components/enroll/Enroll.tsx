import type { ReactNode } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/ui/client";
import { btn } from "@/components/ui/Button";
import type { SiteSettings } from "@/lib/site";
import { taka } from "@/lib/format";

/** The 3 enrol steps (landing page). The order itself is placed on /enroll. */
export function EnrollSteps({
  s,
  compact = false,
}: {
  s: Pick<SiteSettings, "bkash_number" | "offer_price">;
  compact?: boolean;
}) {
  const steps: { title: string; body: ReactNode }[] = [
    {
      title: `Send ${taka(s.offer_price)} with bKash “Send Money”`,
      body: (
        <div className="flex flex-wrap items-center gap-3">
          <span>
            To <span className="tabular text-lg font-semibold text-b2-flash">{s.bkash_number}</span>{" "}
            <span className="text-b2-pistachio">(Personal)</span>
          </span>
          <CopyButton text={s.bkash_number} />
        </div>
      ),
    },
    {
      title: "Place your order",
      body: (
        <div className="space-y-3">
          <p>Tell us the bKash number you sent it from. No TrxID or screenshot needed. New here? Your account is created in the same step.</p>
          <Link href="/enroll" className={btn("primary", "sm")}>
            Place order →
          </Link>
        </div>
      ),
    },
    {
      title: "We verify and unlock your account",
      body: "We match the number with the payment, then everything unlocks: live classes, recordings, notes and all MCQs.",
    },
  ];
  return (
    <ol className={`grid gap-3 ${compact ? "" : "md:grid-cols-3"}`}>
      {steps.map((st, i) => (
        <li key={i} className="flex gap-4 rounded-[20px] border border-b2-border bg-b2-dark p-4 sm:p-5">
          <span className="grid size-9 flex-none place-items-center rounded-full bg-b2-caribbean font-semibold text-b2-ink">
            {i + 1}
          </span>
          <div className="min-w-0 space-y-2">
            <p className="font-semibold">{st.title}</p>
            <div className="text-[15px] leading-relaxed text-b2-pistachio">{st.body}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** "Join the batch" → the /enroll checkout page. (Props kept for the existing call sites.) */
export function EnrollButton({
  label = "Join the batch",
  className,
}: {
  s?: unknown;
  email?: string;
  label?: ReactNode;
  className?: string;
}) {
  return (
    <Link href="/enroll" className={className ?? btn("primary", "md")}>
      {label}
    </Link>
  );
}
