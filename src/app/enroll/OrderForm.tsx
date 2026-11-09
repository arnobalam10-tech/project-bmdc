"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";
import { CopyButton, SubmitButton } from "@/components/ui/client";
import { Alert } from "@/components/ui/primitives";
import { taka } from "@/lib/format";
import { placeOrder } from "./actions";

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="b2-label" htmlFor={id}>
        {label}
      </label>
      <div className={error ? "rounded-[12px] ring-2 ring-b2-error/70" : ""}>{children}</div>
      {hint && <p className="mt-1.5 text-xs text-b2-pistachio">{hint}</p>}
    </div>
  );
}

function BdNumber({ id, defaultValue, placeholder = "1XXXXXXXXX" }: { id: string; defaultValue?: string; placeholder?: string }) {
  return (
    <div className="flex">
      <span className="grid place-items-center rounded-l-[10px] border border-r-0 border-b2-border bg-b2-pine px-3 text-b2-pistachio">
        +880
      </span>
      <input
        id={id}
        name={id}
        type="tel"
        inputMode="numeric"
        autoComplete={id === "phone" ? "tel-national" : "off"}
        placeholder={placeholder}
        required
        defaultValue={defaultValue}
        className="b2-input tabular !rounded-l-none text-[17px]"
      />
    </div>
  );
}

export function OrderForm({
  name,
  email,
  phone,
  bkashNumber,
  price,
  bkashDefault,
  submitLabel,
}: {
  name?: string;
  email?: string;
  phone?: string;
  bkashNumber: string;
  price: number;
  bkashDefault?: string;
  submitLabel?: string;
}) {
  const [state, action] = useActionState(placeOrder, undefined);
  const [same, setSame] = useState(!bkashDefault || bkashDefault === phone);
  const bad = (f: string) => state?.field === f;
  const v = state?.values ?? {};

  return (
    <form key={state?.n ?? 0} action={action} className="space-y-5" noValidate>
      {/* ── details ── */}
      <section className="rounded-[24px] border border-b2-border bg-b2-dark p-5 sm:p-6">
        <h2 className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="grid size-8 flex-none place-items-center rounded-full bg-b2-caribbean text-sm font-semibold text-b2-ink">1</span>
          Your details
        </h2>
        <div className="mt-5 space-y-4">
          <Field id="full_name" label="Full name" error={bad("full_name")}>
            <input id="full_name" name="full_name" autoComplete="name" required defaultValue={v.full_name ?? name} placeholder="Dr. Your Name" className="b2-input" />
          </Field>
          <Field id="phone" label="Phone / WhatsApp" error={bad("phone")} hint="With or without the first 0.">
            <BdNumber id="phone" defaultValue={v.phone ?? phone} />
          </Field>
          <Field id="email" label="Email" error={bad("email")} hint="Your course access is linked to this email.">
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              required
              defaultValue={v.email ?? email}
              placeholder="you@example.com"
              className="b2-input"
            />
          </Field>
        </div>
      </section>

      {/* ── payment ── */}
      <section className="rounded-[24px] border border-b2-border bg-b2-dark p-5 sm:p-6">
        <h2 className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="grid size-8 flex-none place-items-center rounded-full bg-b2-caribbean text-sm font-semibold text-b2-ink">2</span>
          Pay with bKash
        </h2>

        <div className="mt-5 overflow-hidden rounded-[20px] border border-[#E2136E]/30">
          <div className="flex items-center justify-between gap-3 bg-[#E2136E] px-4 py-2.5 text-white">
            <span className="text-sm font-semibold tracking-wide">bKash · Send Money</span>
            <span className="tabular text-lg font-semibold">{taka(price)}</span>
          </div>
          <div className="flex items-center gap-3 bg-b2-black/30 px-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-b2-pistachio">Send to (Personal)</p>
              <p className="tabular text-[26px] font-semibold leading-tight tracking-tight">{bkashNumber}</p>
            </div>
            <CopyButton text={bkashNumber} />
          </div>
        </div>
        <p className="mt-3 text-sm text-b2-pistachio">
          bKash app → <b className="font-medium text-b2-flash">Send Money</b> → {bkashNumber} → {taka(price)} → PIN.
        </p>

        <div className="mt-5 space-y-3">
          <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-b2-border bg-b2-black/30 px-4 py-3">
            <input
              type="checkbox"
              name="same_as_phone"
              checked={same}
              onChange={(e) => setSame(e.target.checked)}
              className="size-5 flex-none accent-[#00DF81]"
            />
            <span className="text-[15px]">I paid from my phone number above</span>
          </label>
          {!same && (
            <Field id="bkash_number" label="bKash number you paid from" error={bad("bkash_number")}>
              <BdNumber id="bkash_number" defaultValue={v.bkash_number ?? bkashDefault} />
            </Field>
          )}
          <p className="flex items-start gap-2 text-xs text-b2-pistachio">
            <ShieldCheck size={15} className="mt-px flex-none text-b2-meadow" />
            We match this number with the payment. No TrxID or screenshot needed.
          </p>
        </div>
      </section>

      {state?.error && <Alert tone="error">{state.error}</Alert>}

      {/* ── place order: sticky on phones ── */}
      <div className="safe-bottom sticky bottom-0 z-30 -mx-4 border-t border-b2-border bg-b2-black/90 px-4 pb-3 pt-3 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <SubmitButton size="lg" className="w-full !text-[17px]" pending="Placing your order">
          {submitLabel ?? `Place order · ${taka(price)}`}
        </SubmitButton>
        <p className="mt-2 text-center text-[11px] leading-relaxed text-b2-pistachio sm:text-xs">
          <Lock size={11} className="mr-1 inline -translate-y-px" />
          By ordering you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2">
            terms
          </Link>
          . One account works on one device.
        </p>
      </div>
    </form>
  );
}
