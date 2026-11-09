import "server-only";
import { createHash } from "node:crypto";

/**
 * Meta Conversions API (server-side events).
 * Turned on by env: NEXT_PUBLIC_META_PIXEL_ID + META_CAPI_TOKEN (optional META_TEST_EVENT_CODE).
 * Browser pixel events use the same event_id, so Meta counts each event once.
 */
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TOKEN = process.env.META_CAPI_TOKEN;
const TEST = process.env.META_TEST_EVENT_CODE;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.projectbmdc.com";

export const metaEnabled = () => Boolean(PIXEL && TOKEN);

const sha = (v: string) => createHash("sha256").update(v).digest("hex");
const norm = (v?: string | null) => (v ?? "").trim().toLowerCase();

/** 01711000000 → 8801711000000 (Meta wants country code, digits only) */
function bdPhone(v?: string | null) {
  const d = (v ?? "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("880")) return d;
  return "88" + (d.startsWith("0") ? d : "0" + d);
}

export type MetaUser = {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  externalId?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  ip?: string | null;
  ua?: string | null;
};

export async function sendMetaEvent(e: {
  name: "Lead" | "Purchase" | "CompleteRegistration" | "InitiateCheckout" | "ViewContent" | "Contact";
  eventId: string;
  user: MetaUser;
  value?: number;
  path?: string;
  actionSource?: "website" | "system_generated";
  extra?: Record<string, unknown>;
}) {
  if (!metaEnabled()) return;
  const [first, ...rest] = norm(e.user.name).split(/\s+/);
  const user_data: Record<string, unknown> = {};
  if (e.user.email) user_data.em = [sha(norm(e.user.email))];
  const ph = bdPhone(e.user.phone);
  if (ph) user_data.ph = [sha(ph)];
  if (first) user_data.fn = [sha(first)];
  if (rest.length) user_data.ln = [sha(rest.join(" "))];
  if (e.user.externalId) user_data.external_id = [sha(e.user.externalId)];
  user_data.country = [sha("bd")];
  if (e.user.fbp) user_data.fbp = e.user.fbp;
  if (e.user.fbc) user_data.fbc = e.user.fbc;
  if (e.user.ip) user_data.client_ip_address = e.user.ip;
  if (e.user.ua) user_data.client_user_agent = e.user.ua;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: e.name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: e.eventId,
        action_source: e.actionSource ?? "website",
        event_source_url: `${SITE}${e.path ?? "/"}`,
        user_data,
        custom_data: {
          currency: "BDT",
          ...(e.value != null ? { value: e.value } : {}),
          content_name: "BMDC RQE 4-month course",
          content_ids: ["bmdc-course"],
          content_type: "product",
          ...e.extra,
        },
      },
    ],
  };
  if (TEST) body.test_event_code = TEST;

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${PIXEL}/events?access_token=${TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) console.error("Meta CAPI", e.name, res.status, await res.text());
  } catch (err) {
    console.error("Meta CAPI", e.name, err);
  }
}

/** IP + user agent of the current request (for better matching). */
export function requestMeta(h: Headers) {
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || null;
  return { ip, ua: h.get("user-agent") };
}
