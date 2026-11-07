"use client";

import { useSyncExternalStore } from "react";

/** One shared 1-second clock for all countdowns. Returns null during SSR/hydration. */
function subscribe(cb: () => void) {
  const t = setInterval(cb, 1000);
  return () => clearInterval(t);
}
const snapshot = () => Math.floor(Date.now() / 1000) * 1000;
const serverSnapshot = () => null;

export function useNow(): number | null {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
