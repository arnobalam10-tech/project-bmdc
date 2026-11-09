"use client";

import { useActionState, useRef } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { SubmitButton } from "@/components/ui/client";
import { Alert } from "@/components/ui/primitives";
import { Divider, GoogleButton, PasswordInput, PhoneInput } from "@/app/(auth)/forms";
import { taka } from "@/lib/format";
import { placeOrder } from "./actions";

function BkashInput({ defaultValue, phoneFieldId }: { defaultValue?: string; phoneFieldId?: string }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <label className="b2-label" htmlFor="bkash_number">
          bKash number you sent the money from
        </label>
        {phoneFieldId && (
          <button
            type="button"
            className="mb-1.5 flex-none text-xs font-medium text-b2-meadow hover:underline"
            onClick={() => {
              const v = (document.getElementById(phoneFieldId) as HTMLInputElement | null)?.value ?? "";
              const d = v.replace(/\D/g, "").replace(/^880/, "").replace(/^0+/, "");
              if (input.current && d) input.current.value = "0" + d;
            }}
          >
            Same as phone
          </button>
        )}
      </div>
      <input
        ref={input}
        id="bkash_number"
        name="bkash_number"
        type="tel"
        inputMode="tel"
        placeholder="01XXXXXXXXX"
        required
        defaultValue={defaultValue}
        className="b2-input tabular text-lg"
      />
      <p className="mt-1.5 text-xs text-b2-pistachio">We match this number with the payment in our bKash app. No TrxID needed.</p>
    </div>
  );
}

export function OrderForm({
  signedIn,
  name,
  email,
  phone,
  bkashDefault,
  price,
  submitLabel,
}: {
  signedIn: boolean;
  name?: string;
  email?: string;
  phone?: string;
  bkashDefault?: string;
  price: number;
  submitLabel?: string;
}) {
  const [state, action] = useActionState(placeOrder, undefined);

  return (
    <>
      {!signedIn && (
        <>
          <GoogleButton next="/enroll" />
          <Divider />
        </>
      )}
      <form action={action} className="space-y-4">
        {signedIn ? (
          <div className="rounded-2xl border border-b2-border bg-b2-black/40 px-4 py-3 text-sm">
            <p className="text-b2-pistachio">Ordering as</p>
            <p className="mt-0.5 font-medium">{name || email}</p>
            {name && email && <p className="text-b2-pistachio">{email}</p>}
          </div>
        ) : (
          <>
            <div>
              <label className="b2-label" htmlFor="full_name">Full name</label>
              <input id="full_name" name="full_name" autoComplete="name" required className="b2-input" />
            </div>
            <div>
              <label className="b2-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="b2-input" />
            </div>
            <PhoneInput defaultValue={phone} />
            <PasswordInput autoComplete="new-password" label="Create a password" />
          </>
        )}

        <BkashInput defaultValue={bkashDefault} phoneFieldId={signedIn ? undefined : "phone"} />

        {state?.error && (
          <Alert tone="error">
            {state.error}{" "}
            {state.needsLogin && (
              <Link href="/login?next=/enroll" className="font-semibold underline underline-offset-4">
                Log in →
              </Link>
            )}
          </Alert>
        )}

        <SubmitButton size="lg" className="w-full" pending="Placing your order">
          {submitLabel ?? `Place order · ${taka(price)}`}
        </SubmitButton>
        <p className="text-center text-xs leading-relaxed text-b2-pistachio">
          <Lock size={12} className="mr-1 inline -translate-y-px" />
          One account works on one device. By ordering you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2">terms</Link>.
        </p>
      </form>
      {!signedIn && (
        <p className="mt-6 text-center text-b2-pistachio">
          Already have an account?{" "}
          <Link href="/login?next=/enroll" className="font-medium text-b2-caribbean hover:underline">
            Log in
          </Link>
        </p>
      )}
    </>
  );
}
