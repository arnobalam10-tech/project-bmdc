import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { requireUser } from "@/lib/access";
import { getSettings } from "@/lib/settings";
import { numberedSchedule } from "@/lib/schedule";
import { fmtDateTime } from "@/lib/format";
import { LiveSessionCard, type LiveSession } from "@/components/app/LiveSessionCard";
import { EnrollButton } from "@/components/enroll/Enroll";
import { Card, EmptyState, PageHeader, Pill } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Classes" };

type Rec = { id: string; title: string; duration_sec: number; class_code: string | null; is_free_sample: boolean; sort: number; chapter_id: string };
type Chapter = { id: string; name: string; sort: number; subjects: { name: string; sort: number } | null };

export default async function ClassesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "next" } = await searchParams;
  const { supabase, profile, full } = await requireUser();
  const s = await getSettings();

  const tabs = (
    <div className="sticky top-14 z-20 -mx-4 mb-6 border-b border-b2-border bg-b2-black/90 px-4 backdrop-blur-md md:top-0 md:mx-0 md:px-0">
      <div className="flex gap-6">
        {[
          ["next", "Next class"],
          ["recorded", "Recorded classes"],
          ["schedule", "Schedule"],
        ].map(([key, label]) => (
          <Link
            key={key}
            href={`/classes?tab=${key}`}
            className={`-mb-px flex min-h-12 items-center border-b-2 font-medium ${
              tab === key ? "border-b2-caribbean text-b2-flash" : "border-transparent text-b2-pistachio hover:text-b2-flash"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );

  if (tab === "schedule") {
    const groups = numberedSchedule();
    return (
      <>
        <PageHeader
          title="Course schedule"
          sub="48 live online classes over 16 weeks, 3 a week on Google Meet. April 2027 batch, starting 1 December."
        />
        {tabs}
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.subject}>
              <h2 className="mb-3 flex items-baseline justify-between text-sm font-semibold uppercase tracking-[0.14em] text-b2-caribbean">
                {g.subject}
                <span className="text-xs font-medium normal-case tracking-normal text-b2-pistachio">{g.classes.length} classes</span>
              </h2>
              <ol className="divide-y divide-b2-divider overflow-hidden rounded-[20px] border border-b2-border bg-b2-dark">
                {g.classes.map((c) => (
                  <li key={c.n} className="flex min-h-14 items-center gap-4 px-5 py-3">
                    <span className="tabular grid size-10 flex-none place-items-center rounded-full bg-b2-pine text-sm font-semibold text-b2-caribbean">
                      {c.n}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block">{c.topic}</span>
                      <span className="text-xs text-b2-pistachio">Week {c.week} · Class {c.n}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </>
    );
  }

  if (tab !== "recorded") {
    const { data } = await supabase.rpc("get_live_sessions", { p_include_past: false });
    const sessions = (data ?? []) as LiveSession[];
    const [next, ...upcoming] = sessions;
    return (
      <>
        <PageHeader title="Live classes" sub="3 classes a week on Google Meet. Times are Bangladesh time." />
        {tabs}
        <div className="space-y-6">
          {next ? (
            <LiveSessionCard s={next} lockedCta={<EnrollButton s={s} email={profile.email ?? ""} />} />
          ) : (
            <EmptyState title="No class scheduled yet." sub="The next class will appear here with its Google Meet link." />
          )}
          {upcoming.length > 0 && (
            <Card>
              <p className="mb-3 font-semibold">Coming up</p>
              <ul className="divide-y divide-b2-divider">
                {upcoming.map((u) => (
                  <li key={u.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                    <span className="tabular w-full text-sm text-b2-caribbean sm:w-44">{fmtDateTime(u.starts_at)}</span>
                    <span className="flex-1">{u.title}</span>
                    {u.audience === "all" ? <Pill>Free</Pill> : u.locked ? <Lock size={16} className="text-b2-stone" /> : null}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </>
    );
  }

  const [recRes, chRes, progRes] = await Promise.all([
    supabase.from("recordings").select("id,title,duration_sec,class_code,is_free_sample,sort,chapter_id").order("sort"),
    supabase.from("chapters").select("id,name,sort,subjects(name,sort)").order("sort"),
    supabase.from("watch_progress").select("recording_id,completed,last_position"),
  ]);
  const recs = (recRes.data ?? []) as Rec[];
  const chapters = (chRes.data ?? []) as unknown as Chapter[];
  const progress = new Map((progRes.data ?? []).map((p) => [p.recording_id, p]));
  const withRecs = chapters.filter((c) => recs.some((r) => r.chapter_id === c.id));
  const bySubject = new Map<string, Chapter[]>();
  for (const c of withRecs) {
    const k = c.subjects?.name ?? "Other";
    bySubject.set(k, [...(bySubject.get(k) ?? []), c]);
  }

  return (
    <>
      <PageHeader title="Recorded classes" sub="Every class, chapter by chapter. Rewatch any time." />
      {tabs}
      {recs.length === 0 ? (
        <EmptyState title="Recordings will appear here after each class." sub={`The batch starts on 1 December. Your first class recording lands right after the first live class.`} />
      ) : (
        <div className="space-y-8">
          {[...bySubject.entries()].map(([subject, chs]) => (
            <section key={subject}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-b2-caribbean">{subject}</h2>
              <div className="space-y-3">
                {chs.map((c) => (
                  <details key={c.id} open className="group rounded-[20px] border border-b2-border bg-b2-dark">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-5 font-medium [&::-webkit-details-marker]:hidden">
                      {c.name}
                      <span className="text-sm text-b2-pistachio">{recs.filter((r) => r.chapter_id === c.id).length} classes</span>
                    </summary>
                    <ul className="divide-y divide-b2-divider border-t border-b2-divider">
                      {recs
                        .filter((r) => r.chapter_id === c.id)
                        .map((r) => {
                          const open = full || r.is_free_sample;
                          const p = progress.get(r.id);
                          return (
                            <li key={r.id}>
                              <Link
                                href={`/classes/${r.id}`}
                                className="flex min-h-16 items-center gap-4 px-5 py-3 hover:bg-white/[.03]"
                              >
                                {open ? (
                                  p?.completed ? (
                                    <CheckCircle2 className="flex-none text-b2-caribbean" size={24} />
                                  ) : (
                                    <PlayCircle className="flex-none text-b2-meadow" size={24} />
                                  )
                                ) : (
                                  <Lock className="flex-none text-b2-stone" size={22} />
                                )}
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate">{r.title}</span>
                                  <span className="text-xs text-b2-pistachio">
                                    {r.class_code ? `${r.class_code.replace("W", "Week ").replace("C", " · Class ")} · ` : ""}
                                    {r.duration_sec ? `${Math.round(r.duration_sec / 60)} min` : ""}
                                  </span>
                                </span>
                                {r.is_free_sample && !full && <Pill>Free</Pill>}
                              </Link>
                            </li>
                          );
                        })}
                    </ul>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
