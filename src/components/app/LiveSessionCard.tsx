"use client";

import { CalendarDays, Lock, Video } from "lucide-react";
import { useNow } from "@/lib/useNow";
import { Countdown } from "@/components/ui/client";
import { btn } from "@/components/ui/Button";
import { fmtDateTime } from "@/lib/format";

export type LiveSession = {
  id: string;
  title: string;
  description: string | null;
  meet_url: string | null;
  starts_at: string;
  duration_min: number;
  audience: "all" | "paid";
  locked: boolean;
};

const OPEN_BEFORE_MS = 15 * 60 * 1000;

/** Film-spring card with countdown; the Join button unlocks 15 min before start. */
export function LiveSessionCard({ s, lockedCta }: { s: LiveSession; lockedCta?: React.ReactNode }) {
  const start = new Date(s.starts_at).getTime();
  const end = start + s.duration_min * 60_000;
  const now = useNow();
  const joinable = now !== null && now >= start - OPEN_BEFORE_MS && now <= end;
  const live = now !== null && now >= start && now <= end;

  return (
    <div className="b2-film spring rounded-[28px] p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        {live ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-b2-black/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
            <span className="live-dot" /> Live now
          </span>
        ) : (
          <span className="rounded-full bg-b2-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
            {s.audience === "all" ? "Free · open to everyone" : "Next live class"}
          </span>
        )}
      </div>
      <h3 className="mt-3 text-[22px] font-semibold leading-snug tracking-[-0.01em] sm:text-2xl">{s.title}</h3>
      {s.description && <p className="mt-1.5 text-[15px] text-b2-flash/85">{s.description}</p>}
      <p className="mt-3 flex items-center gap-2 text-[15px]">
        <CalendarDays size={18} /> {fmtDateTime(s.starts_at)} · {s.duration_min} min · Google Meet
      </p>

      {!live && (
        <div className="mt-5">
          <Countdown to={s.starts_at} size="sm" />
        </div>
      )}

      <div className="mt-6">
        {s.locked ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-b2-black/45 p-4">
            <Lock size={18} className="text-b2-pistachio" />
            <p className="flex-1 text-sm text-b2-flash/90">Live class links are for enrolled students.</p>
            {lockedCta}
          </div>
        ) : s.meet_url ? (
          joinable ? (
            <a href={s.meet_url} target="_blank" rel="noopener noreferrer" className={btn("white", "lg", "w-full sm:w-auto")}>
              <Video size={18} /> Join on Google Meet
            </a>
          ) : (
            <p className="rounded-2xl bg-b2-black/40 p-4 text-sm text-b2-flash/90">
              The <b>Join on Google Meet</b> button opens 15 minutes before the start.
            </p>
          )
        ) : (
          <p className="rounded-2xl bg-b2-black/40 p-4 text-sm text-b2-flash/90">
            The Google Meet link will appear here before the session starts.
          </p>
        )}
      </div>
    </div>
  );
}
