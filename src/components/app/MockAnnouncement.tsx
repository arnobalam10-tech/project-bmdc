"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Timer, Trophy } from "lucide-react";
import { startAttempt } from "@/app/(student)/mcq/actions";
import { SubmitButton } from "@/components/ui/client";
import { btn } from "@/components/ui/Button";

export type MockInfo = {
  id: string;
  title: string;
  opens_at: string;
  count: number;
  duration_min: number;
  published: boolean;
  attempt: { id: string; submitted: boolean } | null;
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Home banner for a scheduled mock: countdown → "start now" → "submitted" → "results are out". */
export function MockAnnouncement({ mock, serverNow }: { mock: MockInfo; serverNow: number }) {
  const opens = new Date(mock.opens_at).getTime();
  const [skew] = useState(() => serverNow - Date.now());
  const [now, setNow] = useState(serverNow);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + skew), 1000);
    return () => clearInterval(t);
  }, [skew]);

  const left = Math.max(0, opens - now);
  const open = left === 0;
  const parts = [
    ["Days", Math.floor(left / 86_400_000)],
    ["Hours", Math.floor(left / 3_600_000) % 24],
    ["Min", Math.floor(left / 60_000) % 60],
    ["Sec", Math.floor(left / 1000) % 60],
  ] as const;

  const done = mock.attempt?.submitted;
  return (
    <section className="b2-film relative overflow-hidden rounded-[28px] p-5 sm:p-7">
      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-b2-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
          <Trophy size={14} /> {open ? "Live now · free for everyone" : "Mega announcement"}
        </span>

        {done && mock.published ? (
          <>
            <h2 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[32px]">Answers are out!</h2>
            <p className="mt-1.5 text-b2-flash/85">See the answer key, explanations and your subject-wise analysis for the {mock.title}.</p>
            <Link href={`/mcq/attempt/${mock.attempt!.id}`} className={btn("primary", "lg", "mt-5 w-full sm:w-auto")}>
              See my result <ArrowRight size={18} />
            </Link>
          </>
        ) : done ? (
          <>
            <h2 className="mt-3 flex items-center gap-2 text-[24px] font-semibold leading-tight tracking-[-0.02em] sm:text-[30px]">
              <CheckCircle2 className="flex-none" /> You&apos;ve sat the free mock
            </h2>
            <p className="mt-1.5 text-b2-flash/85">See your score and where you rank. Correct answers will be revealed later.</p>
            <Link href={`/mcq/attempt/${mock.attempt!.id}`} className={btn("primary", "lg", "mt-5 w-full sm:w-auto")}>
              My score &amp; rank <ArrowRight size={18} />
            </Link>
          </>
        ) : open ? (
          <>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[36px]">
              Free model test: see where you stand
            </h2>
            <p className="mt-1.5 text-b2-flash/85">
              {mock.count} BMDC-style questions · {mock.duration_min} minutes · exact RQE marking. Free for every account.
            </p>
            <form action={startAttempt} className="mt-5">
              <input type="hidden" name="set_id" value={mock.id} />
              <SubmitButton name="mode" value="exam" size="lg" className="w-full sm:w-auto" pending="Starting">
                {mock.attempt ? "Continue" : "Start now"} <ArrowRight size={18} />
              </SubmitButton>
            </form>
          </>
        ) : (
          <>
            <h2 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[34px]">{mock.title}</h2>
            <p className="mt-1.5 text-b2-flash/85">
              {mock.count} BMDC-style questions · {mock.duration_min} minutes · free for everyone. Opens {fmt(mock.opens_at)}.
            </p>
            <div className="mt-5 grid max-w-md grid-cols-4 gap-2" aria-live="off">
              {parts.map(([label, v]) => (
                <div key={label} className="rounded-2xl bg-b2-black/35 px-2 py-3 text-center">
                  <p className="tabular text-3xl font-semibold leading-none sm:text-4xl">{String(v).padStart(2, "0")}</p>
                  <p className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-b2-flash/75">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-b2-flash/80">
              <Timer size={15} /> Come back at 7 PM. The Start button appears here.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
