"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  ChevronLeft,
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
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { B2Logo } from "@/components/brand/B2";
import { signOut } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type Item = { href: string; label: string; icon: LucideIcon };

export const STUDENT_NAV: Item[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/classes", label: "Classes", icon: Video },
  { href: "/mcq", label: "MCQ", icon: ClipboardList },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/profile", label: "Profile", icon: User },
];

export const ADMIN_NAV: Item[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
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

/** Where "back" goes from a nested page (null = top-level page, no back button). */
export function parentOf(path: string): { href: string; label: string } | null {
  const seg = path.split("/").filter(Boolean);
  if (seg[0] === "classes" && seg[1]) return { href: "/classes?tab=recorded", label: "Recorded classes" };
  if (seg[0] === "mcq" && seg[1] === "attempt" && seg[3] === "review") return { href: `/mcq/attempt/${seg[2]}`, label: "Result" };
  if (seg[0] === "mcq" && seg[1] === "attempt") return { href: "/mcq", label: "MCQ" };
  if (seg[0] === "mcq" && seg[1]) return { href: "/mcq", label: "MCQ" };
  if (seg[0] === "notes" && seg[1]) return { href: "/notes", label: "Notes" };
  if (seg[0] === "leaderboard") return { href: "/profile", label: "Profile" };
  if (seg[0] === "admin" && seg[1] === "students" && seg[2]) return { href: "/admin/students", label: "Students" };
  return null;
}

/** Lives inside a <Link>: shows the tab as "on its way" the moment it's tapped. */
function TabInner({ active, icon: Icon, label, layout }: { active: boolean; icon: LucideIcon; label: string; layout: "tab" | "side" }) {
  const { pending } = useLinkStatus();
  const on = active || pending;
  if (layout === "tab") {
    return (
      <span className={`flex flex-col items-center justify-center gap-1 ${on ? "text-b2-caribbean" : "text-b2-pistachio"} ${pending ? "link-pending" : ""}`}>
        <span className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${on ? "bg-b2-pine" : ""}`}>
          <Icon size={22} strokeWidth={on ? 2.25 : 1.75} />
        </span>
        {label}
      </span>
    );
  }
  return (
    <span className={`flex w-full items-center gap-3 ${pending ? "link-pending" : ""}`}>
      <Icon size={20} strokeWidth={1.75} /> {label}
      {pending && <span className="ml-auto size-2 rounded-full bg-b2-caribbean" aria-hidden />}
    </span>
  );
}

function LogoutButton({ className }: { className: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={className}>
      <LogOut size={20} strokeWidth={1.75} /> {pending ? "Logging out…" : "Log out"}
    </button>
  );
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
              className={`pressable flex min-h-11 items-center rounded-xl px-3 text-[15px] font-medium transition-colors ${
                active ? "bg-b2-pine text-b2-caribbean" : "text-b2-pistachio hover:bg-white/5 hover:text-b2-flash"
              }`}
            >
              <TabInner active={active} icon={Icon} label={label} layout="side" />
            </Link>
          );
        })}
        {!admin && (
          <Link
            href="/leaderboard"
            className={`pressable flex min-h-11 items-center rounded-xl px-3 text-[15px] font-medium ${
              isActive(path, "/leaderboard") ? "bg-b2-pine text-b2-caribbean" : "text-b2-pistachio hover:bg-white/5 hover:text-b2-flash"
            }`}
          >
            <TabInner active={isActive(path, "/leaderboard")} icon={Trophy} label="Leaderboard" layout="side" />
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
          <LogoutButton className="pressable flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-[15px] text-b2-pistachio hover:bg-white/5 hover:text-b2-flash disabled:opacity-60" />
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
              className="pressable flex items-center justify-center text-[11px] font-medium"
            >
              <TabInner active={active} icon={Icon} label={label} layout="tab" />
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
  const parent = parentOf(path);
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-b2-border bg-b2-black/90 px-4 backdrop-blur-md md:hidden">
      {parent ? (
        <Link
          href={parent.href}
          aria-label={`Back to ${parent.label}`}
          className="pressable -ml-2 flex min-h-11 items-center gap-0.5 rounded-full pl-1 pr-3 font-medium text-b2-meadow"
        >
          <ChevronLeft size={24} strokeWidth={2} /> <span className="truncate">{parent.label}</span>
        </Link>
      ) : (
        <>
          <B2Logo variant="wide" className="!text-[17px]" href={items[0].href} />
          <span className="text-b2-stone">/</span>
          <span className="truncate font-medium">{current}</span>
        </>
      )}
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
