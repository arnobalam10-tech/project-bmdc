"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; ok?: string } | undefined;

export async function updateProfile(_: ProfileState, fd: FormData): Promise<ProfileState> {
  const name = String(fd.get("full_name") ?? "").trim();
  const phone = String(fd.get("phone") ?? "")
    .replace(/[\s-]/g, "")
    .replace(/^\+?880/, "0");
  if (name.length < 2) return { error: "Enter your full name." };
  if (!/^01[3-9]\d{8}$/.test(phone)) return { error: "Enter a valid Bangladeshi number, e.g. 01XXXXXXXXX" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_my_profile", { p_full_name: name, p_phone: phone });
  if (error) return { error: "That didn't go through. Check your connection and try again." };
  revalidatePath("/profile");
  return { ok: "Saved." };
}
