import type { Metadata } from "next";
import { requireUser } from "@/lib/access";
import { SubmitButton } from "@/components/ui/client";
import { signOut } from "../actions";
import { AuthShell } from "../AuthShell";
import { OnboardingForm } from "../forms";

export const metadata: Metadata = { title: "One last step" };

export default async function OnboardingPage() {
  const { profile } = await requireUser();
  return (
    <AuthShell back={null} title="One last step" sub="Add your WhatsApp number so we can verify your payment and reach you about classes.">
      <OnboardingForm name={profile.full_name} phone={profile.phone ?? undefined} />
      <form action={signOut} className="mt-4">
        <SubmitButton variant="ghost" size="md" className="w-full" pending="Logging out">
          Not now, log out
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
