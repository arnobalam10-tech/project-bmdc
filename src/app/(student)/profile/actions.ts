"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeBdPhone, PHONE_ERROR } from "@/lib/phone";

export type ProfileState = { error?: string; ok?: string } | undefined;

export async function updateProfile(_: ProfileState, fd: FormData): Promise<ProfileState> {
  const name = String(fd.get("full_name") ?? "").trim();
  const phone = normalizeBdPhone(String(fd.get("phone") ?? ""));
  if (name.length < 2) return { error: "Enter your full name." };
  if (!phone) return { error: PHONE_ERROR };
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_my_profile", { p_full_name: name, p_phone: phone });
  if (error) return { error: "That didn't go through. Check your connection and try again." };
  revalidatePath("/profile");
  return { ok: "Saved." };
}
