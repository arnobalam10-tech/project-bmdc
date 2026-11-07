import Link from "next/link";
import type { CSSProperties } from "react";

/** Paste ONCE in the root layout (brand kit §5a). Not display:none — that breaks gradients. */
export function B2Defs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="b2-piece-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="78" y2="38">
          <stop offset="0" stopColor="#2CC295" />
          <stop offset=".6" stopColor="#17876D" />
          <stop offset="1" stopColor="#095544" />
        </linearGradient>
        <linearGradient id="b2-core-grad" gradientUnits="userSpaceOnUse" x1="41" y1="41" x2="79" y2="79">
          <stop offset="0" stopColor="#7CF5BE" />
          <stop offset=".5" stopColor="#00DF81" />
          <stop offset="1" stopColor="#2CC295" />
        </linearGradient>
        <filter id="b2-grain" x="-35%" y="-35%" width="170%" height="170%">
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves={2} stitchTiles="stitch" result="noise">
            <animate attributeName="seed" values="1;2;3;4;5;6" dur=".6s" repeatCount="indefinite" calcMode="discrete" />
          </feTurbulence>
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 -.25"
            result="specks"
          />
          <feComposite in="specks" in2="SourceGraphic" operator="in" result="grain" />
          <feBlend in="grain" in2="SourceGraphic" mode="soft-light" />
        </filter>
        <path id="b2-b" d="M0 38.5V18Q0 0 18 0H21Q39 0 39 17Q39 0 57 0H60.5Q78.5 0 78.5 18V38.5Z" />
      </defs>
    </svg>
  );
}

const CORE =
  "M45.5 41.5H74.5Q78.5 41.5 78.5 45.5V74.5Q78.5 78.5 74.5 78.5H45.5Q41.5 78.5 41.5 74.5V45.5Q41.5 41.5 45.5 41.5ZM54.5 47H65.5V54.5H73V65.5H65.5V73H54.5V65.5H47V54.5H54.5Z";

type MarkProps = {
  className?: string;
  size?: number | string;
  grain?: boolean;
  decorative?: boolean;
  style?: CSSProperties;
};

/** The four-B's symbol (brand kit §5b/§5d). Use grain={false} below 48px. */
export function B2Mark({ className = "", size, grain, decorative = false, style }: MarkProps) {
  const useGrain = grain ?? (typeof size !== "number" || size >= 48);
  return (
    <svg
      className={`b2-mark ${className}`}
      viewBox="0 0 120 120"
      style={{ ...(size ? { width: size, height: size } : {}), ...style }}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": "Project BMDC" })}
    >
      <g filter={useGrain ? "url(#b2-grain)" : undefined}>
        {[0, 90, 180, 270].map((r, i) => (
          <g key={r} transform={`rotate(${r} 60 60)`}>
            <g className="b2-piece" style={{ "--i": i } as CSSProperties}>
              <use href="#b2-b" fill="url(#b2-piece-grad)" />
            </g>
          </g>
        ))}
        <g className="b2-core">
          <path fill="url(#b2-core-grad)" fillRule="evenodd" d={CORE} />
        </g>
      </g>
    </svg>
  );
}

/** Header lockup: mark + two-line wordmark. variant "wide" = one line (mobile), "vertical" = stacked. */
export function B2Logo({
  variant = "",
  light = true,
  className = "",
  href = "/",
  intro = false,
}: {
  variant?: "" | "wide" | "vertical";
  light?: boolean;
  className?: string;
  href?: string;
  intro?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="Project BMDC home"
      className={`b2-logo b2-hover ${variant} ${light ? "light" : ""} ${className}`}
    >
      <B2Mark decorative grain={false} className={intro ? "is-intro" : ""} />
      <span className="b2-wm">
        <span>Project</span>
        <span>BMDC</span>
      </span>
    </Link>
  );
}

/** Full-area loader: replaces every spinner (brand kit §7). */
export function B2Loader({ label = "Loading", size = 56 }: { label?: string; size?: number }) {
  return (
    <div role="status" aria-live="polite" className="grid place-items-center gap-3 py-16 text-b2-pistachio">
      <B2Mark className="is-loading" size={size} decorative />
      <span className="text-sm">{label}…</span>
    </div>
  );
}
