"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Bunny Stream iframe + watch-time tracking via the player.js protocol Bunny supports.
 * Every ~15 s of actual playback, record_watch() adds the seconds to the student's progress.
 */
export function VideoPlayer({ src, recordingId, startAt = 0 }: { src: string; recordingId: string; startAt?: number }) {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let lastTime = startAt;
    let pending = 0;
    let duration = 0;
    let seeked = false;

    const post = (method: string, value?: unknown) =>
      frame.current?.contentWindow?.postMessage(JSON.stringify({ context: "player.js", method, value }), "*");

    const flush = (completed = false) => {
      const secs = Math.round(pending);
      if (secs <= 0 && !completed) return;
      pending = 0;
      supabase
        .rpc("record_watch", {
          p_recording_id: recordingId,
          p_seconds: secs,
          p_position: Math.round(lastTime),
          p_completed: completed,
        })
        .then(() => {});
    };

    const onMessage = (e: MessageEvent) => {
      if (!String(e.origin).includes("mediadelivery.net")) return;
      let msg: { event?: string; value?: { seconds?: number; duration?: number } };
      try {
        msg = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (msg.event === "ready") {
        ["timeupdate", "ended", "pause"].forEach((ev) => post("addEventListener", ev));
        if (startAt > 5 && !seeked) {
          post("setCurrentTime", startAt);
          seeked = true;
        }
      }
      if (msg.event === "timeupdate" && msg.value?.seconds !== undefined) {
        const t = msg.value.seconds;
        duration = msg.value.duration ?? duration;
        const delta = t - lastTime;
        if (delta > 0 && delta < 3) pending += delta; // count real playback, not seeks
        lastTime = t;
        if (pending >= 15) flush();
      }
      if (msg.event === "pause") flush();
      if (msg.event === "ended") flush(true);
      if (duration && lastTime / duration > 0.9 && msg.event === "timeupdate" && pending === 0) {
        /* near the end: completion is recorded on "ended" */
      }
    };

    window.addEventListener("message", onMessage);
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      flush();
      window.removeEventListener("message", onMessage);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [recordingId, startAt]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[20px] bg-b2-dark md:rounded-[24px]">
      <iframe
        ref={frame}
        src={src}
        title="Class recording"
        className="absolute inset-0 size-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
