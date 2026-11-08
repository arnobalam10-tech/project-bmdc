"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Slim brand-green progress bar at the very top of the screen.
 * Starts the instant an internal link is tapped; disappears as soon as the new page is on screen.
 * No effects set state on route change: the bar is shown only while `pendingFrom` equals the
 * current location, so it vanishes automatically when the location changes.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const here = `${pathname}?${search.toString()}`;
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      setPendingFrom(`${location.pathname}?${location.search.replace(/^\?/, "")}`);
      clearTimeout(timer);
      timer = setTimeout(() => setPendingFrom(null), 15000); // safety: never stick forever
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page / hash
      start();
    };
    const onNavStart = () => start();
    document.addEventListener("click", onClick, true);
    window.addEventListener("bmdc:navstart", onNavStart);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("bmdc:navstart", onNavStart);
      clearTimeout(timer);
    };
  }, []);

  if (pendingFrom === null || pendingFrom !== here) return null;
  return (
    <div className="nav-progress" role="progressbar" aria-label="Loading page" aria-busy="true">
      <span />
    </div>
  );
}

/** Call before a programmatic router.push() so the bar shows for it too. */
export function signalNavStart() {
  window.dispatchEvent(new Event("bmdc:navstart"));
}
