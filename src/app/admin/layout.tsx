import type { Metadata } from "next";
import { requireAdmin } from "@/lib/access";
import { ADMIN_NAV, AdminMobileMenu, MobileTopBar, Sidebar } from "@/components/app/Nav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Project BMDC" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="flex min-h-dvh">
      <Sidebar items={ADMIN_NAV} isAdmin admin />
      <div className="min-w-0 flex-1">
        <MobileTopBar items={ADMIN_NAV} />
        <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-5 sm:px-6 md:pt-10">
          <AdminMobileMenu />
          {children}
        </main>
      </div>
    </div>
  );
}
