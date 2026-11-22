import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/access";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { fmtOpens } from "@/components/mcq/SetRow";

export const metadata: Metadata = { title: "Model test results" };

/** Scheduled mocks: one goes straight to its results; several get a list. */
export default async function MockIndex() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("question_sets")
    .select("id,title,opens_at,attempts(count)")
    .eq("hide_results", true)
    .order("opens_at", { ascending: false });
  const sets = (data ?? []) as { id: string; title: string; opens_at: string | null; attempts: { count: number }[] }[];
  if (sets.length === 1) redirect(`/admin/mock/${sets[0].id}`);

  return (
    <div className="space-y-6">
      <PageHeader title="Model test results" sub="Scheduled mock tests and everyone who sat them." />
      {sets.length === 0 ? (
        <EmptyState title="No scheduled mock tests yet." />
      ) : (
        <ul className="space-y-2">
          {sets.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/mock/${s.id}`}
                className="flex items-center justify-between rounded-[20px] border border-b2-border bg-b2-dark px-5 py-4 hover:border-b2-caribbean/50"
              >
                <span>
                  <span className="block font-medium">{s.title}</span>
                  <span className="text-xs text-b2-pistachio">{s.opens_at ? `Opens ${fmtOpens(s.opens_at)}` : ""}</span>
                </span>
                <span className="text-sm text-b2-pistachio">{s.attempts[0]?.count ?? 0} attempts</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
