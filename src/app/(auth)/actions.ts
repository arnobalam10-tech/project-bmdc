"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { claimThisDevice } from "@/lib/device";
import { normalizeBdPhone, PHONE_ERROR } from "@/lib/phone";

export type FormState = { error?: string; ok?: string } | undefined;

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function safeNext(next: FormDataEntryValue | null) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard";
}

// accepts the number with or without the leading 0 (and with +880 / 880)
const phoneSchema = z
  .string()
  .transform((v) => normalizeBdPhone(v) ?? "")
  .refine((v) => v !== "", PHONE_ERROR);

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      error: /confirm/i.test(error.message)
        ? "Your email isn't confirmed yet. Check your inbox, or message us on WhatsApp."
        : "That email and password don't match. Try again or reset your password.",
    };
  }
  if (!(await claimThisDevice(supabase))) redirect("/device-blocked");
  redirect(safeNext(fd.get("next")));
}

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email."),
  phone: phoneSchema,
  password: z.string().min(8, "Use at least 8 characters for your password."),
});

export async function signUp(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { full_name, email, phone, password } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, phone }, emailRedirectTo: `${await origin()}/auth/callback` },
  });
  if (error) {
    if (/registered|exists/i.test(error.message)) return { error: "An account with this email already exists. Log in instead." };
    return { error: "That didn't go through. Check your connection and try again." };
  }
  if (!data.session) {
    // Happens only if "Confirm email" is still ON in Supabase Auth settings.
    return { ok: "Account created. Check your email to confirm, then log in." };
  }
  if (!(await claimThisDevice(supabase))) redirect("/device-blocked");
  redirect(fd.get("from") === "workshop" ? "/dashboard?welcome=workshop" : "/dashboard?welcome=1");
}

export async function signInWithGoogle(fd: FormData) {
  const supabase = await createClient();
  const next = safeNext(fd.get("next"));
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/login?error=google");
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}

export async function forgotPassword(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim();
  if (!z.string().email().safeParse(email).success) return { error: "Enter a valid email." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origin()}/auth/callback?next=/reset-password`,
  });
  // Same message either way, so we don't reveal which emails have accounts.
  return { ok: "If an account exists for that email, a reset link is on its way. Check your inbox and spam folder." };
}

export async function resetPassword(_: FormState, fd: FormData): Promise<FormState> {
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (password !== fd.get("confirm")) return { error: "The two passwords don't match." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "This reset link has expired. Request a new one." };
  redirect("/dashboard");
}

export async function saveOnboarding(_: FormState, fd: FormData): Promise<FormState> {
  const name = String(fd.get("full_name") ?? "").trim();
  const phone = phoneSchema.safeParse(fd.get("phone") ?? "");
  if (name.length < 2) return { error: "Enter your full name." };
  if (!phone.success) return { error: phone.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_my_profile", { p_full_name: name, p_phone: phone.data });
  if (error) return { error: "That didn't go through. Check your connection and try again." };
  redirect("/dashboard?welcome=1");
}
