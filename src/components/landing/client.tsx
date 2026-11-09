"use client";

import { useEffect, useMemo, useState } from "react";
import { useNow } from "@/lib/useNow";
import Link from "next/link";
import { Menu, MessageCircle, X } from "lucide-react";
import { B2Logo } from "@/components/brand/B2";
import { btn } from "@/components/ui/Button";
import { taka } from "@/lib/format";
import type { ScheduledClass } from "@/lib/curriculum";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV = [
  ["Workshop", "#workshop"],
  ["Course", "#course"],
  ["Instructors", "#instructors"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
] as const;

/** "20 Nov, 8 PM" (or "20 Nov, 8:30 PM") in Bangladesh time, from the workshop setting */
function barWhen(iso: string) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short" }).format(d);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dhaka", hour: "numeric", minute: "2-digit", hour12: true }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const min = get("minute");
  return `${day}, ${get("hour")}${min === "00" ? "" : `:${min}`} ${get("dayPeriod").toUpperCase()}`;
}

/** Sticky header: transparent over the hero, solid after scrolling. Full-screen menu on mobile. */
export function Header({ workshopAt }: { workshopAt: string }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const now = useNow(); // null until hydrated, so the bar never flashes in SSR HTML
  const barHidden = useMemo(() => {
    if (now === null || dismissed) return true;
    let stored = false;
    try {
      stored = localStorage.getItem("bmdc_wbar") === workshopAt;
    } catch {}
    return stored || now > new Date(workshopAt).getTime() + 2 * 3600_000;
  }, [now, dismissed, workshopAt]);

  useEffect(() => {
    // checked in the browser so the landing page itself stays static/cached
    createClient()
      .auth.getSession()
      .then(({ data }) => setSignedIn(!!data.session))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      {!barHidden && (
        <div className="b2-film spring text-sm">
          <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-3 px-4 py-2">
            <span className="live-dot hidden flex-none sm:block" />
            <a href="#workshop" className="font-medium">
              <span className="font-semibold">Free workshop</span> · {barWhen(workshopAt)} ·{" "}
              <span className="underline underline-offset-4">Register free →</span>
            </a>
            <button
              type="button"
              aria-label="Dismiss"
              className="ml-auto grid size-8 flex-none place-items-center rounded-full hover:bg-black/20 sm:ml-0"
              onClick={() => {
                setDismissed(true);
                try {
                  localStorage.setItem("bmdc_wbar", workshopAt);
                } catch {}
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      <div
        className={`site-header-bar transition-colors duration-300 ${
          solid || open ? "border-b border-b2-border bg-b2-dark/90 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-[1200px] items-center gap-2 px-3 sm:gap-4 sm:px-6 md:h-[72px]">
          <B2Logo variant="wide" className="!text-[20px] md:hidden" intro />
          <B2Logo className="hidden !text-[20px] md:inline-flex" intro />
          <div className="ml-6 hidden items-center gap-1 md:flex">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} className="rounded-full px-3 py-2 text-[15px] text-b2-pistachio hover:text-b2-flash">
                {label}
              </a>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            {signedIn ? (
              <Link href="/dashboard" className={btn("primary", "sm", "md:min-h-11 md:px-5")}>
                My profile
              </Link>
            ) : (
              <>
                <span className="hidden sm:block">
                  <Link href="/login" className={btn("ghost", "sm")}>
                    Log in
                  </Link>
                </span>
                <Link href="/signup" className={btn("primary", "sm", "px-3.5 sm:px-4 md:min-h-11 md:px-5")}>
                  Join free
                </Link>
              </>
            )}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
              className="grid size-11 place-items-center rounded-full text-b2-flash hover:bg-white/5 md:hidden"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </div>
      {open && (
        <div className="b2-film deep fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto md:hidden">
          <div className="flex flex-col gap-1 p-6">
            {NAV.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="border-b border-b2-divider py-4 text-2xl font-medium"
              >
                {label}
              </a>
            ))}
            <div className="mt-8 grid gap-3">
              {signedIn ? (
                <Link href="/dashboard" className={btn("primary", "lg")}>
                  My profile
                </Link>
              ) : (
                <>
                  <Link href="/signup" className={btn("primary", "lg")}>
                    Sign up free
                  </Link>
                  <Link href="/login" className={btn("secondary", "lg")}>
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/** Sticky bottom CTA on phones: appears after the hero, hides while #pricing is visible. */
export function MobileCtaBar({ price, whatsapp }: { price: number; whatsapp: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.getElementById("hero");
    const pricing = document.getElementById("pricing");
    let pastHero = false;
    let pricingVisible = false;
    const update = () => setShow(pastHero && !pricingVisible);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) pastHero = !e.isIntersecting;
        if (e.target === pricing) pricingVisible = e.isIntersecting;
      }
      update();
    });
    if (hero) io.observe(hero);
    if (pricing) io.observe(pricing);
    return () => io.disconnect();
  }, []);
  return (
    <div
      className={`safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-b2-border bg-b2-dark/95 backdrop-blur-md transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="leading-tight">
          <p className="text-lg font-semibold">{taka(price)}</p>
          <p className="text-xs text-b2-pistachio">Batch starts 1 Dec</p>
        </div>
        <Link href="/enroll" className={btn("primary", "md", "ml-auto flex-1")}>
          Join the batch
        </Link>
        <a
          href={`https://wa.me/88${whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp us"
          className="grid size-12 flex-none place-items-center rounded-full border border-b2-meadow text-b2-meadow"
        >
          <MessageCircle size={20} />
        </a>
      </div>
    </div>
  );
}

/** 16-week outline with subject filter chips (horizontal scroll on phones). */
export function CourseOutline({ classes, subjects }: { classes: ScheduledClass[]; subjects: string[] }) {
  const [active, setActive] = useState<string>("All");
  const [expanded, setExpanded] = useState(false);
  const shown = active === "All" ? classes : classes.filter((c) => c.subject === active);
  const allWeeks = [...new Set(shown.map((c) => c.week))];
  const collapsible = allWeeks.length > 4;
  return (
    <div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {["All", ...subjects].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActive(s)}
            className={`min-h-10 flex-none rounded-full border px-4 text-sm font-medium transition-colors ${
              active === s
                ? "border-transparent bg-b2-caribbean text-b2-ink"
                : "border-b2-border bg-b2-dark text-b2-meadow hover:border-b2-meadow"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {allWeeks.map((w, n) => (
          <div
            key={w}
            className={`rounded-[20px] border border-b2-border bg-b2-dark p-4 ${
              collapsible && !expanded && n >= 4 ? "hidden md:block" : ""
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-b2-caribbean">Week {w}</p>
            <ul className="mt-3 space-y-2.5">
              {shown
                .filter((c) => c.week === w)
                .map((c) => (
                  <li key={c.code} className="flex gap-2 text-[15px] leading-snug">
                    <span className="tabular mt-0.5 flex-none text-xs text-b2-stone">C{c.cls}</span>
                    <span>
                      {c.topic}
                      <span className="block text-xs text-b2-pistachio">{c.subject}</span>
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className={btn("secondary", "md", "mt-4 w-full md:hidden")}
        >
          {expanded ? "Show less" : `Show all ${allWeeks.length} weeks`}
        </button>
      )}
    </div>
  );
}
