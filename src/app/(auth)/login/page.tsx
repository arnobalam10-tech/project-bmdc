import type { Metadata } from "next";
import { AuthShell } from "../AuthShell";
import { LoginForm } from "../forms";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <AuthShell title="Welcome back, Doctor." sub="Log in to continue your preparation.">
      <LoginForm next={next} error={error} />
    </AuthShell>
  );
}
