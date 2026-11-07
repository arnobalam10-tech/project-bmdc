"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { DEFAULT_THEME, THEME_KEY, type Theme } from "@/lib/theme";

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
const getTheme = () => (document.documentElement.dataset.theme as Theme) || DEFAULT_THEME;

function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "light" ? "#ffffff" : "#021A17");
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {}
  listeners.forEach((l) => l());
}

/** Sun/moon button. Shows the theme you'd switch TO. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => DEFAULT_THEME);
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={`grid size-10 flex-none place-items-center rounded-full text-b2-meadow transition-colors hover:bg-white/5 ${className}`}
    >
      {theme === "dark" ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
    </button>
  );
}
