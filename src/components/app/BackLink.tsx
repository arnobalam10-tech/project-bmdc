import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * In-page "← Back" link for desktop/tablet. On phones the sticky top bar already shows a
 * "‹ Back" button for the same page (see parentOf in Nav.tsx), so this hides below md to avoid two.
 */
export function BackLink({ href, label, always = false }: { href: string; label: string; always?: boolean }) {
  return (
    <Link
      href={href}
      className={`pressable mb-4 min-h-10 items-center gap-1.5 rounded-full pr-3 font-medium text-b2-meadow hover:underline ${
        always ? "inline-flex" : "hidden md:inline-flex"
      }`}
    >
      <ArrowLeft size={18} /> {label}
    </Link>
  );
}
