/** Client-safe settings types + helpers (no server imports). */
export type SiteSettings = {
  price: number;
  offer_price: number;
  bkash_number: string;
  whatsapp_number: string;
  batch_start: string; // YYYY-MM-DD
  workshop_at: string; // ISO with +06:00
  default_access_end: string; // YYYY-MM-DD
  facebook_url: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  price: 10000,
  offer_price: 7999,
  bkash_number: "01322654646",
  whatsapp_number: "01886688253",
  batch_start: "2026-12-01",
  workshop_at: "2026-11-20T20:00:00+06:00",
  default_access_end: "2027-05-01",
  facebook_url: "https://www.facebook.com/profile.php?id=61596008175287",
};

/** 01886688253 → 8801886688253 for wa.me links */
export function waNumber(local: string) {
  const digits = local.replace(/\D/g, "");
  return digits.startsWith("880") ? digits : `88${digits}`;
}

export function waLink(local: string, text?: string) {
  return `https://wa.me/${waNumber(local)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
