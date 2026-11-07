import { MessageCircle } from "lucide-react";
import type { AccessStatus } from "@/lib/access";
import type { SiteSettings } from "@/lib/settings";
import { waLink } from "@/lib/settings";
import { fmtDate, taka } from "@/lib/format";
import { EnrollButton } from "@/components/enroll/Enroll";
import { btn } from "@/components/ui/Button";

export function StatusBanner({
  status,
  expires,
  s,
  email,
}: {
  status: AccessStatus;
  expires: string | null;
  s: SiteSettings;
  email: string;
}) {
  if (status === "admin") return null;
  if (status === "paid") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-b2-border bg-b2-dark px-4 py-3 text-sm">
        <span className="rounded-full bg-b2-caribbean px-2.5 py-0.5 text-xs font-semibold text-b2-ink">Enrolled</span>
        <span className="text-b2-pistachio">
          Full access{expires ? ` until ${fmtDate(expires)}` : ""}. You&apos;ve already done the hard part. Here&apos;s the plan.
        </span>
      </div>
    );
  }
  if (status === "expired") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-b2-warning/40 bg-b2-warning/5 p-4">
        <p className="flex-1 text-[15px]">
          Your access ended on {expires ? fmtDate(expires) : "your end date"}. Message us on WhatsApp to extend it.
        </p>
        <a href={waLink(s.whatsapp_number, `Hi, I'd like to extend my Project BMDC access. My email: ${email}`)} target="_blank" rel="noopener noreferrer" className={btn("primary", "sm")}>
          <MessageCircle size={16} /> WhatsApp us
        </a>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-b2-border bg-b2-dark p-4 sm:flex-row sm:items-center sm:p-5">
      <div className="flex-1">
        <p className="font-semibold">You&apos;re on a free account.</p>
        <p className="mt-0.5 text-[15px] text-b2-pistachio">
          Join the batch for live classes, every recording, all MCQs and notes. {taka(s.offer_price)}, starts{" "}
          {fmtDate(s.batch_start, { year: undefined })}.
        </p>
      </div>
      <EnrollButton s={s} email={email} />
    </div>
  );
}
