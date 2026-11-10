import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { B2Mark } from "@/components/brand/B2";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-[20px] border border-b2-border bg-b2-dark p-5 sm:p-6 ${className}`}>{children}</div>
  );
}

export function Pill({
  children,
  tone = "meadow",
  className = "",
}: {
  children: ReactNode;
  tone?: "meadow" | "caribbean" | "warning" | "error" | "stone";
  className?: string;
}) {
  const tones = {
    meadow: "bg-b2-pine text-b2-meadow border-b2-border",
    caribbean: "bg-b2-caribbean text-b2-ink border-transparent",
    warning: "bg-b2-warning/10 text-b2-warning border-b2-warning/40",
    error: "bg-b2-error/10 text-b2-error border-b2-error/40",
    stone: "bg-b2-black text-b2-pistachio border-b2-divider",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  sub,
  center = false,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-[680px] ${className}`}>
      {eyebrow && <p className="eyebrow mb-2 sm:mb-3">{eyebrow}</p>}
      <h2 className="text-[25px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[30px] md:text-[44px]">{title}</h2>
      {sub && <div className="mt-3 text-[15px] leading-relaxed text-b2-pistachio sm:mt-4 sm:text-[17px]">{sub}</div>}
    </div>
  );
}

export function PageHeader({ title, sub, action }: { title: ReactNode; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[32px]">{title}</h1>
        {sub && <p className="mt-1 text-b2-pistachio">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-b2-divider px-6 py-14 text-center">
      <B2Mark className="is-wave" size={64} decorative />
      <p className="mt-2 text-lg font-medium">{title}</p>
      {sub && <p className="max-w-sm text-b2-pistachio">{sub}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function LockBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-b2-black/70 px-2.5 py-1 text-xs font-medium text-b2-pistachio">
      <Lock size={12} strokeWidth={2} /> Locked
    </span>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-b2-border bg-b2-dark p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-b2-pistachio">{label}</p>
      <p className="tabular mt-2 text-[26px] font-semibold leading-none tracking-tight sm:text-[30px]">{value}</p>
      {hint && <p className="mt-2 text-xs text-b2-pistachio">{hint}</p>}
    </div>
  );
}

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success" | "warning";
  children: ReactNode;
}) {
  const t = {
    info: "border-b2-meadow",
    error: "border-b2-error",
    success: "border-b2-caribbean",
    warning: "border-b2-warning",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border-l-4 bg-b2-dark p-4 text-sm ${t}`}>
      {children}
    </div>
  );
}
