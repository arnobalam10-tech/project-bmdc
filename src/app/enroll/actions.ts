"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { claimThisDevice } from "@/lib/device";
import { normalizeBdPhone, PHONE_ERROR } from "@/lib/phone";

export type OrderState = { error?: string; needsLogin?: boolean } | undefined;

const bd = (msg: string) =>
  z
    .string()
    .transform((v) => normalizeBdPhone(v) ?? "")
    .refine((v) => v !== "", msg);

const guestSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email."),
  phone: bd(PHONE_ERROR),
  password: z.string().min(8, "Use at least 8 characters for your password."),
});

const BKASH_ERROR = "Enter the bKash number you sent the money from, e.g. 01673907556.";

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Place an order. Signed-in students only send the bKash number; visitors also create their account here,
 * so the whole purchase happens on one page.
 */
export async function placeOrder(_: OrderState, fd: FormData): Promise<OrderState> {
  const bkash = bd(BKASH_ERROR).safeParse(String(fd.get("bkash_number") ?? ""));
  if (!bkash.success) return { error: BKASH_ERROR };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const parsed = guestSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { full_name, email, phone, password } = parsed.data;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, phone }, emailRedirectTo: `${await origin()}/auth/callback?next=/enroll` },
    });
    if (error) {
      if (/registered|exists/i.test(error.message))
        return { error: "You already have an account with this email. Log in, then place your order.", needsLogin: true };
      return { error: "That didn't go through. Check your connection and try again." };
    }
    if (!data.session) return { error: "Account created. Confirm your email, then log in to place your order.", needsLogin: true };
    if (!(await claimThisDevice(supabase))) redirect("/device-blocked");
  }

  const jar = await cookies();
  const utmRaw = jar.get("bmdc_utm")?.value;
  let utm: Record<string, string> | null = null;
  try {
    utm = utmRaw ? JSON.parse(utmRaw) : null;
  } catch {}

  const { error } = await supabase.rpc("place_order", {
    p_bkash_number: bkash.data,
    p_fbp: jar.get("_fbp")?.value ?? null,
    p_fbc: jar.get("_fbc")?.value ?? null,
    p_utm: utm,
  });
  if (error) return { error: "We couldn't place your order. Try again, or message us on WhatsApp." };
  redirect("/enroll?placed=1");
}
