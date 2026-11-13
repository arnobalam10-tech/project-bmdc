import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { requireUser } from "@/lib/access";
import { requestMeta, sendMetaEvent } from "@/lib/meta";
import { PixelEvent } from "@/components/app/MetaPixel";
import { getSettings } from "@/lib/settings";
import { firstName, greeting, taka, fmtDate } from "@/lib/format";
import { StatusBanner } from "@/components/app/StatusBanner";
import { UpNextRow } from "@/components/app/UpNextRow";
import type { LiveSession } from "@/components/app/LiveSessionCard";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { EnrollButton } from "@/components/enroll/Enroll";
import { Alert } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Home" };

type Tile = { href: string; title: string; sub: string; icon: string; tone: string };

/** Microsoft Fluent Emoji 3D (MIT, github.com/microsoft/fluentui-emoji), one soft tint per tile. */
const TILES: Tile[] = [
  { href: "/mcq/pyq", title: "Past papers", sub: "BMDC questions 2017–2025", icon: "clipboard", tone: "bg-[#2CC295]/12" },
  { href: "/mcq/topic", title: "Topic-wise MCQs", sub: "Practise chapter by chapter", icon: "open_book", tone: "bg-[#5B9BFF]/12" },
  { href: "/mcq/model", title: "Mock exams", sub: "100 questions · 100 minutes", icon: "stopwatch", tone: "bg-[#F5B13D]/14" },
  { href: "/classes?tab=recorded", title: "Recorded classes", sub: "Rewatch any class", icon: "clapper_board", tone: "bg-[#FF7A90]/12" },
  { href: "/notes", title: "Notes", sub: "Chapter-wise PDF notes", icon: "memo", tone: "bg-[#A98BFF]/12" },
  { href: "/classes", title: "Live classes", sub: "Google Meet links", icon: "video_camera", tone: "bg-[#00DF81]/12" },
  { href: "/classes?tab=schedule", title: "Course schedule", sub: "48 classes, week by week", icon: "spiral_calendar", tone: "bg-[#4FD1C5]/12" },
  { href: "/leaderboard", title: "Leaderboard", sub: "See where you stand", icon: "trophy", tone: "bg-[#FFB86B]/14" },
];

function Icon3D({ name, size = 40 }: { name: string; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/icons/fluent/${name}_3d.png`} alt="" width={size} height={size} style={{ width: size, height: size }} />;
}

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
  const [s, sessionsRes, lastAttemptRes, lastWatchRes, pendingRes] = await Promise.all([
    getSettings(),
    supabase.rpc("get_live_sessions", { p_include_past: false }),
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
  const next = ((sessionsRes.data ?? []) as LiveSession[])[0];
  const lastAttempt = lastAttemptRes.data as { id: string; mode: string; submitted_at: string | null; question_sets: { title: string } | null } | null;
  const lastWatch = lastWatchRes.data as { recording_id: string; recordings: { title: string } | null } | null;
  const resumeMcq = lastAttempt && !lastAttempt.submitted_at && lastAttempt.question_sets;
  const resumeVideo = lastWatch?.recordings;

  return (
    <div className="space-y-7">
      {welcome && <PixelEvent event="CompleteRegistration" params={{ content_name: welcome === "workshop" ? "Free workshop" : "Free account", status: true }} eventId={regId} />}

      {/* Welcome */}
      <div>
        <p className="text-b2-pistachio">{greeting()},</p>
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] md:text-[34px]">Dr. {firstName(profile.full_name)} 👋</h1>
        <p className="mt-1 text-[15px] text-b2-pistachio">What would you like to study today?</p>
      </div>

      {welcome === "workshop" && (
        <Alert tone="success">You&apos;re registered for the free workshop. The Google Meet link is under &ldquo;Up next&rdquo; below.</Alert>
      )}

      {/* Only shown when something needs attention: a pending order or ended access */}
      {(pendingOrder || status === "expired") && (
        <StatusBanner status={status} expires={profile.access_expires_at} s={s} email={profile.email ?? ""} pendingOrder={pendingOrder} />
      )}

      {/* Quick links */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Start studying</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TILES.map(({ href, title, sub, icon, tone }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col gap-3 rounded-[20px] border border-b2-border bg-b2-dark p-4 transition-colors hover:border-b2-caribbean/50 active:scale-[0.99] sm:p-5"
            >
              <span className={`grid size-14 place-items-center rounded-2xl ${tone}`}>
                <Icon3D name={icon} />
              </span>
              <span>
                <span className="block text-[15px] font-semibold leading-tight sm:text-base">{title}</span>
                <span className="mt-1 block text-[12.5px] leading-snug text-b2-pistachio sm:text-[13px]">{sub}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Pick up where you left off */}
      {(resumeMcq || resumeVideo) && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Continue where you left off</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {resumeMcq && (
              <Link href={`/mcq/attempt/${lastAttempt!.id}`} className="flex items-center gap-3 rounded-[20px] border border-b2-border bg-b2-dark p-3.5 hover:border-b2-caribbean/50 sm:p-4">
                <span className="grid size-11 flex-none place-items-center rounded-2xl bg-[#5B9BFF]/12">
                  <Icon3D name="open_book" size={30} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-b2-pistachio">Unfinished MCQ set</span>
                  <span className="block truncate font-medium">{lastAttempt!.question_sets!.title}</span>
                </span>
                <ArrowRight size={18} className="flex-none text-b2-caribbean" />
              </Link>
            )}
            {resumeVideo && (
              <Link href={`/classes/${lastWatch!.recording_id}`} className="flex items-center gap-3 rounded-[20px] border border-b2-border bg-b2-dark p-3.5 hover:border-b2-caribbean/50 sm:p-4">
                <span className="grid size-11 flex-none place-items-center rounded-2xl bg-[#FF7A90]/12">
                  <Icon3D name="clapper_board" size={30} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-b2-pistachio">Last watched</span>
                  <span className="block truncate font-medium">{lastWatch!.recordings!.title}</span>
                </span>
                <ArrowRight size={18} className="flex-none text-b2-caribbean" />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Next live class / workshop: a compact row, not a hero */}
      {next && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Up next</h2>
          <UpNextRow s={next} />
        </section>
      )}

      {/* Community */}
      <a
        href="/group"
        className="flex items-center gap-3 rounded-[20px] border border-[#25D366]/40 bg-[#25D366]/10 p-4 hover:bg-[#25D366]/15"
      >
        <span className="grid size-11 flex-none place-items-center rounded-2xl bg-[#25D366] text-white">
          <WhatsAppIcon size={24} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">Join our WhatsApp group</span>
          <span className="block text-[13px] text-b2-pistachio">Class updates, Meet links and tips from your mentors</span>
        </span>
        <ArrowRight size={18} className="flex-none text-[#25D366]" />
      </a>

      {/* Free users: one gentle nudge at the bottom, no badge */}
      {!full && !pendingOrder && status !== "expired" && status !== "admin" && (
        <div className="flex flex-col gap-3 rounded-[20px] border border-b2-border bg-b2-dark p-4 sm:flex-row sm:items-center sm:p-5">
          <p className="flex-1 text-[15px] text-b2-pistachio">
            Unlock every class, MCQ and note with the April 2027 batch · {taka(s.offer_price)} · starts{" "}
            {fmtDate(s.batch_start, { year: undefined })}.
          </p>
          <EnrollButton s={s} email={profile.email ?? ""} />
        </div>
      )}
    </div>
  );
}
