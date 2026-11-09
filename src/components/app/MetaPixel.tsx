"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type Fbq = (...args: unknown[]) => void;
declare global {
  interface Window {
    fbq?: Fbq;
  }
}

/** Fire a standard pixel event. Safe to call when the pixel is off. */
export function track(event: string, params?: Record<string, unknown>, eventId?: string) {
  if (!PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, params ?? {}, eventId ? { eventID: eventId } : undefined);
}

/** Loads the Meta pixel once, sends PageView on every route change and Contact on WhatsApp taps. */
export function MetaPixel() {
  const path = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (!PIXEL_ID) return;
    if (first.current) {
      first.current = false; // the base code already sent the first PageView
      return;
    }
    window.fbq?.("track", "PageView");
  }, [path]);

  useEffect(() => {
    if (!PIXEL_ID) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (a && /wa\.me\//.test(a.href)) track("Contact", { method: "whatsapp" });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!PIXEL_ID) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
    </Script>
  );
}

/** Fires one pixel event when mounted (e.g. ViewContent on the landing page). */
export function PixelEvent({ event, params, eventId }: { event: string; params?: Record<string, unknown>; eventId?: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    // wait a moment for fbq to load on first visit
    let tries = 0;
    const t = setInterval(() => {
      if (window.fbq || ++tries > 20) {
        clearInterval(t);
        if (!sent.current) {
          sent.current = true;
          track(event, params, eventId);
        }
      }
    }, 150);
    return () => clearInterval(t);
  }, [event, params, eventId]);
  return null;
}
