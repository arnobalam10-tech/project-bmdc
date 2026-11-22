import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { B2Logo } from "@/components/brand/B2";
import { btn } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Model test leaderboard",
  description: "Live leaderboard of the Project BMDC free model test. Sit it free and see where you stand.",
};

type Data = {
  set: { title: string; questions: number } | null;
  total: number;
  rows: { rank: number; name: string; score: number; pct: number; dummy?: boolean }[];
};

/** Public: anyone with the link can see the latest free model test's leaderboard (first name + initial only). */
export default async function PublicMockLeaderboard() {
  await connection(); // always live
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_mock_leaderboard", { p_limit: 100 });
  const d = (data ?? { set: null, total: 0, rows: [] }) as Data;

  return (
    <main className="mx-auto min-h-dvh max-w-[720px] px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" aria-label="Project BMDC home">
        <B2Logo />
      </Link>

      <div className="b2-film mt-8 rounded-[28px] p-6 text-center sm:p-8">
        <Trophy className="mx-auto" size={36} />
        <h1 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[36px]">Model test leaderboard</h1>
        <p className="mt-1.5 text-b2-flash/85">
          {d.set ? `${d.set.title} · ${d.set.questions} questions · ${d.total} doctors so far` : "The next model test opens soon."}
        </p>
        <Link href="/dashboard" className={btn("primary", "lg", "mt-5 w-full sm:w-auto")}>
          Sit it free and see where you stand
        </Link>
      </div>

      {d.rows.length === 0 ? (
        <p className="mt-8 rounded-[20px] border border-b2-border bg-b2-dark p-6 text-center text-b2-pistachio">
          No one has submitted yet. Be the first on the board.
        </p>
      ) : (
        <ol className="mt-8 overflow-hidden rounded-[20px] border border-b2-border bg-b2-dark">
          {d.rows.map((r, k) => (
            <li key={k} className="flex min-h-14 items-center gap-4 border-b border-b2-divider px-4 last:border-0 sm:px-6">
              <span
                className={`tabular grid size-9 flex-none place-items-center rounded-full text-sm font-semibold ${
                  r.rank <= 3 ? "bg-b2-caribbean text-b2-ink" : "bg-b2-black text-b2-pistachio"
                }`}
              >
                {r.rank}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">
                {r.name}
                {r.dummy && <span className="ml-2 rounded-full border border-b2-warning/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-b2-warning">Dummy</span>}
              </span>
              <span className="text-right">
                <span className="tabular block text-lg font-semibold">{Number(r.score).toFixed(2)}</span>
                <span className="tabular text-xs text-b2-pistachio">
                  / {d.set?.questions} · {r.pct}%
                </span>
              </span>
              {r.rank === 1 && <Trophy size={20} className="hidden text-b2-warning sm:block" />}
            </li>
          ))}
        </ol>
      )}

      <p className="mt-6 text-center text-xs text-b2-stone">
        Exact RQE marking: +0.25 per correct statement, −0.06 per wrong one. Ties go to the faster finisher. Only first names are shown.
      </p>
    </main>
  );
}
