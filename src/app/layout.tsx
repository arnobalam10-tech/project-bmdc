import type { Metadata, Viewport } from "next";
import { Outfit, Anek_Bangla } from "next/font/google";
import { Suspense } from "react";
import { B2Defs } from "@/components/brand/B2";
import { NavigationProgress } from "@/components/app/NavigationProgress";
import { DEFAULT_THEME, themeInitScript } from "@/lib/theme";
import "./globals.css";

const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
// Bangla: Anek Bangla (Hind Siliguri, the brand-kit font, renders the ন্স conjunct in "লাইসেন্স" incorrectly)
const hind = Anek_Bangla({ variable: "--font-hind", subsets: ["bengali", "latin"], weight: ["400", "500", "600"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Project BMDC — Your gateway to BMDC licence",
    template: "%s · Project BMDC",
  },
  description:
    "A 4-month BMDC RQE prep course for doctors who completed their MBBS abroad. Taught by doctors who passed the BMDC exam in one attempt. Recorded classes, previous papers, MCQ practice and timed mock exams.",
  openGraph: {
    title: "Project BMDC — Your gateway to BMDC licence",
    description: "বিদেশে MBBS, দেশে লাইসেন্স। 4-month BMDC licensing exam course. Free workshop 20 November.",
    images: ["/brand/og.jpg"],
    type: "website",
  },
  icons: {
    icon: [
      { url: "/brand/project-bmdc-logo2-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/project-bmdc-logo2-icon-flat.svg", type: "image/svg+xml" },
    ],
    apple: "/brand/project-bmdc-logo2-favicon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${hind.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="b2-grain-page min-h-dvh antialiased">
        <B2Defs />
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
