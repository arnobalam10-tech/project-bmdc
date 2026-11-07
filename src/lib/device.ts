import "server-only";
import { cookies, headers } from "next/headers";
import type { createClient } from "@/lib/supabase/server";

export const DEVICE_COOKIE = "bmdc_did";

async function deviceId() {
  const jar = await cookies();
  let id = jar.get(DEVICE_COOKIE)?.value;
  if (!id) {
    id = crypto.randomUUID();
    jar.set(DEVICE_COOKIE, id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
    });
  }
  return id;
}

/**
 * Bind/verify this browser right after a successful sign-in.
 * Returns false (and signs out) if another device already owns the account.
 */
export async function claimThisDevice(supabase: Awaited<ReturnType<typeof createClient>>) {
  const h = await headers();
  const { data: status } = await supabase.rpc("claim_device", {
    p_device_id: await deviceId(),
    p_user_agent: h.get("user-agent") ?? "",
  });
  if (status === "blocked") {
    await supabase.auth.signOut({ scope: "local" });
    return false;
  }
  if (status === "bound") {
    // first device for this account: end any other sessions
    await supabase.auth.signOut({ scope: "others" });
  }
  return true;
}
