import type { Metadata } from "next";
import { AuthShell } from "../AuthShell";
import { ForgotForm } from "../forms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPage() {
  return (
    <AuthShell title="Reset your password" sub="Enter your email and we'll send you a reset link.">
      <ForgotForm />
    </AuthShell>
  );
}
