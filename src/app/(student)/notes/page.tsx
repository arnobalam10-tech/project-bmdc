import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Lock } from "lucide-react";
import { requireUser } from "@/lib/access";
import { EmptyState, PageHeader, Pill } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Notes" };

type Note = { id: string; title: string; page_count: number | null; is_free_sample: boolean; chapter_id: string; sort: number };
type Chapter = { id: string; name: string; sort: number; subjects: { name: string } | null };

export default async function NotesPage() {
  const { supabase, full } = await requireUser();
  const [{ data: notes }, { data: chapters }, { data: views }] = await Promise.all([
    supabase.from("notes").select("id,title,page_count,is_free_sample,chapter_id,sort").order("sort"),
    supabase.from("chapters").select("id,name,sort,subjects(name)").order("sort"),
    supabase.from("note_views").select("note_id"),
  ]);
  const list = (notes ?? []) as Note[];
  const seen = new Set((views ?? []).map((v) => v.note_id));
  const chs = ((chapters ?? []) as unknown as Chapter[]).filter((c) => list.some((n) => n.chapter_id === c.id));
  const bySubject = new Map<string, Chapter[]>();
  for (const c of chs) bySubject.set(c.subjects?.name ?? "Other", [...(bySubject.get(c.subjects?.name ?? "Other") ?? []), c]);

  return (
    <>
      <PageHeader title="Notes" sub="Chapter-wise PDF notes. Read them here on the platform." />
      {list.length === 0 ? (
        <EmptyState title="No notes yet." sub="Chapter notes are added as the course goes on." />
      ) : (
        <div className="space-y-8">
          {[...bySubject.entries()].map(([subject, cs]) => (
            <section key={subject}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-b2-caribbean">{subject}</h2>
              <div className="space-y-5">
                {cs.map((c) => (
                  <div key={c.id}>
                    <p className="mb-2 font-medium">{c.name}</p>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {list
                        .filter((n) => n.chapter_id === c.id)
                        .map((n) => {
                          const open = full || n.is_free_sample;
                          return (
                            <li key={n.id}>
                              <Link
                                href={`/notes/${n.id}`}
                                className="flex min-h-16 items-center gap-4 rounded-[20px] border border-b2-border bg-b2-dark p-4 transition-colors hover:border-b2-meadow"
                              >
                                <span className="grid size-11 flex-none place-items-center rounded-xl bg-b2-pine text-b2-meadow">
                                  {open ? <FileText size={22} /> : <Lock size={20} className="text-b2-stone" />}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-medium">{n.title}</span>
                                  <span className="text-xs text-b2-pistachio">
                                    {n.page_count ? `${n.page_count} pages` : "PDF"}
                                    {seen.has(n.id) ? " · opened" : ""}
                                  </span>
                                </span>
                                {n.is_free_sample && !full && <Pill>Free</Pill>}
                              </Link>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
