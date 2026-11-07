export type Theme = "dark" | "light";

/** ← Change this one line to switch the site's default theme. Visitors' own choice (toggle) still wins. */
export const DEFAULT_THEME: Theme = "light";

export const THEME_KEY = "bmdc-theme";

/** Runs in <head> before first paint so there's no flash of the wrong theme. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t="${DEFAULT_THEME}";document.documentElement.dataset.theme=t;document.querySelector('meta[name="theme-color"]')?.setAttribute("content",t==="light"?"#ffffff":"#021A17")}catch(e){document.documentElement.dataset.theme="${DEFAULT_THEME}"}})();`;
