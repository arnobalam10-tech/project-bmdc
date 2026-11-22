import { cache } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: "student" | "admin";
  is_paid: boolean;
  access_expires_at: string | null;
  admin_note: string | null;
  multi_device: boolean;
  max_devices: number;
  created_at: string;
  last_active_at: string | null;
};

export type AccessStatus = "admin" | "paid" | "expired" | "free";

export function accessStatus(p: Pick<Profile, "role" | "is_paid" | "access_expires_at">): AccessStatus {
  if (p.role === "admin") return "admin";
  if (!p.is_paid) return "free";
  if (p.access_expires_at && new Date(p.access_expires_at) <= new Date()) return "expired";
  return "paid";
}

export const hasFullAccess = (s: AccessStatus) => s === "admin" || s === "paid";

/** Current user + profile, or redirect to /login. Cached per request. */
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  if (!profile) redirect("/login");
  let status = accessStatus(profile);
  // admins can preview the student side as a paid or a free student (screens only; the database still treats them as admin)
  let viewAs: "admin" | "paid" | "free" = "admin";
  if (profile.role === "admin") {
    const v = (await cookies()).get(VIEW_AS_COOKIE)?.value;
    if (v === "paid" || v === "free") {
      viewAs = v;
      status = v;
    }
  }
  return { supabase, user, profile, status, full: hasFullAccess(status), viewAs };
});

export const VIEW_AS_COOKIE = "bmdc_view_as";

export const requireAdmin = cache(async () => {
  const ctx = await requireUser();
  if (ctx.profile.role !== "admin") redirect("/dashboard");
  return ctx;
});
