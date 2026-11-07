import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    rules: { userAgent: "*", allow: ["/", "/signup", "/login", "/terms", "/privacy"], disallow: ["/admin", "/dashboard", "/classes", "/mcq", "/notes", "/profile", "/leaderboard"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
