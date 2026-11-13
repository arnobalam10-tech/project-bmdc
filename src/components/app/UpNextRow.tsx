"use client";

import Link from "next/link";
import { CalendarDays, Lock } from "lucide-react";
import { useNow } from "@/lib/useNow";
import { CountdownText } from "@/components/ui/client";
import { btn } from "@/components/ui/Button";
import { fmtDateTime } from "@/lib/format";
import type { LiveSession } from "./LiveSessionCard";

const OPEN_BEFORE_MS = 15 * 60 * 1000;

/** Compact "up next" row for the home page: title, time, and Join once the Meet opens. */
export function UpNextRow({ s }: { s: LiveSession }) {
  const start = new Date(s.starts_at).getTime();
  const end = start + s.duration_min * 60_000;
  const now = useNow();
  const joinable = now !== null && now >= start - OPEN_BEFORE_MS && now <= end && !!s.meet_url && !s.locked;
  const live = now !== null && now >= start && now <= end;

  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-b2-border bg-b2-dark p-3.5 sm:gap-4 sm:p-4">
      <span className="grid size-11 flex-none place-items-center rounded-2xl bg-[#00DF81]/12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/fluent/video_camera_3d.png" alt="" width={30} height={30} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-b2-caribbean">
          {live ? "Live now" : s.audience === "all" ? "Up next · free" : "Up next"}
        </p>
        <p className="truncate font-medium">{s.title}</p>
        <p className="flex items-center gap-1.5 text-[13px] text-b2-pistachio">
          <CalendarDays size={13} /> {fmtDateTime(s.starts_at)}
          {!live && (
            <span className="hidden sm:inline">
              {" "}· in <CountdownText to={s.starts_at} />
            </span>
          )}
        </p>
      </div>
      {joinable ? (
        <a href={s.meet_url!} target="_blank" rel="noopener noreferrer" className={btn("primary", "sm", "flex-none")}>
          Join
        </a>
      ) : s.locked ? (
        <Lock size={18} className="flex-none text-b2-stone" />
      ) : (
        <Link href="/classes" className={btn("secondary", "sm", "flex-none")}>
          View
        </Link>
      )}
    </div>
  );
}
