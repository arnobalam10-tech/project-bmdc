import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const DEVICE_COOKIE = "bmdc_did";
const STUDENT = /^\/(dashboard|classes|mcq|notes|profile|leaderboard|onboarding)(\/|$)/;
const ADMIN = /^\/admin(\/|$)/;
const AUTH_PAGES = /^\/(login|signup)(\/|$)/;

/**
 * Runs before every page:
 *  1. refreshes the Supabase session cookie
 *  2. gives every browser a long-lived device id
 *  3. guards /dashboard… and /admin… (must be signed in)
 *  4. enforces the one-device lock via the claim_device() database function
 *  5. sends signed-in visitors from / (and /login, /signup) to /dashboard
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  let deviceId = request.cookies.get(DEVICE_COOKIE)?.value;
  const isNewDevice = !deviceId || !/^[0-9a-f-]{36}$/i.test(deviceId);
  if (isNewDevice) {
    deviceId = crypto.randomUUID();
    request.cookies.set(DEVICE_COOKIE, deviceId);
  }

  const path = request.nextUrl.pathname;
  const protectedRoute = STUDENT.test(path) || ADMIN.test(path);

  // IMPORTANT: getUser() validates the JWT with Supabase and refreshes it if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const finish = (res: NextResponse) => {
    // carry refreshed auth cookies + device id onto whatever response we return
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    // remember which ad/campaign brought this visitor (saved on their order)
    const sp = request.nextUrl.searchParams;
    const utm: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"]) {
      const v = sp.get(k);
      if (v) utm[k] = v.slice(0, 200);
    }
    if (Object.keys(utm).length) {
      res.cookies.set("bmdc_utm", JSON.stringify({ ...utm, landing: path, at: new Date().toISOString() }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    if (isNewDevice) {
      res.cookies.set(DEVICE_COOKIE, deviceId!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 400,
      });
    }
    return res;
  };

  if (protectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(path)}`;
    return finish(NextResponse.redirect(url));
  }

  if (user && protectedRoute) {
    const { data: status } = await supabase.rpc("claim_device", {
      p_device_id: deviceId,
      p_user_agent: request.headers.get("user-agent") ?? "",
    });
    if (status === "blocked") {
      await supabase.auth.signOut({ scope: "local" });
      const url = request.nextUrl.clone();
      url.pathname = "/device-blocked";
      url.search = "";
      return finish(NextResponse.redirect(url));
    }
  }

  // signed-in visitors skip the landing page and go straight to their portal
  if (user && (path === "/" || AUTH_PAGES.test(path))) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return finish(NextResponse.redirect(url));
  }

  return finish(response);
}

export const config = {
  matcher: [
    // everything except static files, images and the favicon
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf|txt|xml)$).*)",
  ],
};
