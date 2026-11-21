import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/access";
import { BackLink } from "@/components/app/BackLink";
import { Alert, EmptyState, PageHeader } from "@/components/ui/primitives";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { fmtOpens } from "@/components/mcq/SetRow";
import { publishMockResults } from "../../actions";

export const metadata: Metadata = { title: "Mock results" };

type Row = {
  user_id: string;
  attempt_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  paid: boolean;
  started_at: string;
  submitted_at: string | null;
  minutes: number | null;
  n_correct: number;
  n_wrong: number;
  n_blank: number;
  score: number;
  pct: number;
  rank: number | null;
};

export default async function MockResults({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: set } = await supabase
    .from("question_sets")
    .select("id,title,opens_at,duration_min,hide_results,results_published_at,question_set_items(count)")
    .eq("id", id)
    .maybeSingle();
  if (!set) notFound();
  const { data, error } = await supabase.rpc("admin_mock_results", { p_set_id: id });
  const rows = (data ?? []) as Row[];
  const done = rows.filter((r) => r.submitted_at);
  const avg = done.length ? done.reduce((n, r) => n + Number(r.pct), 0) / done.length : 0;
  const top = done[0];
  const nQ = (set.question_set_items as unknown as { count: number }[])[0]?.count ?? 0;

  return (
    <div className="space-y-6">
      <BackLink href="/admin/mcq" label="MCQ sets" />
      <PageHeader
        title={`Results · ${set.title}`}
        sub={`${nQ} questions · ${set.duration_min} min${set.opens_at ? ` · opens ${fmtOpens(set.opens_at)}` : ""}`}
      />

      {set.results_published_at ? (
        <Alert tone="success">
          Published {fmtOpens(set.results_published_at)}. Students see their score, rank, analysis and this test&apos;s leaderboard.
          Publishing again re-scores everyone (use it after fixing the answer key).
        </Alert>
      ) : (
        <Alert tone="info">
          Results are hidden from students. Scores below are worked out live from their answers. When you&apos;re ready, publish to
          show everyone their score, rank, analysis and the leaderboard.
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Started", rows.length],
          ["Submitted", done.length],
          ["Average", done.length ? `${avg.toFixed(1)}%` : "—"],
          ["Top score", top ? `${Number(top.score).toFixed(2)} / ${nQ}` : "—"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-b2-border bg-b2-dark px-4 py-3">
            <p className="tabular text-2xl font-semibold">{v}</p>
            <p className="text-xs text-b2-pistachio">{k}</p>
          </div>
        ))}
      </div>

      <form action={publishMockResults}>
        <input type="hidden" name="set_id" value={set.id} />
        <ConfirmButton
          variant="primary"
          size="md"
          message={
            set.results_published_at
              ? "Re-score every attempt with the current answer key?"
              : `Publish results to all ${done.length} students who submitted? They will see their score, rank, analysis and the leaderboard.`
          }
        >
          {set.results_published_at ? "Re-score everyone" : "Publish results"}
        </ConfirmButton>
      </form>

      {error && <Alert tone="error">{error.message}</Alert>}
      {rows.length === 0 ? (
        <EmptyState title="Nobody has started this test yet." />
      ) : (
        <div className="overflow-x-auto rounded-[20px] border border-b2-border bg-b2-dark">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="text-left text-xs uppercase tracking-[0.1em] text-b2-pistachio">
              <tr className="border-b border-b2-border">
                {["#", "Student", "Phone", "Score", "%", "✓ / ✗ / ○", "Time", "Status"].map((h) => (
                  <th key={h} className="px-3 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-b2-border">
              {rows.map((r) => (
                <tr key={r.attempt_id}>
                  <td className="tabular px-3 py-2.5 text-b2-pistachio">{r.rank ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <a href={`/admin/students/${r.user_id}`} className="font-medium hover:text-b2-caribbean">
                      {r.full_name || "—"}
                    </a>
                    <span className="block text-xs text-b2-pistachio">
                      {r.email} {r.paid ? "· paid" : "· free"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">{r.phone ?? "—"}</td>
                  <td className="tabular px-3 py-2.5 font-semibold">{Number(r.score).toFixed(2)}</td>
                  <td className="tabular px-3 py-2.5">{r.pct}%</td>
                  <td className="tabular px-3 py-2.5 text-b2-pistachio">
                    {r.n_correct} / {r.n_wrong} / {r.n_blank}
                  </td>
                  <td className="tabular px-3 py-2.5">{r.minutes !== null ? `${r.minutes} min` : "—"}</td>
                  <td className="px-3 py-2.5">
                    {r.submitted_at && !set.results_published_at ? (
                      <span className="text-b2-caribbean">Submitted</span>
                    ) : r.submitted_at ? (
                      <a href={`/mcq/attempt/${r.attempt_id}/review`} className="text-b2-caribbean hover:underline">
                        Submitted
                      </a>
                    ) : (
                      <span className="text-b2-warning">In progress</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
