import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthShell } from "../AuthShell";
import { ResetForm } from "../forms";

export const metadata: Metadata = { title: "New password" };

export default async function ResetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password");
  return (
    <AuthShell title="Choose a new password" sub={`For ${user.email}`}>
      <ResetForm />
    </AuthShell>
  );
}
