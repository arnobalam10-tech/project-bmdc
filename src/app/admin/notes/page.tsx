import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/access";
import { Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { ConfirmButton, FlagToggle } from "@/components/admin/ConfirmButton";
import { NoteUploader } from "@/components/admin/NoteUploader";
import { deleteNote, toggleFlag } from "../actions";

export const metadata: Metadata = { title: "Notes" };

type N = { id: string; title: string; chapter_id: string; page_count: number | null; size_bytes: number | null; is_free_sample: boolean; published: boolean };

export default async function NotesAdmin() {
  const { supabase } = await requireAdmin();
  const [{ data: notes }, { data: chs }] = await Promise.all([
    supabase.from("notes").select("*").order("sort"),
    supabase.from("chapters").select("id,name,sort,subjects(name)").order("sort"),
  ]);
  const rows = (notes ?? []) as N[];
  const chapters = (chs ?? []) as unknown as { id: string; name: string; subjects: { name: string } | null }[];
  const chName = new Map(chapters.map((c) => [c.id, `${c.subjects?.name} · ${c.name}`]));

  return (
    <div className="space-y-6">
      <PageHeader title="Notes" sub="Chapter-wise PDFs. Stored privately; students can only view them inside the platform." />
      <Card>
        <p className="mb-4 font-semibold">Upload a note</p>
        <NoteUploader chapters={chapters} />
      </Card>
      {rows.length === 0 ? (
        <EmptyState title="No notes uploaded yet." />
      ) : (
        <ul className="space-y-3">
          {rows.map((n) => (
            <li key={n.id} className="flex flex-wrap items-center gap-3 rounded-[20px] border border-b2-border bg-b2-dark px-4 py-3 sm:px-5">
              <span className="min-w-0 flex-1">
                <Link href={`/notes/${n.id}`} className="block font-medium hover:text-b2-caribbean">{n.title}</Link>
                <span className="block text-xs text-b2-pistachio">
                  {chName.get(n.chapter_id)} · {n.page_count ?? "?"} pages · {n.size_bytes ? `${(n.size_bytes / 1048576).toFixed(1)} MB` : ""}
                </span>
              </span>
              <form action={toggleFlag}>
                <input type="hidden" name="table" value="notes" />
                <input type="hidden" name="field" value="is_free_sample" />
                <input type="hidden" name="id" value={n.id} />
                <input type="hidden" name="value" value={String(!n.is_free_sample)} />
                <FlagToggle on={n.is_free_sample} label="Free" />
              </form>
              <form action={toggleFlag}>
                <input type="hidden" name="table" value="notes" />
                <input type="hidden" name="field" value="published" />
                <input type="hidden" name="id" value={n.id} />
                <input type="hidden" name="value" value={String(!n.published)} />
                <FlagToggle on={n.published} label="Published" />
              </form>
              <form action={deleteNote}>
                <input type="hidden" name="id" value={n.id} />
                <ConfirmButton message={`Delete "${n.title}"? The PDF is removed permanently.`} variant="ghost">
                  Delete
                </ConfirmButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
