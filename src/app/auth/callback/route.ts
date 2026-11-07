import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { claimThisDevice } from "@/lib/device";

/** OAuth (Google), email-confirmation and password-reset links land here. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/dashboard";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  if (!code) return NextResponse.redirect(new URL("/login?error=link", url.origin));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=link", url.origin));

  // Password reset should work from any device; the device lock applies once they enter the platform.
  if (next !== "/reset-password") {
    const ok = await claimThisDevice(supabase);
    if (!ok) return NextResponse.redirect(new URL("/device-blocked", url.origin));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
