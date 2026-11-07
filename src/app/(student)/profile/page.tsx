import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Laptop, Trophy } from "lucide-react";
import { requireUser } from "@/lib/access";
import { fmtDate, hours } from "@/lib/format";
import { Card, EmptyState, PageHeader, Pill, StatTile } from "@/components/ui/primitives";
import { btn } from "@/components/ui/Button";
import { signOut } from "@/app/(auth)/actions";
import { ProfileForm } from "./ProfileForm";
import ScoreChartLoader from "./chart";

export const metadata: Metadata = { title: "Profile" };

type Stats = {
  streak: number;
  questions_done: number;
  options_correct: number;
  options_answered: number;
  watch_seconds: number;
  recordings_completed: number;
  notes_viewed: number;
  subjects: { subject: string; answered: number; accuracy: number }[];
  exam_history: { at: string; title: string; score: number; max: number; pct: number }[];
};

export default async function ProfilePage() {
  const { supabase, profile, status } = await requireUser();
  const [{ data: statsData }, { data: device }] = await Promise.all([
    supabase.rpc("get_my_stats"),
    supabase.from("devices").select("user_agent,bound_at").maybeSingle(),
  ]);
  const st = (statsData ?? {}) as Partial<Stats>;
  const accuracy = st.options_answered ? Math.round((100 * (st.options_correct ?? 0)) / st.options_answered) : null;
  const statusPill =
    status === "paid" ? (
      <Pill tone="caribbean">Enrolled{profile.access_expires_at ? ` · until ${fmtDate(profile.access_expires_at)}` : ""}</Pill>
    ) : status === "expired" ? (
      <Pill tone="warning">Access ended</Pill>
    ) : status === "admin" ? (
      <Pill tone="caribbean">Admin</Pill>
    ) : (
      <Pill tone="stone">Free account</Pill>
    );
  const ua = device?.user_agent ?? "";
  const deviceName = /iphone|ipad/i.test(ua) ? "iPhone / iPad" : /android/i.test(ua) ? "Android phone" : /mac/i.test(ua) ? "Mac" : /windows/i.test(ua) ? "Windows PC" : ua ? "This browser" : "—";

  return (
    <div className="space-y-6">
      <PageHeader title="Profile & progress" />

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="b2-film spring grid size-16 flex-none place-items-center rounded-full text-xl font-semibold">
            {(profile.full_name || "D").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold">Dr. {profile.full_name}</p>
            <p className="truncate text-sm text-b2-pistachio">{profile.email}</p>
          </div>
          {statusPill}
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-b2-pistachio">
          <Laptop size={16} /> Signed-in device: <span className="text-b2-flash">{deviceName}</span>
          {device?.bound_at && <span>· since {fmtDate(device.bound_at)}</span>}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="MCQs done" value={st.questions_done ?? 0} hint={accuracy !== null ? `${accuracy}% statements correct` : undefined} />
        <StatTile label="Hours watched" value={hours(st.watch_seconds ?? 0)} hint={`${st.recordings_completed ?? 0} classes completed`} />
        <StatTile
          label="Study streak"
          value={
            <span className="inline-flex items-center gap-2">
              {st.streak ?? 0} <Flame size={22} className="text-b2-warning" />
            </span>
          }
          hint="days in a row"
        />
        <StatTile label="Notes opened" value={st.notes_viewed ?? 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="font-semibold">Subject-wise accuracy</p>
          <p className="mt-1 text-sm text-b2-pistachio">Weakest first. Focus your next practice here.</p>
          {st.subjects?.length ? (
            <ul className="mt-5 space-y-4">
              {st.subjects.map((x) => (
                <li key={x.subject}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span>{x.subject}</span>
                    <span className="tabular text-b2-pistachio">
                      {x.accuracy}% · {x.answered} statements
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-b2-pine">
                    <div
                      className={`h-full rounded-full ${x.accuracy < 50 ? "bg-b2-warning" : x.accuracy < 70 ? "bg-b2-meadow" : "bg-b2-caribbean"}`}
                      style={{ width: `${x.accuracy}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-b2-pistachio">Answer a few MCQs and your subject breakdown appears here.</p>
          )}
        </Card>
        <Card>
          <p className="font-semibold">Mock score history</p>
          <p className="mt-1 text-sm text-b2-pistachio">Every exam-mode attempt, RQE marking.</p>
          <div className="mt-4">
            {st.exam_history?.length ? (
              <ScoreChartLoader data={st.exam_history.map((e) => ({ at: e.at, title: e.title, pct: Number(e.pct) }))} />
            ) : (
              <EmptyState title="No exams yet." sub="Sit your first exam to start your score history." action={<Link href="/mcq" className={btn("primary", "sm")}>Start an exam</Link>} />
            )}
          </div>
        </Card>
      </div>

      <Card className="flex flex-wrap items-center gap-4">
        <Trophy className="text-b2-caribbean" size={24} />
        <p className="flex-1">See where you stand among enrolled students on mock exams.</p>
        <Link href="/leaderboard" className={btn("secondary", "sm")}>Leaderboard</Link>
      </Card>

      <Card>
        <p className="mb-4 font-semibold">Account details</p>
        <ProfileForm name={profile.full_name} phone={profile.phone ?? ""} />
      </Card>

      <form action={signOut} className="md:hidden">
        <button className={btn("ghost", "md", "w-full")}>Log out</button>
      </form>
    </div>
  );
}
