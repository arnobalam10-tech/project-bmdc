import "server-only";
import { createPublicClient } from "@/lib/supabase/server";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/site";

export { DEFAULT_SETTINGS, waLink, waNumber, type SiteSettings } from "@/lib/site";

export async function getSettings(): Promise<SiteSettings> {
  try {
    const { data } = await createPublicClient().from("settings").select("key,value");
    const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
    for (const row of data ?? []) merged[row.key] = row.value;
    return merged as SiteSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
