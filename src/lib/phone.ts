/**
 * Normalise a Bangladeshi mobile number to the 11-digit local form 01XXXXXXXXX.
 * Accepts: 01673907556 · 1673907556 · +8801673907556 · 8801673907556 · 880 1673-907556 · "01673 907 556"
 */
export function normalizeBdPhone(input: string): string | null {
  let digits = String(input ?? "").replace(/\D/g, "");
  if (digits.startsWith("880")) digits = digits.slice(3);
  digits = digits.replace(/^0+/, "");
  const local = "0" + digits;
  return /^01[3-9]\d{8}$/.test(local) ? local : null;
}

export const PHONE_ERROR = "Enter a valid Bangladeshi number, e.g. 01673907556 or 1673907556.";
