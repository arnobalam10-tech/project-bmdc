import type { createClient } from "@/lib/supabase/server";
import type { SetSummary } from "@/components/mcq/SetRow";

type Sb = Awaited<ReturnType<typeof createClient>>;

/** Sets of a kind with question counts and the student's best exam %. */
export async function loadSets(supabase: Sb, kind?: "pyq" | "model" | "topic") {
  let q = supabase
    .from("question_sets")
    .select("id,title,kind,duration_min,is_free_sample,sort,pyq_year,subject_id,chapter_id,question_set_items(count)")
    .order("sort")
    .order("title");
  if (kind) q = q.eq("kind", kind);
  const [{ data: sets }, { data: attempts }] = await Promise.all([
    q,
    supabase.from("attempts").select("set_id,score,n_questions").eq("mode", "exam").not("submitted_at", "is", null),
  ]);
  const best = new Map<string, number>();
  for (const a of attempts ?? []) {
    const pct = a.n_questions ? Math.round((1000 * Number(a.score)) / a.n_questions) / 10 : 0;
    best.set(a.set_id, Math.max(best.get(a.set_id) ?? -Infinity, pct));
  }
  return (sets ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    kind: s.kind,
    duration_min: s.duration_min,
    is_free_sample: s.is_free_sample,
    count: (s.question_set_items as unknown as { count: number }[])[0]?.count ?? 0,
    best: best.get(s.id) ?? null,
    subject_id: s.subject_id as string | null,
    chapter_id: s.chapter_id as string | null,
    sort: s.sort as number,
  })) as (SetSummary & { subject_id: string | null; chapter_id: string | null; sort: number })[];
}
