import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, CircleCheck, Clock, MessageCircle, Smartphone } from "lucide-react";
import { B2Logo, B2Mark } from "@/components/brand/B2";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CopyButton } from "@/components/ui/client";
import { Alert, Pill } from "@/components/ui/primitives";
import { btn } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { accessStatus, type Profile } from "@/lib/access";
import { getSettings, waLink, type SiteSettings } from "@/lib/settings";
import { fmtDate, fmtDateTime, taka } from "@/lib/format";
import { OrderForm } from "./OrderForm";

export const metadata: Metadata = {
  title: "Join the batch",
  description: "Enroll in the 4-month BMDC RQE course. Pay with bKash, place your order, and we unlock your account.",
};

type Order = {
  id: string;
  number: number;
  amount: number;
  bkash_number: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
};

const INCLUDED = [
  "48 live classes on Google Meet",
  "Every class recorded",
  "All previous papers 2017–2025",
  "Topic-wise MCQs with explanations",
  "Timed mock exams with RQE marking",
  "Chapter-wise notes",
];

export default async function EnrollPage({ searchParams }: { searchParams: Promise<{ placed?: string }> }) {
  const { placed } = await searchParams;
  const s = await getSettings();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let order: Order | null = null;
  if (user) {
    const [{ data: p }, { data: o }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>(),
      supabase
        .from("orders")
        .select("id,number,amount,bkash_number,status,admin_note,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<Order>(),
    ]);
    profile = p;
    order = o;
  }
  const status = profile ? accessStatus(profile) : null;
  const enrolled = status === "paid" || status === "admin";
  const pending = !enrolled && order?.status === "pending" ? order : null;
  const rejected = !enrolled && order?.status === "rejected" ? order : null;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-b2-border bg-b2-black/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1100px] items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="pressable -ml-2 grid size-10 place-items-center rounded-full text-b2-meadow" aria-label="Back to home">
            <ArrowLeft size={20} />
          </Link>
          <B2Logo variant="wide" className="!text-[18px]" />
          <span className="ml-auto" />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 sm:px-6 md:pt-10">
        {enrolled ? (
          <Enrolled until={profile?.access_expires_at ?? null} />
        ) : pending ? (
          <Pending order={pending} s={s} email={profile?.email ?? ""} justPlaced={placed === "1"} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
            <div className="space-y-5">
              <div>
                <p className="eyebrow">Checkout</p>
                <h1 className="mt-2 text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] md:text-[40px]">
                  Join the batch. <em className="hl">Two quick steps.</em>
                </h1>
                <p className="mt-2 text-b2-pistachio">Send the course fee with bKash, then tell us the number you sent it from.</p>
              </div>

              <div className="lg:hidden">
                <Summary s={s} compact />
              </div>

              {rejected && (
                <Alert tone="error">
                  We couldn&apos;t find the payment for order #{rejected.number} (from {rejected.bkash_number}).
                  {rejected.admin_note ? ` ${rejected.admin_note}` : ""} Check the number and place the order again, or message us on WhatsApp.
                </Alert>
              )}

              <Step n={1} title={`Send ${taka(s.offer_price)} with bKash`}>
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-b2-border bg-b2-black/40 p-4">
                  <Smartphone className="flex-none text-b2-meadow" size={22} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-[0.12em] text-b2-pistachio">bKash “Send Money” to</p>
                    <p className="tabular text-[22px] font-semibold tracking-tight sm:text-2xl">{s.bkash_number}</p>
                    <p className="text-xs text-b2-pistachio">Personal number</p>
                  </div>
                  <CopyButton text={s.bkash_number} />
                </div>
                <ol className="mt-4 grid gap-2 text-[15px] text-b2-pistachio sm:grid-cols-2">
                  {[
                    "Open bKash → Send Money",
                    `Enter ${s.bkash_number}`,
                    `Amount: ${taka(s.offer_price)}`,
                    "Confirm with your PIN",
                  ].map((t, i) => (
                    <li key={t} className="flex gap-2.5">
                      <span className="tabular grid size-6 flex-none place-items-center rounded-full bg-b2-pine text-xs font-semibold text-b2-meadow">
                        {String.fromCharCode(97 + i)}
                      </span>
                      {t}
                    </li>
                  ))}
                </ol>
              </Step>

              <Step n={2} title="Place your order">
                <OrderForm
                  signedIn={!!user}
                  name={profile?.full_name}
                  email={profile?.email ?? undefined}
                  phone={profile?.phone ?? undefined}
                  bkashDefault={rejected?.bkash_number ?? profile?.phone ?? undefined}
                  price={s.offer_price}
                />
              </Step>

              <div className="flex gap-4 rounded-[20px] border border-dashed border-b2-divider p-4 sm:p-5">
                <span className="grid size-9 flex-none place-items-center rounded-full bg-b2-pine text-b2-meadow">
                  <CircleCheck size={18} />
                </span>
                <div>
                  <p className="font-semibold">We verify and unlock your account</p>
                  <p className="mt-1 text-[15px] text-b2-pistachio">
                    We match your number with the payment, then everything unlocks: live classes, recordings, notes and all MCQs.
                  </p>
                </div>
              </div>
            </div>

            <aside className="hidden lg:sticky lg:top-24 lg:block">
              <Summary s={s} />
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-b2-border bg-b2-dark p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-9 flex-none place-items-center rounded-full bg-b2-caribbean font-semibold text-b2-ink">{n}</span>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Summary({ s, compact = false }: { s: SiteSettings; compact?: boolean }) {
  const save = s.price - s.offer_price;
  return (
    <div className={`b2-film spring rounded-[28px] ${compact ? "p-5" : "p-6 sm:p-7"}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.14em]">Full 4-month course</p>
      <div className="mt-3 flex items-end gap-3">
        <span className={`tabular font-semibold tracking-[-0.03em] ${compact ? "text-4xl" : "text-5xl"}`}>{taka(s.offer_price)}</span>
        <span className="tabular mb-1 text-lg text-b2-flash/70 line-through">{taka(s.price)}</span>
      </div>
      <p className="mt-2 inline-block rounded-full bg-b2-black/40 px-3 py-1 text-sm">
        One payment · save {taka(save)}
      </p>
      {!compact && (
        <ul className="mt-6 space-y-2.5">
          {INCLUDED.map((t) => (
            <li key={t} className="flex gap-3">
              <Check className="mt-0.5 flex-none" size={18} strokeWidth={2.5} />
              {t}
            </li>
          ))}
        </ul>
      )}
      <div className={`${compact ? "mt-3" : "mt-6 border-t border-b2-flash/20 pt-4"} space-y-1 text-sm text-b2-flash/85`}>
        <p>Batch starts {fmtDate(s.batch_start)}</p>
        <p>Access until {fmtDate(s.default_access_end)}</p>
      </div>
      {!compact && (
        <a
          href={waLink(s.whatsapp_number, "Hi, I have a question before joining Project BMDC.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4"
        >
          <MessageCircle size={16} /> Questions? WhatsApp {s.whatsapp_number}
        </a>
      )}
    </div>
  );
}

function Pending({ order, s, email, justPlaced }: { order: Order; s: SiteSettings; email: string; justPlaced: boolean }) {
  const msg = `Assalamu alaikum. I placed order #${order.number} for Project BMDC.\nPaid ${taka(order.amount)} by bKash from ${order.bkash_number}.\nEmail: ${email}`;
  return (
    <div className="mx-auto max-w-[620px]">
      <div className="b2-film spring rounded-[32px] px-6 py-8 text-center sm:px-10">
        <B2Mark className="is-heartbeat mx-auto" size={72} />
        <h1 className="mt-5 text-[30px] font-semibold leading-tight tracking-[-0.03em] md:text-[38px]">
          {justPlaced ? "Order received." : "Your order is being verified."}
        </h1>
        <p className="mt-2 text-b2-flash/85">
          We&apos;re matching your bKash payment. Your account unlocks as soon as it&apos;s confirmed.
        </p>
      </div>

      <div className="mt-5 rounded-[24px] border border-b2-border bg-b2-dark p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="tabular text-lg font-semibold">Order #{order.number}</p>
          <Pill tone="warning">
            <Clock size={13} /> Verifying payment
          </Pill>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-b2-pistachio">Amount</dt>
            <dd className="tabular mt-0.5 text-base font-semibold">{taka(order.amount)}</dd>
          </div>
          <div>
            <dt className="text-b2-pistachio">Sent from</dt>
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
          <Link href="/dashboard" className={btn("primary", "md", "flex-1")}>
            Go to my dashboard
          </Link>
          <a href={waLink(s.whatsapp_number, msg)} target="_blank" rel="noopener noreferrer" className={btn("secondary", "md", "flex-1")}>
            <MessageCircle size={16} /> WhatsApp us
          </a>
        </div>
        <p className="mt-4 text-sm text-b2-pistachio">
          Haven&apos;t sent the money yet? Send {taka(order.amount)} with bKash “Send Money” to{" "}
          <span className="tabular font-semibold text-b2-flash">{s.bkash_number}</span> from {order.bkash_number}.
        </p>
      </div>

      <details className="group mt-5 rounded-[24px] border border-b2-border bg-b2-dark px-5 sm:px-6">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between py-4 font-medium [&::-webkit-details-marker]:hidden">
          Paid from a different number?
          <span className="text-sm text-b2-meadow group-open:hidden">Change it</span>
        </summary>
        <div className="pb-6">
          <OrderForm signedIn price={order.amount} bkashDefault={order.bkash_number} submitLabel="Update my order" />
        </div>
      </details>
    </div>
  );
}

function Enrolled({ until }: { until: string | null }) {
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
