"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Check, Copy } from "lucide-react";
import { B2Mark } from "@/components/brand/B2";
import { useNow } from "@/lib/useNow";
import { btn } from "./Button";

export function SubmitButton({
  children,
  pending: pendingLabel = "Please wait",
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: {
  children: ReactNode;
  pending?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
  name?: string;
  value?: string;
  formAction?: (fd: FormData) => void | Promise<void>;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={btn(variant, size, className)} {...rest}>
      {pending ? (
        <>
          <B2Mark className="is-loading" size={20} grain={false} decorative /> {pendingLabel}…
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-b2-meadow px-3.5 text-sm font-medium text-b2-meadow hover:bg-b2-meadow/10"
      aria-label={`${label} ${text}`}
    >
      {done ? <Check size={16} /> : <Copy size={16} />}
      {done ? "Copied" : label}
    </button>
  );
}

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** Days / hours / min / sec boxes. Renders nothing meaningful until mounted (avoids hydration mismatch). */
export function Countdown({
  to,
  size = "md",
  onDone,
  doneLabel = "Live now",
}: {
  to: string;
  size?: "sm" | "md" | "lg";
  onDone?: () => void;
  doneLabel?: string;
}) {
  const target = new Date(to).getTime();
  const now = useNow();
  useEffect(() => {
    if (now !== null && now >= target) onDone?.();
  }, [now, target, onDone]);

  if (now !== null && now >= target) {
    return (
      <span className="inline-flex items-center gap-2 font-semibold text-b2-caribbean">
        <span className="live-dot" /> {doneLabel}
      </span>
    );
  }
  const p = parts(now === null ? 0 : target - now);
  const box = {
    sm: "min-w-12 max-w-20 flex-1 px-2 py-1.5 text-lg",
    md: "min-w-0 max-w-24 flex-1 px-2 py-2.5 text-2xl sm:text-3xl",
    lg: "min-w-0 max-w-28 flex-1 px-1 py-3 text-[28px] sm:text-5xl",
  }[size];
  const units: [string, number][] = [
    ["Days", p.d],
    ["Hours", p.h],
    ["Min", p.m],
    ["Sec", p.s],
  ];
  return (
    <div className="flex w-full min-w-0 gap-2 sm:gap-3" aria-label="Countdown">
      {units.map(([label, v]) => (
        <div
          key={label}
          className={`tabular flex flex-col items-center rounded-2xl border border-b2-caribbean/30 bg-b2-black/60 font-semibold shadow-[0_12px_40px_rgba(0,223,129,.12)] ${box}`}
        >
          <span suppressHydrationWarning>{now === null ? "--" : String(v).padStart(2, "0")}</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-b2-pistachio sm:text-xs">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Small inline countdown text like "2d 4h" / "12:03" */
export function CountdownText({ to }: { to: string }) {
  const now = useNow();
  if (now === null) return <span className="tabular">…</span>;
  const p = parts(new Date(to).getTime() - now);
  const txt =
    p.d > 0 ? `${p.d}d ${p.h}h` : p.h > 0 ? `${p.h}h ${p.m}m` : `${String(p.m).padStart(2, "0")}:${String(p.s).padStart(2, "0")}`;
  return <span className="tabular">{txt}</span>;
}
