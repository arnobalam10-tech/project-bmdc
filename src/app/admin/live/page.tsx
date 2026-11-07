import type { Metadata } from "next";
import { requireAdmin } from "@/lib/access";
import { fmtDateTime, isPast } from "@/lib/format";
import { Card, PageHeader, Pill } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/client";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteSession, saveSession } from "../actions";

export const metadata: Metadata = { title: "Live sessions" };

type S = { id: string; title: string; description: string | null; meet_url: string | null; starts_at: string; duration_min: number; audience: "all" | "paid" };

/** ISO → "YYYY-MM-DDTHH:mm" in Dhaka for datetime-local inputs */
function toLocal(iso: string) {
  const d = new Date(new Date(iso).getTime() + 6 * 3600_000);
  return d.toISOString().slice(0, 16);
}

function SessionForm({ s }: { s?: S }) {
  return (
    <form action={saveSession} className="grid gap-3 sm:grid-cols-2">
      {s && <input type="hidden" name="id" value={s.id} />}
      <div className="sm:col-span-2">
        <label className="b2-label">Title</label>
        <input name="title" required defaultValue={s?.title} className="b2-input" placeholder="Week 1 · Class 1 — Hepatology (Part 1)" />
      </div>
      <div className="sm:col-span-2">
        <label className="b2-label">Google Meet link</label>
        <input name="meet_url" type="url" defaultValue={s?.meet_url ?? ""} className="b2-input" placeholder="https://meet.google.com/abc-defg-hij" />
      </div>
      <div>
        <label className="b2-label">Starts (Bangladesh time)</label>
        <input name="starts_at" type="datetime-local" required defaultValue={s ? toLocal(s.starts_at) : ""} className="b2-input" />
      </div>
      <div>
        <label className="b2-label">Duration (min)</label>
        <input name="duration_min" type="number" min={15} defaultValue={s?.duration_min ?? 90} className="b2-input" />
      </div>
      <div>
        <label className="b2-label">Who can join</label>
        <select name="audience" defaultValue={s?.audience ?? "paid"} className="b2-input">
          <option value="paid">Paid students only (class)</option>
          <option value="all">Everyone signed in (free event / workshop)</option>
        </select>
      </div>
      <div>
        <label className="b2-label">Short description (optional)</label>
        <input name="description" defaultValue={s?.description ?? ""} className="b2-input" />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton pending="Saving">{s ? "Save changes" : "Add session"}</SubmitButton>
      </div>
    </form>
  );
}

export default async function LivePage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("live_sessions").select("*").order("starts_at", { ascending: false });
  const rows = (data ?? []) as S[];
  const done = (r: S) => isPast(r.starts_at, r.duration_min * 60_000);
  const upcoming = rows.filter((r) => !done(r)).reverse();
  const past = rows.filter(done);

  const Row = ({ s }: { s: S }) => (
    <details className="group rounded-[20px] border border-b2-border bg-b2-dark">
      <summary className="flex min-h-16 cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="tabular w-full text-sm text-b2-caribbean sm:w-48">{fmtDateTime(s.starts_at)}</span>
        <span className="min-w-0 flex-1 font-medium">{s.title}</span>
        {s.audience === "all" ? <Pill>Everyone</Pill> : <Pill tone="stone">Paid</Pill>}
        {!s.meet_url && <Pill tone="warning">No link yet</Pill>}
      </summary>
      <div className="space-y-4 border-t border-b2-divider p-4 sm:p-5">
        <SessionForm s={s} />
        <form action={deleteSession}>
          <input type="hidden" name="id" value={s.id} />
          <ConfirmButton message={`Delete "${s.title}"?`}>Delete session</ConfirmButton>
        </form>
      </div>
    </details>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Live sessions" sub="Classes and free events. Students see the next one on their dashboard. Tap a session to edit it." />
      <Card>
        <p className="mb-4 font-semibold">Add a session</p>
        <SessionForm />
      </Card>
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-b2-caribbean">Upcoming</h2>
        <div className="space-y-3">{upcoming.length ? upcoming.map((s) => <Row key={s.id} s={s} />) : <p className="text-b2-pistachio">Nothing scheduled.</p>}</div>
      </section>
      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-b2-pistachio">Past</h2>
          <div className="space-y-3">{past.map((s) => <Row key={s.id} s={s} />)}</div>
        </section>
      )}
    </div>
  );
}
