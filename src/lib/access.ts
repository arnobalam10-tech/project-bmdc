import { cache } from "react";
import { redirect } from "next/navigation";
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
  const status = accessStatus(profile);
  return { supabase, user, profile, status, full: hasFullAccess(status) };
});

export const requireAdmin = cache(async () => {
  const ctx = await requireUser();
  if (ctx.profile.role !== "admin") redirect("/dashboard");
  return ctx;
});
