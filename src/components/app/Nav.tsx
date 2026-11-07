"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Trophy,
  User,
  Video,
  CreditCard,
  CalendarClock,
  Users,
  type LucideIcon,
} from "lucide-react";
import { B2Logo } from "@/components/brand/B2";
import { signOut } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type Item = { href: string; label: string; icon: LucideIcon };

export const STUDENT_NAV: Item[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/classes", label: "Classes", icon: Video },
  { href: "/mcq", label: "MCQ", icon: ClipboardList },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/profile", label: "Profile", icon: User },
];

export const ADMIN_NAV: Item[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/live", label: "Live sessions", icon: CalendarClock },
  { href: "/admin/recordings", label: "Recordings", icon: Video },
  { href: "/admin/notes", label: "Notes", icon: FileText },
  { href: "/admin/mcq", label: "MCQ sets", icon: ClipboardList },
  { href: "/admin/curriculum", label: "Curriculum", icon: BookOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function isActive(path: string, href: string) {
  if (href === "/admin" || href === "/dashboard") return path === href;
  return path === href || path.startsWith(href + "/");
}

export function Sidebar({ items, isAdmin, admin = false }: { items: Item[]; isAdmin: boolean; admin?: boolean }) {
  const path = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] flex-none flex-col border-r border-b2-border bg-b2-dark md:flex">
      <div className="px-6 py-6">
        <B2Logo className="!text-[20px]" href={admin ? "/admin" : "/dashboard"} />
        {admin && <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-b2-caribbean">Admin panel</p>}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors ${
                active ? "bg-b2-pine text-b2-caribbean" : "text-b2-pistachio hover:bg-white/5 hover:text-b2-flash"
              }`}
            >
              <Icon size={20} strokeWidth={1.75} /> {label}
            </Link>
          );
        })}
        {!admin && (
          <Link
            href="/leaderboard"
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium ${
              isActive(path, "/leaderboard") ? "bg-b2-pine text-b2-caribbean" : "text-b2-pistachio hover:bg-white/5 hover:text-b2-flash"
            }`}
          >
            <Trophy size={20} strokeWidth={1.75} /> Leaderboard
          </Link>
        )}
      </nav>
      <div className="space-y-1 border-t border-b2-border p-3">
        {isAdmin && (
          <Link
            href={admin ? "/dashboard" : "/admin"}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] text-b2-meadow hover:bg-white/5"
          >
            <Shield size={20} strokeWidth={1.75} /> {admin ? "Student view" : "Admin panel"}
          </Link>
        )}
        <form action={signOut}>
          <button className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-[15px] text-b2-pistachio hover:bg-white/5 hover:text-b2-flash">
            <LogOut size={20} strokeWidth={1.75} /> Log out
          </button>
        </form>
        <div className="flex items-center justify-between rounded-xl px-3 text-[15px] text-b2-pistachio">
          Theme <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

/** Fixed bottom tab bar on phones (design.md §4.2). */
export function BottomTabs({ items }: { items: Item[] }) {
  const path = usePathname();
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-b2-border bg-b2-dark/95 backdrop-blur-md md:hidden">
      <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                active ? "text-b2-caribbean" : "text-b2-pistachio"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Sticky compact top bar on phones. */
export function MobileTopBar({ items, right }: { items: Item[]; right?: React.ReactNode }) {
  const path = usePathname();
  const current =
    [...items, { href: "/leaderboard", label: "Leaderboard", icon: Trophy }].find((i) => isActive(path, i.href))?.label ??
    "";
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-b2-border bg-b2-black/90 px-4 backdrop-blur-md md:hidden">
      <B2Logo variant="wide" className="!text-[17px]" href={items[0].href} />
      <span className="text-b2-stone">/</span>
      <span className="truncate font-medium">{current}</span>
      <div className="ml-auto flex items-center gap-1">
        {right}
        <ThemeToggle />
      </div>
    </div>
  );
}

export function AdminMobileMenu() {
  const path = usePathname();
  return (
    <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:hidden">
      {ADMIN_NAV.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`flex min-h-10 flex-none items-center rounded-full border px-4 text-sm font-medium ${
            isActive(path, href) ? "border-transparent bg-b2-caribbean text-b2-ink" : "border-b2-border text-b2-meadow"
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
