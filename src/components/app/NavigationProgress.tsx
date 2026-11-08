"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * The top loading bar itself is started by the inline script in <head> (src/lib/navscript.ts),
 * so it reacts to the very first tap even before React has loaded. This component only clears it
 * once the new page is on screen (a DOM attribute, not React state).
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const here = `${pathname}?${search.toString()}`;
  useEffect(() => {
    delete document.documentElement.dataset.navloading;
  }, [here]);
  return null;
}

/** Call before a programmatic router.push() so the bar shows for it too. */
export function signalNavStart() {
  window.dispatchEvent(new Event("bmdc:navstart"));
}
