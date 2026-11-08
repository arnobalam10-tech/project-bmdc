import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "white";
type Size = "md" | "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[color,background-color,border-color,transform,opacity] duration-150 select-none active:scale-[.97] disabled:cursor-not-allowed disabled:bg-b2-basil disabled:text-b2-stone disabled:border-transparent disabled:active:scale-100 aria-busy:cursor-progress aria-busy:opacity-90 whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-b2-caribbean text-b2-ink hover:bg-b2-meadow active:bg-b2-frog active:text-b2-flash",
  secondary: "border border-b2-meadow text-b2-meadow hover:bg-b2-meadow/10 active:bg-b2-meadow/20",
  ghost: "text-b2-pistachio hover:text-b2-flash hover:bg-white/5",
  danger: "bg-b2-error text-b2-ink hover:brightness-110",
  white: "bg-white text-b2-ink border border-b2-border hover:bg-b2-flash",
};
const sizes: Record<Size, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-6 text-[15px]",
  lg: "min-h-14 px-7 text-base",
};

/** Builds button classes; size tokens (px-, min-h-, text-) are dropped when `extra` overrides them. */
export function btn(variant: Variant = "primary", size: Size = "md", extra = "") {
  const extraTokens = extra.split(/\s+/);
  const overridden = (t: string) => {
    const prefix = t.match(/^(px|min-h|text)-/)?.[0];
    return !!prefix && extraTokens.some((e) => e.startsWith(prefix));
  };
  const sizeTokens = sizes[size].split(" ").filter((t) => !overridden(t));
  return `${base} ${variants[variant]} ${sizeTokens.join(" ")} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={btn(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  href,
  children,
  external,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  variant?: Variant;
  size?: Size;
  external?: boolean;
  children: ReactNode;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={btn(variant, size, className)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={btn(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
