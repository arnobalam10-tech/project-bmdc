import Link from "next/link";
import { ArrowLeft, Check, Clock, MessageCircle, UserPlus } from "lucide-react";
import { B2Logo, B2Mark } from "@/components/brand/B2";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Pill } from "@/components/ui/primitives";
import { btn } from "@/components/ui/Button";
import { waLink, type SiteSettings } from "@/lib/site";
import { fmtDate, fmtDateTime, taka } from "@/lib/format";

export const INCLUDED = [
  "48 live classes on Google Meet",
  "Every class recorded",
  "All previous papers 2017–2025",
  "Topic-wise MCQs with explanations",
  "Timed mock exams with RQE marking",
  "Chapter-wise notes",
];

export function CheckoutShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-b2-border bg-b2-black/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1060px] items-center gap-2 px-4 py-2.5 sm:px-6">
          <Link href="/" className="pressable -ml-2 grid size-10 place-items-center rounded-full text-b2-meadow" aria-label="Back to home">
            <ArrowLeft size={20} />
          </Link>
          <B2Logo variant="wide" className="!text-[18px]" />
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-b2-pistachio">
            <span className="size-1.5 rounded-full bg-b2-caribbean" /> Secure checkout
          </span>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-[1060px] px-4 pb-10 pt-5 sm:px-6 md:pt-10">{children}</main>
    </div>
  );
}

/** Product card. compact = the slim bar shown at the top on phones. */
export function Summary({ s, compact = false }: { s: SiteSettings; compact?: boolean }) {
  const save = s.price - s.offer_price;
  if (compact) {
    return (
      <div className="b2-film spring flex items-center gap-4 rounded-[24px] p-4">
        <B2Mark size={48} decorative />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">BMDC RQE · Online course · April 2027 batch</p>
          <p className="text-xs text-b2-flash/80">Starts {fmtDate(s.batch_start, { year: undefined })} · access until {fmtDate(s.default_access_end, { year: undefined })}</p>
        </div>
        <div className="text-right">
          <p className="tabular text-xl font-semibold leading-none">{taka(s.offer_price)}</p>
          <p className="tabular mt-1 text-xs text-b2-flash/70 line-through">{taka(s.price)}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="b2-film spring rounded-[28px] p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <B2Mark size={44} decorative />
        <p className="text-sm font-semibold uppercase tracking-[0.14em]">Full 4-month online course · April 2027 batch</p>
      </div>
      <div className="mt-5 flex items-end gap-3">
        <span className="tabular text-5xl font-semibold tracking-[-0.03em]">{taka(s.offer_price)}</span>
        <span className="tabular mb-1 text-lg text-b2-flash/70 line-through">{taka(s.price)}</span>
      </div>
      <p className="mt-2 inline-block rounded-full bg-b2-black/40 px-3 py-1 text-sm">One payment · you save {taka(save)}</p>
      <ul className="mt-6 space-y-2.5">
        {INCLUDED.map((t) => (
          <li key={t} className="flex gap-3">
            <Check className="mt-0.5 flex-none" size={18} strokeWidth={2.5} />
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-1 border-t border-b2-flash/20 pt-4 text-sm text-b2-flash/85">
        <p>Batch starts {fmtDate(s.batch_start)}</p>
        <p>Access until {fmtDate(s.default_access_end)}</p>
      </div>
      <a
        href={waLink(s.whatsapp_number, "Hi, I have a question before joining Project BMDC.")}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
      >
        <MessageCircle size={16} /> Questions? WhatsApp {s.whatsapp_number}
      </a>
    </div>
  );
}

export type Receipt = {
  number: number;
  amount: number;
  bkash_number: string;
  status: "pending" | "approved" | "rejected";
  email: string | null;
  full_name: string | null;
  created_at: string;
};

/** "Order received" screen. account: what to show for the student's account. */
export function OrderReceipt({
  order,
  s,
  justPlaced,
  account,
  orderId,
}: {
  order: Receipt;
  s: SiteSettings;
  justPlaced: boolean;
  account: "signed-in" | "exists" | "none";
  orderId?: string;
}) {
  const msg = `Assalamu alaikum. I placed order #${order.number} for Project BMDC.\nPaid ${taka(order.amount)} by bKash from ${order.bkash_number}.\nEmail: ${order.email ?? ""}`;
  const approved = order.status === "approved";
  const signupHref = orderId ? `/signup?o=${orderId}` : "/signup";
  return (
    <div className="mx-auto max-w-[600px]">
      <div className="b2-film spring rounded-[32px] px-6 py-8 text-center sm:px-10">
        <B2Mark className="is-heartbeat mx-auto" size={72} />
        <h1 className="mt-5 text-[30px] font-semibold leading-tight tracking-[-0.03em] md:text-[38px]">
          {approved ? "Payment confirmed." : justPlaced ? "Order received." : "We're verifying your payment."}
        </h1>
        <p className="mt-2 text-b2-flash/85">
          {approved
            ? "Your course is unlocked on the account with your email."
            : "We're matching your bKash payment. Your course unlocks as soon as it's confirmed."}
        </p>
      </div>

      {account === "none" && (
        <div className="mt-5 rounded-[24px] border-2 border-b2-caribbean/60 bg-b2-dark p-5 sm:p-6">
          <div className="flex gap-4">
            <span className="grid size-10 flex-none place-items-center rounded-full bg-b2-caribbean text-b2-ink">
              <UserPlus size={20} />
            </span>
            <div className="min-w-0">
              <p className="font-semibold">Next: create your free account</p>
              <p className="mt-1 text-[15px] text-b2-pistachio">
                Sign up with <span className="break-all font-medium text-b2-flash">{order.email}</span>. Your course unlocks on it
                automatically once we confirm the payment.
              </p>
            </div>
          </div>
          <Link href={signupHref} className={btn("primary", "lg", "mt-5 w-full")}>
            Create my account
          </Link>
        </div>
      )}

      <div className="mt-5 rounded-[24px] border border-b2-border bg-b2-dark p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="tabular text-lg font-semibold">Order #{order.number}</p>
          {approved ? (
            <Pill tone="caribbean">Confirmed</Pill>
          ) : order.status === "rejected" ? (
            <Pill tone="error">Payment not found</Pill>
          ) : (
            <Pill tone="warning">
              <Clock size={13} /> Verifying
            </Pill>
          )}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-b2-pistachio">Amount</dt>
            <dd className="tabular mt-0.5 text-base font-semibold">{taka(order.amount)}</dd>
          </div>
          <div>
            <dt className="text-b2-pistachio">Paid from</dt>
            <dd className="tabular mt-0.5 text-base font-semibold">{order.bkash_number}</dd>
          </div>
          <div>
            <dt className="text-b2-pistachio">To (bKash)</dt>
            <dd className="tabular mt-0.5">{s.bkash_number}</dd>
          </div>
          <div>
            <dt className="text-b2-pistachio">Placed</dt>
            <dd className="mt-0.5">{fmtDateTime(order.created_at)}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {account === "signed-in" ? (
            <Link href="/dashboard" className={btn("primary", "md", "flex-1")}>
              Go to my dashboard
            </Link>
          ) : account === "exists" ? (
            <Link href="/login?next=/dashboard" className={btn("primary", "md", "flex-1")}>
              Log in to your account
            </Link>
          ) : null}
          <a href={waLink(s.whatsapp_number, msg)} target="_blank" rel="noopener noreferrer" className={btn("secondary", "md", "flex-1")}>
            <MessageCircle size={16} /> WhatsApp us
          </a>
        </div>
        {!approved && (
          <p className="mt-4 text-sm text-b2-pistachio">
            Haven&apos;t sent the money yet? Send {taka(order.amount)} with bKash “Send Money” to{" "}
            <span className="tabular font-semibold text-b2-flash">{s.bkash_number}</span> from {order.bkash_number}.
          </p>
        )}
      </div>
    </div>
  );
}

export function Enrolled({ until }: { until: string | null }) {
  return (
    <div className="mx-auto max-w-[560px] text-center">
      <div className="b2-film spring rounded-[32px] px-6 py-10 sm:px-10">
        <B2Mark className="is-heartbeat mx-auto" size={72} />
        <h1 className="mt-5 text-[30px] font-semibold tracking-[-0.03em] md:text-[38px]">You&apos;re enrolled.</h1>
        <p className="mt-2 text-b2-flash/85">
          Full access{until ? ` until ${fmtDate(until)}` : ""}. You&apos;ve already done the hard part. Here&apos;s the plan.
        </p>
        <Link href="/dashboard" className={btn("white", "lg", "mt-7")}>
          Go to my dashboard
        </Link>
      </div>
    </div>
  );
}
