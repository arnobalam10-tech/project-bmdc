import "server-only";
import { createHash } from "node:crypto";

/**
 * Bunny Stream secure embed (Phase 8 — activates once these env vars are set on Vercel):
 *   BUNNY_LIBRARY_ID       Stream library id
 *   BUNNY_TOKEN_AUTH_KEY   Library → Security → "Embed view token authentication" key
 * Token = SHA256_HEX(token_key + video_id + expires)
 */
export function bunnyEmbedUrl(videoId: string, ttlSeconds = 4 * 3600) {
  const lib = process.env.BUNNY_LIBRARY_ID;
  if (!lib) return null;
  const params = new URLSearchParams({ autoplay: "false", preload: "true", responsive: "true" });
  const key = process.env.BUNNY_TOKEN_AUTH_KEY;
  if (key) {
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    params.set("token", createHash("sha256").update(key + videoId + expires).digest("hex"));
    params.set("expires", String(expires));
  }
  return `https://iframe.mediadelivery.net/embed/${lib}/${videoId}?${params}`;
}
