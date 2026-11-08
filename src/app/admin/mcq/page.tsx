import type { Metadata } from "next";
import { requireAdmin } from "@/lib/access";
import { Alert, EmptyState, PageHeader } from "@/components/ui/primitives";
import { FlagToggle } from "@/components/admin/ConfirmButton";
import { setFreeCount, toggleFlag } from "../actions";
import { SubmitButton } from "@/components/ui/client";

export const metadata: Metadata = { title: "MCQ sets" };

const LABEL = { pyq: "Previous-year papers", model: "Model tests", topic: "Topic-wise (auto-built from chapter tags)" } as const;

export default async function McqAdmin() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("question_sets")
    .select("id,title,kind,duration_min,is_free_sample,free_count,published,sort,question_set_items(count)")
    .order("kind")
    .order("sort")
    .order("title");
  const sets = (data ?? []).map((s) => ({ ...s, count: (s.question_set_items as unknown as { count: number }[])[0]?.count ?? 0 }));
  const { count: qTotal } = await supabase.from("questions").select("id", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      <PageHeader title="MCQ sets" sub={`${qTotal ?? 0} questions in the bank. Choose which sets free accounts can open.`} />
      <Alert tone="info">
        Questions are added by Claude from your PDFs (content/mcq/*.json → import). Here you only control visibility:
        <b> Free Qs</b> = how many questions (from the start) free accounts can open; the rest show blurred. <b>Whole set free</b> = everything in the set is free. <b>Published</b> = visible to students.
      </Alert>
      {sets.length === 0 ? (
        <EmptyState title="No MCQ sets yet." />
      ) : (
        (["pyq", "model", "topic"] as const).map((k) => {
          const list = sets.filter((s) => s.kind === k);
          if (!list.length) return null;
          return (
            <section key={k}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-b2-caribbean">{LABEL[k]}</h2>
              <ul className="space-y-2">
                {list.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-[20px] border border-b2-border bg-b2-dark px-4 py-3 sm:px-5">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{s.title}</span>
                      <span className="block text-xs text-b2-pistachio">
                        {s.count} questions · {s.duration_min} min exam
                      </span>
                    </span>
                    <form action={setFreeCount} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={s.id} />
                      <label className="text-xs text-b2-pistachio" htmlFor={`fc-${s.id}`}>
                        Free Qs
                      </label>
                      <input
                        id={`fc-${s.id}`}
                        name="free_count"
                        type="number"
                        min={0}
                        max={s.count}
                        defaultValue={s.free_count}
                        className="b2-input !min-h-9 !w-16 !px-2 !py-1 text-center text-sm"
                      />
                      <SubmitButton variant="secondary" size="sm" className="!min-h-9 !px-3" pending="Saving">
                        Save
                      </SubmitButton>
                    </form>
                    {(["is_free_sample", "published"] as const).map((field) => (
                      <form key={field} action={toggleFlag}>
                        <input type="hidden" name="table" value="question_sets" />
                        <input type="hidden" name="field" value={field} />
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="value" value={String(!s[field])} />
                        <FlagToggle on={s[field]} label={field === "published" ? "Published" : "Whole set free"} />
                      </form>
                    ))}
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
