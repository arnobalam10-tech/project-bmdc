import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AuthShell } from "../AuthShell";
import { SignupForm } from "../forms";

export const metadata: Metadata = { title: "Sign up free" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ from?: string; o?: string }> }) {
  const { from, o } = await searchParams;
  let email: string | undefined;
  if (o && /^[0-9a-f-]{36}$/i.test(o)) {
    const { data } = await (await createClient()).rpc("get_order_receipt", { p_id: o }).maybeSingle<{ email: string | null }>();
    email = data?.email ?? undefined;
  }
  return (
    <AuthShell
      title={from === "workshop" ? "Register for the free workshop" : "Create your free account"}
      sub={
        from === "workshop"
          ? "Sign up free. The Google Meet link for 20 November appears on your dashboard."
          : email
            ? "Use the same email as your order, so your course unlocks on this account."
            : "Free account first. Join the batch whenever you're ready."
      }
    >
      <SignupForm from={from} email={email} />
    </AuthShell>
  );
}
