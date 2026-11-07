"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { MessageCircle, X } from "lucide-react";
import { CopyButton } from "@/components/ui/client";
import { btn } from "@/components/ui/Button";
import type { SiteSettings } from "@/lib/site";
import { waLink } from "@/lib/site";
import { taka } from "@/lib/format";

export function EnrollSteps({
  s,
  email,
  compact = false,
}: {
  s: Pick<SiteSettings, "bkash_number" | "whatsapp_number" | "offer_price">;
  email?: string;
  compact?: boolean;
}) {
  const msg = `Assalamu alaikum. I've paid ${taka(s.offer_price)} for Project BMDC by bKash.\nRegistered email: ${
    email ?? "(your email)"
  }\nTrxID: `;
  const steps: { title: string; body: ReactNode }[] = [
    {
      title: "Create your free account",
      body: email ? (
        <>
          Done. You&apos;re signed in as <span className="text-b2-flash">{email}</span>.
        </>
      ) : (
        <>
          Sign up with Google or email. It takes 30 seconds.{" "}
          <a href="/signup" className="text-b2-caribbean underline-offset-4 hover:underline">
            Sign up →
          </a>
        </>
      ),
    },
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
      title: "Send the TrxID + screenshot on WhatsApp",
      body: (
        <div className="flex flex-wrap items-center gap-3">
          <span>
            Include your registered email. WhatsApp{" "}
            <span className="tabular font-semibold text-b2-flash">{s.whatsapp_number}</span>
          </span>
          <a
            href={waLink(s.whatsapp_number, msg)}
            target="_blank"
            rel="noopener noreferrer"
            className={btn("primary", "sm")}
          >
            <MessageCircle size={16} /> Open WhatsApp
          </a>
        </div>
      ),
    },
    {
      title: "We verify and unlock your account",
      body: "Once we confirm your payment, everything unlocks on your account: live classes, recordings, notes and all MCQs.",
    },
  ];
  return (
    <ol className={`grid gap-3 ${compact ? "" : "md:grid-cols-2"}`}>
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

/** Button that opens a bottom sheet (mobile) / modal (desktop) with price + bKash steps. */
export function EnrollButton({
  s,
  email,
  label = "Join the batch",
  className,
}: {
  s: Pick<SiteSettings, "bkash_number" | "whatsapp_number" | "offer_price" | "price">;
  email?: string;
  label?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className ?? btn("primary", "md")}>
        {label}
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialog.current && setOpen(false)}
        className="m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-[32px] border border-b2-border bg-b2-black p-0 text-b2-flash backdrop:bg-black/70 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-2xl sm:rounded-[32px]"
      >
        <div className="b2-film spring rounded-t-[32px] px-5 pb-6 pt-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow !text-b2-flash/90">Join the batch</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {taka(s.offer_price)}{" "}
                <span className="text-lg font-normal text-b2-flash/70 line-through">{taka(s.price)}</span>
              </p>
              <p className="mt-1 text-sm text-b2-flash/80">Full 4-month course · one payment</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="grid size-11 place-items-center rounded-full bg-b2-black/40 hover:bg-b2-black/60"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="safe-bottom p-5 sm:p-8">
          <EnrollSteps s={s} email={email} compact />
        </div>
      </dialog>
    </>
  );
}
