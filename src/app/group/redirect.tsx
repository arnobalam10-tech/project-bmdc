"use client";

import { useEffect } from "react";
import { B2Mark } from "@/components/brand/B2";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { trackCustom } from "@/components/app/MetaPixel";
import { WA_GROUP_URL } from "@/lib/site";

export function GroupRedirect() {
  useEffect(() => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      window.location.replace(WA_GROUP_URL);
    };
    // wait for the pixel to load (first visit from an ad), then record and open the group
    let tries = 0;
    const t = setInterval(() => {
      if (window.fbq || ++tries > 12) {
        clearInterval(t);
        trackCustom("JoinWhatsAppGroup", { content_name: "Project BMDC WhatsApp group" });
        setTimeout(go, 400);
      }
    }, 150);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="b2-film grid min-h-dvh place-items-center px-6 text-center">
      <div className="max-w-sm">
        <B2Mark className="mx-auto" size={72} />
        <h1 className="mt-6 text-2xl font-semibold">Opening the WhatsApp group…</h1>
        <p className="mt-2 text-b2-pistachio">Free BMDC RQE updates, tips and batch news.</p>
        <a
          href={WA_GROUP_URL}
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 font-semibold text-white"
        >
          <WhatsAppIcon size={20} /> Join the group
        </a>
        <p className="mt-3 text-sm text-b2-pistachio">If it doesn&apos;t open, tap the button.</p>
      </div>
    </main>
  );
}
