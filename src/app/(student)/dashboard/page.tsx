import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList, Flame, PlayCircle, Sparkles } from "lucide-react";
import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { requireUser } from "@/lib/access";
import { requestMeta, sendMetaEvent } from "@/lib/meta";
import { PixelEvent } from "@/components/app/MetaPixel";
import { getSettings } from "@/lib/settings";
import { firstName, greeting, hours } from "@/lib/format";
import { StatusBanner } from "@/components/app/StatusBanner";
import { LiveSessionCard, type LiveSession } from "@/components/app/LiveSessionCard";
import { EnrollButton } from "@/components/enroll/Enroll";
import { Alert, Card, StatTile } from "@/components/ui/primitives";
import { btn } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Dashboard" };

type Stats = {
  streak: number;
  questions_done: number;
  options_correct: number;
  options_answered: number;
  watch_seconds: number;
  exam_history: { score: number; max: number; pct: number; title: string }[];
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { supabase, user, profile, status, full } = await requireUser();
  // new account (email or Google): CompleteRegistration, sent from the browser and the server with one event id
  const regId = `reg-${user.id}`;
  if (welcome) {
    const jar = await cookies();
    const { ip, ua } = requestMeta(await headers());
    after(() =>
      sendMetaEvent({
        name: "CompleteRegistration",
        eventId: regId,
        path: "/dashboard",
        user: { email: profile.email, phone: profile.phone, name: profile.full_name, externalId: user.id, fbp: jar.get("_fbp")?.value, fbc: jar.get("_fbc")?.value, ip, ua },
        extra: { content_name: welcome === "workshop" ? "Free workshop" : "Free account", status: true },
      })
    );
  }
  const [s, sessionsRes, statsRes, lastAttemptRes, lastWatchRes, pendingRes] = await Promise.all([
    getSettings(),
    supabase.rpc("get_live_sessions", { p_include_past: false }),
    supabase.rpc("get_my_stats"),
    supabase
      .from("attempts")
      .select("id, mode, submitted_at, question_sets(title)")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("watch_progress")
      .select("recording_id, completed, recordings(title)")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    full
      ? Promise.resolve({ data: null })
      : supabase.from("orders").select("number,bkash_number").eq("status", "pending").limit(1).maybeSingle(),
  ]);
  const pendingOrder = pendingRes.data as { number: number; bkash_number: string } | null;

  const sessions = (sessionsRes.data ?? []) as LiveSession[];
  const next = sessions[0];
  const stats = (statsRes.data ?? {}) as Partial<Stats>;
  const lastExam = stats.exam_history?.at(-1);
  const accuracy =
    stats.options_answered && stats.options_answered > 0
      ? Math.round((100 * (stats.options_correct ?? 0)) / stats.options_answered)
      : null;
  const lastAttempt = lastAttemptRes.data as { id: string; mode: string; submitted_at: string | null; question_sets: { title: string } | null } | null;
  const lastWatch = lastWatchRes.data as { recording_id: string; recordings: { title: string } | null } | null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-b2-pistachio">{greeting()},</p>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] md:text-[34px]">Dr. {firstName(profile.full_name)}</h1>
      </div>

      {welcome && <PixelEvent event="CompleteRegistration" params={{ content_name: welcome === "workshop" ? "Free workshop" : "Free account", status: true }} eventId={regId} />}
      {welcome === "workshop" && (
        <Alert tone="success">
          You&apos;re registered for the free workshop. The Google Meet link appears on the card below before it starts.
        </Alert>
      )}

      <StatusBanner status={status} expires={profile.access_expires_at} s={s} email={profile.email ?? ""} pendingOrder={pendingOrder} />

      {next ? (
        <LiveSessionCard s={next} lockedCta={<EnrollButton s={s} email={profile.email ?? ""} />} />
      ) : (
        <Card>
          <p className="font-medium">No live session scheduled right now.</p>
          <p className="mt-1 text-b2-pistachio">The next class will show up here with its Google Meet link.</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="MCQs done" value={stats.questions_done ?? 0} hint={accuracy !== null ? `${accuracy}% accuracy` : "Start practising"} />
        <StatTile label="Hours watched" value={hours(stats.watch_seconds ?? 0)} />
        <StatTile
          label="Study streak"
          value={
            <span className="inline-flex items-center gap-2">
              {stats.streak ?? 0}
              <Flame size={22} className="text-b2-warning" />
            </span>
          }
          hint={(stats.streak ?? 0) === 1 ? "day" : "days in a row"}
        />
        <StatTile label="Last mock" value={lastExam ? `${lastExam.pct}%` : "—"} hint={lastExam ? lastExam.title : "No mock yet"} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-b2-pine text-b2-meadow">
              <ClipboardList size={22} />
            </span>
            <p className="font-semibold">Continue practising</p>
          </div>
          <p className="mt-3 flex-1 text-b2-pistachio">
            {lastAttempt?.question_sets
              ? `Last: ${lastAttempt.question_sets.title} (${lastAttempt.mode})`
              : "Previous BMDC papers and topic-wise True/False MCQs, with the answer and the reason."}
          </p>
          <Link
            href={lastAttempt && !lastAttempt.submitted_at ? `/mcq/attempt/${lastAttempt.id}` : "/mcq"}
            className={btn("secondary", "md", "mt-4 self-start")}
          >
            {lastAttempt && !lastAttempt.submitted_at ? "Resume" : "Open MCQ"} <ArrowRight size={16} />
          </Link>
        </Card>
        <Card className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-b2-pine text-b2-meadow">
              <PlayCircle size={22} />
            </span>
            <p className="font-semibold">Continue watching</p>
          </div>
          <p className="mt-3 flex-1 text-b2-pistachio">
            {lastWatch?.recordings ? lastWatch.recordings.title : "Every class is recorded and added here chapter by chapter."}
          </p>
          <Link
            href={lastWatch ? `/classes/${lastWatch.recording_id}` : "/classes?tab=recorded"}
            className={btn("secondary", "md", "mt-4 self-start")}
          >
            {lastWatch ? "Resume" : "Recorded classes"} <ArrowRight size={16} />
          </Link>
        </Card>
      </div>

      {!full && (
        <Card className="flex items-start gap-3">
          <Sparkles className="mt-0.5 flex-none text-b2-caribbean" size={20} />
          <p className="text-[15px] text-b2-pistachio">
            Free samples are marked <b className="text-b2-flash">Free</b> across Classes, MCQ and Notes. Try them, then join
            the batch when you&apos;re ready.
          </p>
        </Card>
      )}
    </div>
  );
}
