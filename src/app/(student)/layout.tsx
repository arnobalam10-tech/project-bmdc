import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield, Trophy } from "lucide-react";
import { requireUser } from "@/lib/access";
import { BottomTabs, MobileTopBar, Sidebar, STUDENT_NAV } from "@/components/app/Nav";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();
  if (!profile.phone && profile.role !== "admin") redirect("/onboarding");
  const isAdmin = profile.role === "admin";

  return (
    <div className="flex min-h-dvh">
      <Sidebar items={STUDENT_NAV} isAdmin={isAdmin} />
      <div className="min-w-0 flex-1">
        <MobileTopBar
          items={STUDENT_NAV}
          right={
            <>
              {isAdmin && (
                <Link href="/admin" aria-label="Admin panel" className="grid size-10 place-items-center rounded-full text-b2-meadow">
                  <Shield size={20} />
                </Link>
              )}
              <Link href="/leaderboard" aria-label="Leaderboard" className="grid size-10 place-items-center rounded-full text-b2-meadow">
                <Trophy size={20} />
              </Link>
            </>
          }
        />
        <main className="mx-auto w-full max-w-[1100px] px-4 pb-28 pt-5 sm:px-6 md:pb-12 md:pt-10">{children}</main>
      </div>
      <BottomTabs items={STUDENT_NAV} />
    </div>
  );
}
