import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { requireUser } from "@/lib/access";
import { getSettings } from "@/lib/settings";
import { bunnyEmbedUrl } from "@/lib/bunny";
import { VideoPlayer } from "@/components/app/VideoPlayer";
import { EnrollButton } from "@/components/enroll/Enroll";
import { B2Mark } from "@/components/brand/B2";
import { btn } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Recording" };

export default async function RecordingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile, full } = await requireUser();
  const { data: rec } = await supabase
    .from("recordings")
    .select("id,title,duration_sec,class_code,is_free_sample,bunny_video_id,chapter_id,sort,chapters(name,subjects(name))")
    .eq("id", id)
    .maybeSingle();
  if (!rec) notFound();

  const chapter = rec.chapters as unknown as { name: string; subjects: { name: string } | null } | null;
  const [{ data: siblings }, { data: prog }] = await Promise.all([
    supabase.from("recordings").select("id,title,sort").eq("chapter_id", rec.chapter_id).order("sort"),
    supabase.from("watch_progress").select("last_position").eq("recording_id", id).maybeSingle(),
  ]);
  const idx = (siblings ?? []).findIndex((r) => r.id === id);
  const prev = siblings?.[idx - 1];
  const next = siblings?.[idx + 1];
  const allowed = full || rec.is_free_sample;
  const src = allowed && rec.bunny_video_id ? bunnyEmbedUrl(rec.bunny_video_id) : null;

  return (
    <div>
      <Link href="/classes?tab=recorded" className="mb-4 inline-flex min-h-10 items-center gap-1 text-b2-meadow hover:underline">
        <ArrowLeft size={18} /> Recorded classes
      </Link>

      <div className="sticky top-14 z-20 -mx-4 bg-b2-black md:static md:mx-0">
        {!allowed ? (
          <div className="b2-film deep grid aspect-video place-items-center rounded-none p-6 text-center md:rounded-[24px]">
            <div>
              <Lock className="mx-auto text-b2-pistachio" size={32} />
              <p className="mt-3 text-lg font-medium">This recording is for enrolled students.</p>
              <div className="mt-5">
                <EnrollButton s={await getSettings()} email={profile.email ?? ""} />
              </div>
            </div>
          </div>
        ) : src ? (
          <VideoPlayer src={src} recordingId={rec.id} startAt={prog?.last_position ?? 0} />
        ) : (
          <div className="b2-film deep grid aspect-video place-items-center rounded-none p-6 text-center md:rounded-[24px]">
            <div>
              <B2Mark className="is-wave mx-auto" size={64} decorative />
              <p className="mt-3 text-lg font-medium">This recording is being processed.</p>
              <p className="mt-1 text-b2-pistachio">It will be ready to watch here soon.</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5">
        <p className="text-sm text-b2-caribbean">
          {chapter?.subjects?.name} · {chapter?.name}
          {rec.class_code ? ` · ${rec.class_code}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{rec.title}</h1>
      </div>

      <div className="mt-6 flex gap-3">
        {prev && (
          <Link href={`/classes/${prev.id}`} className={btn("secondary", "md", "flex-1 sm:flex-none")}>
            <ChevronLeft size={18} /> Previous
          </Link>
        )}
        {next && (
          <Link href={`/classes/${next.id}`} className={btn("primary", "md", "ml-auto flex-1 sm:flex-none")}>
            Next <ChevronRight size={18} />
          </Link>
        )}
      </div>
    </div>
  );
}
