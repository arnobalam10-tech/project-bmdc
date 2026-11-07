import type { Metadata } from "next";
import { requireAdmin } from "@/lib/access";
import { Alert, Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/client";
import { ConfirmButton, FlagToggle } from "@/components/admin/ConfirmButton";
import { ChapterSelect } from "@/components/admin/ChapterSelect";
import { deleteRecording, saveRecording, toggleFlag } from "../actions";

export const metadata: Metadata = { title: "Recordings" };

type R = { id: string; title: string; chapter_id: string; class_code: string | null; duration_sec: number; bunny_video_id: string | null; sort: number; is_free_sample: boolean; published: boolean };
type Ch = { id: string; name: string; sort: number; class_codes: string[]; subjects: { name: string } | null };

function RecordingForm({ r, chapters }: { r?: R; chapters: Ch[] }) {
  return (
    <form action={saveRecording} className="grid gap-3 sm:grid-cols-2">
      {r && <input type="hidden" name="id" value={r.id} />}
      <div className="sm:col-span-2">
        <label className="b2-label">Title</label>
        <input name="title" required defaultValue={r?.title} className="b2-input" placeholder="Hepatology (Part 1)" />
      </div>
      <div>
        <label className="b2-label">Chapter</label>
        <ChapterSelect chapters={chapters} defaultValue={r?.chapter_id} />
      </div>
      <div>
        <label className="b2-label">Class code (e.g. W1C1)</label>
        <input name="class_code" defaultValue={r?.class_code ?? ""} className="b2-input" placeholder="W1C1" />
      </div>
      <div>
        <label className="b2-label">Bunny Stream video ID</label>
        <input name="bunny_video_id" defaultValue={r?.bunny_video_id ?? ""} className="b2-input" placeholder="Paste after uploading to Bunny" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="b2-label">Length (min)</label>
          <input name="duration_min" type="number" min={0} defaultValue={r ? Math.round(r.duration_sec / 60) : ""} className="b2-input" />
        </div>
        <div>
          <label className="b2-label">Order</label>
          <input name="sort" type="number" defaultValue={r?.sort ?? 0} className="b2-input" />
        </div>
      </div>
      <label className="flex min-h-11 items-center gap-3">
        <input type="checkbox" name="is_free_sample" defaultChecked={r?.is_free_sample} className="size-5 accent-[#00DF81]" />
        Free sample (free accounts can watch)
      </label>
      <label className="flex min-h-11 items-center gap-3">
        <input type="checkbox" name="published" defaultChecked={r?.published ?? true} className="size-5 accent-[#00DF81]" />
        Published (visible to students)
      </label>
      <div className="sm:col-span-2">
        <SubmitButton pending="Saving">{r ? "Save changes" : "Add recording"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function RecordingsAdmin() {
  const { supabase } = await requireAdmin();
  const [{ data: recs }, { data: chs }] = await Promise.all([
    supabase.from("recordings").select("*").order("sort"),
    supabase.from("chapters").select("id,name,sort,class_codes,subjects(name)").order("sort"),
  ]);
  const rows = (recs ?? []) as R[];
  const chapters = (chs ?? []) as unknown as Ch[];
  const chName = new Map(chapters.map((c) => [c.id, `${c.subjects?.name} · ${c.name}`]));
  const bunnyReady = !!process.env.BUNNY_LIBRARY_ID;

  return (
    <div className="space-y-6">
      <PageHeader title="Recordings" sub="Chapter-wise class recordings, hosted on Bunny Stream." />
      {!bunnyReady && (
        <Alert tone="warning">
          Bunny Stream isn&apos;t connected yet. You can add recordings now. Students will see &quot;being processed&quot; until
          BUNNY_LIBRARY_ID (and BUNNY_TOKEN_AUTH_KEY) are set on Vercel and each recording has its Bunny video ID.
        </Alert>
      )}
      <Card>
        <p className="mb-4 font-semibold">Add a recording</p>
        <RecordingForm chapters={chapters} />
      </Card>
      {rows.length === 0 ? (
        <EmptyState title="No recordings yet." />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <details className="rounded-[20px] border border-b2-border bg-b2-dark">
                <summary className="flex min-h-16 cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-3 sm:px-5 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{r.title}</span>
                    <span className="block text-xs text-b2-pistachio">
                      {chName.get(r.chapter_id)} {r.class_code ? `· ${r.class_code}` : ""} {r.bunny_video_id ? "" : "· no video ID"}
                    </span>
                  </span>
                  <form action={toggleFlag}>
                    <input type="hidden" name="table" value="recordings" />
                    <input type="hidden" name="field" value="is_free_sample" />
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="value" value={String(!r.is_free_sample)} />
                    <FlagToggle on={r.is_free_sample} label="Free" />
                  </form>
                  <form action={toggleFlag}>
                    <input type="hidden" name="table" value="recordings" />
                    <input type="hidden" name="field" value="published" />
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="value" value={String(!r.published)} />
                    <FlagToggle on={r.published} label="Published" />
                  </form>
                </summary>
                <div className="space-y-4 border-t border-b2-divider p-4 sm:p-5">
                  <RecordingForm r={r} chapters={chapters} />
                  <form action={deleteRecording}>
                    <input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message={`Delete "${r.title}"? Watch progress for it is also removed.`}>Delete</ConfirmButton>
                  </form>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
