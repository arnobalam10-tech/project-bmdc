"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/client";
import { updateProfile } from "./actions";

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [state, action] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="b2-label" htmlFor="full_name">Full name</label>
        <input id="full_name" name="full_name" defaultValue={name} className="b2-input" autoComplete="name" />
      </div>
      <div>
        <label className="b2-label" htmlFor="phone">Phone / WhatsApp</label>
        <input id="phone" name="phone" type="tel" inputMode="tel" defaultValue={phone} className="b2-input" />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <SubmitButton variant="secondary" pending="Saving">Save changes</SubmitButton>
        {state?.ok && <span className="text-sm text-b2-caribbean">{state.ok}</span>}
        {state?.error && <span className="text-sm text-b2-error">{state.error}</span>}
      </div>
    </form>
  );
}
