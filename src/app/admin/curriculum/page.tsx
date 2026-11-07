import type { Metadata } from "next";
import { requireAdmin } from "@/lib/access";
import { Alert, PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Curriculum" };

export default async function CurriculumAdmin() {
  const { supabase } = await requireAdmin();
  const [{ data: subjects }, { data: chapters }, { data: qs }] = await Promise.all([
    supabase.from("subjects").select("id,name,sort").order("sort"),
    supabase.from("chapters").select("id,name,subject_id,class_codes,sort").order("sort"),
    supabase.from("questions").select("chapter_id"),
  ]);
  const qCount = new Map<string, number>();
  for (const q of qs ?? []) qCount.set(q.chapter_id, (qCount.get(q.chapter_id) ?? 0) + 1);

  return (
    <div className="space-y-6">
      <PageHeader title="Curriculum" sub="7 subjects · 16 weeks · 48 classes, from your timeline." />
      <Alert tone="info">
        Source: content/curriculum.json (from TIMELINE FINAL.pdf). To change chapters, ask Claude to edit it and re-import, so MCQs,
        notes and recordings stay linked.
      </Alert>
      <div className="grid gap-4 md:grid-cols-2">
        {(subjects ?? []).map((s) => (
          <div key={s.id} className="rounded-[20px] border border-b2-border bg-b2-dark p-5">
            <p className="font-semibold text-b2-caribbean">{s.name}</p>
            <ul className="mt-3 divide-y divide-b2-divider text-sm">
              {(chapters ?? [])
                .filter((c) => c.subject_id === s.id)
                .map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 py-2">
                    <span>{c.name}</span>
                    <span className="tabular flex-none text-xs text-b2-pistachio">
                      {(c.class_codes as string[]).join(", ")} · {qCount.get(c.id) ?? 0} Q
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
