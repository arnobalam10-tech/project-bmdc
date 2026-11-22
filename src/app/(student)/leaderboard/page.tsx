import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { requireUser } from "@/lib/access";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { BackLink } from "@/components/app/BackLink";

export const metadata: Metadata = { title: "Leaderboard" };

type Row = { rank: number; user_id: string; display_name: string; best_pct: number; exams: number; is_me: boolean };

type MockRow = { rank: number; display_name: string; score: number; pct: number; is_me: boolean; total: number };

export default async function LeaderboardPage() {
  const { supabase, full } = await requireUser();
  const [{ data }, { data: mock }] = await Promise.all([
    supabase.rpc("get_leaderboard", { p_limit: 20 }),
    // the latest scheduled mock that has opened
    supabase
      .from("question_sets")
      .select("id,title,question_set_items(count)")
      .eq("hide_results", true)
      .eq("published", true)
      .lte("opens_at", new Date().toISOString())
      .order("opens_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const rows = (data ?? []) as Row[];
  const me = rows.find((r) => r.is_me);
  const mockRows = mock
    ? (((await supabase.rpc("get_set_leaderboard", { p_set_id: mock.id, p_limit: 50 })).data ?? []) as MockRow[])
    : [];
  const mockMax = mock ? ((mock.question_set_items as unknown as { count: number }[])[0]?.count ?? 0) : 0;
  const myMock = mockRows.find((r) => r.is_me);

  return (
    <>
      <BackLink href="/profile" label="Profile" />
      <PageHeader title="Leaderboard" sub="Only first names are shown." />

      {mock && (
        <section className="mb-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-lg font-semibold">
              {mock.title}{" "}
              <a href="/model-test-leaderboard" className="ml-1 text-sm font-normal text-b2-caribbean hover:underline">
                Public link ↗
              </a>
            </h2>
            {mockRows.length > 0 && (
              <span className="text-sm text-b2-pistachio">
                {mockRows[0].total} sat it{myMock ? ` · you're #${myMock.rank}` : ""}
              </span>
            )}
          </div>
          {mockRows.length === 0 ? (
            <EmptyState title="No one has submitted yet." sub="Be the first: the leaderboard fills in as people finish." />
          ) : (
            <ol className="overflow-hidden rounded-[20px] border border-b2-border bg-b2-dark">
              {mockRows.map((r) => (
                <li
                  key={`${r.rank}-${r.display_name}-${r.is_me}`}
                  className={`flex min-h-14 items-center gap-4 border-b border-b2-divider px-4 last:border-0 sm:px-6 ${r.is_me ? "bg-b2-pine" : ""}`}
                >
                  <span
                    className={`tabular grid size-9 flex-none place-items-center rounded-full text-sm font-semibold ${
                      r.rank <= 3 ? "bg-b2-caribbean text-b2-ink" : "bg-b2-black text-b2-pistachio"
                    }`}
                  >
                    {r.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {r.display_name} {r.is_me && <span className="text-sm text-b2-caribbean">(you)</span>}
                  </span>
                  <span className="text-right">
                    <span className="tabular block text-lg font-semibold">{Number(r.score).toFixed(2)}</span>
                    <span className="tabular text-xs text-b2-pistachio">
                      / {mockMax} · {r.pct}%
                    </span>
                  </span>
                  {r.rank === 1 && <Trophy size={20} className="hidden text-b2-warning sm:block" />}
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      <h2 className="mb-1 text-lg font-semibold">Enrolled students</h2>
      <p className="mb-3 text-sm text-b2-pistachio">
        Average of each enrolled student&apos;s best exam score across previous papers and model tests.
      </p>
      {!full && (
        <p className="mb-5 rounded-2xl border border-b2-border bg-b2-dark p-4 text-sm text-b2-pistachio">
          You can view the leaderboard. Join the batch to be ranked.
        </p>
      )}
      {rows.length === 0 ? (
        <EmptyState title="No ranked exams yet." sub="Sit a previous paper or model test in exam mode to appear here." />
      ) : (
        <ol className="overflow-hidden rounded-[20px] border border-b2-border bg-b2-dark">
          {rows.map((r) => (
            <li
              key={r.user_id}
              className={`flex min-h-16 items-center gap-4 border-b border-b2-divider px-4 last:border-0 sm:px-6 ${
                r.is_me ? "bg-b2-pine" : ""
              }`}
            >
              <span
                className={`tabular grid size-9 flex-none place-items-center rounded-full text-sm font-semibold ${
                  r.rank <= 3 ? "bg-b2-caribbean text-b2-ink" : "bg-b2-black text-b2-pistachio"
                }`}
              >
                {r.rank}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">
                {r.display_name} {r.is_me && <span className="text-sm text-b2-caribbean">(you)</span>}
              </span>
              <span className="text-right">
                <span className="tabular block text-lg font-semibold">{r.best_pct}%</span>
                <span className="text-xs text-b2-pistachio">
                  {r.exams} exam{r.exams === 1 ? "" : "s"}
                </span>
              </span>
              {r.rank === 1 && <Trophy size={20} className="hidden text-b2-warning sm:block" />}
            </li>
          ))}
        </ol>
      )}
      {full && !me && rows.length > 0 && (
        <p className="mt-4 text-sm text-b2-pistachio">Sit an exam to get your rank.</p>
      )}
    </>
  );
}
