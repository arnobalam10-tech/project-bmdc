const TZ = "Asia/Dhaka";

export function fmtDate(d: string | Date, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric", month: "long", year: "numeric", ...opts }).format(
    new Date(d)
  );
}

export function fmtDateTime(d: string | Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(d));
}

export function fmtTime(d: string | Date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true }).format(
    new Date(d)
  );
}

export function taka(n: number) {
  return `৳${n.toLocaleString("en-IN")}`;
}

export function hours(seconds: number) {
  const h = seconds / 3600;
  return h >= 10 ? Math.round(h).toString() : h.toFixed(1);
}

export function greeting(now = new Date()) {
  const h = Number(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "numeric", hour12: false }).format(now));
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function firstName(full?: string | null) {
  return (full ?? "").trim().split(/\s+/)[0] || "Doctor";
}

/** Has an ISO time passed (plus optional grace)? For server components. */
export function isPast(iso: string, graceMs = 0) {
  return Date.now() > new Date(iso).getTime() + graceMs;
}

/** End of a YYYY-MM-DD day in Dhaka, as ISO */
export function endOfDhakaDay(ymd: string) {
  return new Date(`${ymd}T23:59:59+06:00`).toISOString();
}
