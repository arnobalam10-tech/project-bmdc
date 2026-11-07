import type { Metadata } from "next";

export const revalidate = 300;
import { MessageCircle } from "lucide-react";
import { B2Mark } from "@/components/brand/B2";
import { ButtonLink } from "@/components/ui/Button";
import { getSettings, waLink } from "@/lib/settings";

export const metadata: Metadata = { title: "Account active on another device" };

export default async function DeviceBlockedPage() {
  const s = await getSettings();
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-b2-border bg-b2-dark p-8 text-center">
        <B2Mark className="is-heartbeat mx-auto" size={80} />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Your account is active on another device.</h1>
        <p className="mt-3 leading-relaxed text-b2-pistachio">
          Each Project BMDC account works on one device, to keep the course fair for everyone. Changed your phone or
          laptop? Message us and we&apos;ll move your account. It takes a few minutes.
        </p>
        <div className="mt-8 grid gap-3">
          <ButtonLink
            href={waLink(s.whatsapp_number, "Hi, I changed my device. Please reset my Project BMDC account. My email: ")}
            external
            size="lg"
          >
            <MessageCircle size={18} /> Message us on WhatsApp
          </ButtonLink>
          <ButtonLink href="/" variant="ghost">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
