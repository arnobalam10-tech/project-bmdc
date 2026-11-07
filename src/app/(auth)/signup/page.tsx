import type { Metadata } from "next";
import { AuthShell } from "../AuthShell";
import { SignupForm } from "../forms";

export const metadata: Metadata = { title: "Sign up free" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  return (
    <AuthShell
      title={from === "workshop" ? "Register for the free workshop" : "Create your free account"}
      sub={
        from === "workshop"
          ? "Sign up free. The Google Meet link for 20 November appears on your dashboard."
          : "Free account first. Join the batch whenever you're ready."
      }
    >
      <SignupForm from={from} />
    </AuthShell>
  );
}
