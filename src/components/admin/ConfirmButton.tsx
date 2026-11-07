"use client";

import { useFormStatus } from "react-dom";
import { btn } from "@/components/ui/Button";

/** Submit button that asks for confirmation first (destructive admin actions). */
export function ConfirmButton({
  children,
  message,
  variant = "danger",
  size = "sm",
  className = "",
}: {
  children: React.ReactNode;
  message: string;
  variant?: "danger" | "secondary" | "primary" | "ghost";
  size?: "sm" | "md";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={btn(variant, size, className)}
    >
      {pending ? "Working…" : children}
    </button>
  );
}

/** Tiny toggle that posts a boolean flag change. */
export function FlagToggle({
  on,
  label,
}: {
  on: boolean;
  label: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-pressed={on}
      className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors ${
        on ? "border-transparent bg-b2-caribbean text-b2-ink" : "border-b2-divider text-b2-pistachio hover:border-b2-meadow"
      } ${pending ? "opacity-60" : ""}`}
    >
      <span className={`size-2 rounded-full ${on ? "bg-b2-black" : "bg-b2-stone"}`} />
      {label}
    </button>
  );
}
