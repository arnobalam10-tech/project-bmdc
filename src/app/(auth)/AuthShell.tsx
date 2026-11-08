import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { B2Logo, B2Mark } from "@/components/brand/B2";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/** Desktop: film panel left + form right. Mobile: compact film header + form. */
export function AuthShell({
  title,
  sub,
  children,
  back = { href: "/", label: "Home" },
}: {
  title: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  back?: { href: string; label: string } | null;
}) {
  return (
    <div className="grid min-h-dvh md:grid-cols-[1fr_minmax(440px,560px)]">
      <aside className="b2-film relative hidden flex-col justify-between p-10 md:flex">
        <B2Logo />
        <div>
          <B2Mark className="is-wave mb-8" size={120} />
          <p className="text-[44px] font-semibold leading-[1.05] tracking-[-0.03em]">
            Your gateway to <em className="hl">BMDC licence.</em>
          </p>
          <p lang="bn" className="mt-3 font-bangla text-xl text-b2-pistachio">
            বিদেশে MBBS, দেশে লাইসেন্স।
          </p>
        </div>
        <p className="text-sm text-b2-pistachio">Taught by doctors who&apos;ve already passed it.</p>
      </aside>

      <main className="relative flex flex-col">
        <div className="b2-film flex items-center justify-between rounded-b-[32px] px-5 pb-8 pt-5 md:hidden">
          <B2Logo variant="wide" className="!text-[20px]" />
          <ThemeToggle />
        </div>
        <ThemeToggle className="absolute right-5 top-5 hidden md:grid" />
        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-5 py-10 sm:px-6">
          {back && (
            <Link
              href={back.href}
              className="pressable mb-6 inline-flex min-h-10 items-center gap-1.5 self-start rounded-full pr-3 font-medium text-b2-meadow hover:underline"
            >
              <ArrowLeft size={18} /> {back.label}
            </Link>
          )}
          <h1 className="text-[30px] font-semibold tracking-[-0.03em]">{title}</h1>
          {sub && <p className="mt-2 text-b2-pistachio">{sub}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
