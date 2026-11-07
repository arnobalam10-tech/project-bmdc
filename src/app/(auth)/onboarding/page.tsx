import type { Metadata } from "next";
import { requireUser } from "@/lib/access";
import { AuthShell } from "../AuthShell";
import { OnboardingForm } from "../forms";

export const metadata: Metadata = { title: "One last step" };

export default async function OnboardingPage() {
  const { profile } = await requireUser();
  return (
    <AuthShell title="One last step" sub="Add your WhatsApp number so we can verify your payment and reach you about classes.">
      <OnboardingForm name={profile.full_name} phone={profile.phone ?? undefined} />
    </AuthShell>
  );
}
