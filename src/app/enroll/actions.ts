"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { normalizeBdPhone, PHONE_ERROR } from "@/lib/phone";
import { requestMeta, sendMetaEvent } from "@/lib/meta";
import { getSettings } from "@/lib/settings";

export type OrderState = { error?: string; field?: string; values?: Record<string, string>; n?: number } | undefined;

const bd = (msg: string) =>
  z
    .string()
    .transform((v) => normalizeBdPhone(v) ?? "")
    .refine((v) => v !== "", msg);

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name."),
  phone: bd(PHONE_ERROR),
  email: z.string().trim().email("Enter a valid email."),
  bkash_number: bd("Enter the bKash number you sent the money from, e.g. 01673907556."),
});

/** Place an order. No account needed: name, phone, email and the bKash number the money came from. */
export async function placeOrder(_: OrderState, fd: FormData): Promise<OrderState> {
  const raw = Object.fromEntries(fd) as Record<string, string>;
  if (raw.same_as_phone === "on") raw.bkash_number = raw.phone;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue.message, field: String(issue.path[0] ?? ""), values: raw, n: Date.now() };
  }
  const { full_name, phone, email, bkash_number } = parsed.data;

  const jar = await cookies();
  const h = await headers();
  const { ip, ua } = requestMeta(h);
  let utm: Record<string, string> | null = null;
  try {
    const v = jar.get("bmdc_utm")?.value;
    utm = v ? JSON.parse(v) : null;
  } catch {}
  const fbp = jar.get("_fbp")?.value ?? null;
  const fbc = jar.get("_fbc")?.value ?? (utm?.fbclid ? `fb.1.${Date.now()}.${utm.fbclid}` : null);

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("create_order", {
      p_full_name: full_name,
      p_email: email,
      p_phone: phone,
      p_bkash_number: bkash_number,
      p_fbp: fbp,
      p_fbc: fbc,
      p_utm: utm,
      p_client_ip: ip,
      p_user_agent: ua,
    })
    .single<{ id: string; number: number; event_id: string }>();
  if (error || !data) return { error: "We couldn't place your order. Try again, or message us on WhatsApp.", values: raw, n: Date.now() };

  const value = (await getSettings()).offer_price;
  after(() =>
    sendMetaEvent({
      name: "Lead",
      eventId: `lead-${data.event_id}`,
      value,
      path: "/enroll",
      user: { email, phone, name: full_name, fbp, fbc, ip, ua },
      extra: { order_number: data.number },
    })
  );
  redirect(`/enroll/done?o=${data.id}`);
}
