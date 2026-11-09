"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createNote } from "@/app/admin/actions";
import { btn } from "@/components/ui/Button";
import { B2Mark } from "@/components/brand/B2";
import { ChapterSelect } from "./ChapterSelect";
import { loadPdfjs } from "@/lib/pdfjs";

type Ch = { id: string; name: string; subjects: { name: string } | null };

/** Page count via the real PDF engine (works for compressed/object-stream PDFs); null if it can't tell. */
async function countPages(buf: ArrayBuffer): Promise<number | null> {
  try {
    const pdfjs = await loadPdfjs();
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
    const n = doc.numPages;
    return n;
  } catch {
    const m = new TextDecoder("latin1").decode(buf).match(/\/Type\s*\/Page(?!s)/g);
    return m ? m.length : null;
  }
}

/** Uploads the PDF straight to the private "notes" bucket (admin RLS), then saves the row. */
export function NoteUploader({ chapters }: { chapters: Ch[] }) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("Uploading…");
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file") as File | null;
    const chapter_id = String(fd.get("chapter_id") ?? "");
    const title = String(fd.get("title") ?? "").trim();
    if (!file || !file.size || file.type !== "application/pdf") return setMsg({ tone: "error", text: "Choose a PDF file." });
    if (file.size > 25 * 1024 * 1024) return setMsg({ tone: "error", text: "PDF must be 25 MB or smaller. Compress it first." });
    if (!chapter_id || !title) return setMsg({ tone: "error", text: "Add a title and choose a chapter." });
    if (file.size > 4 * 1024 * 1024 && !confirm(
      `This PDF is ${(file.size / 1048576).toFixed(1)} MB, so it will open slowly on phones. ` +
      `Large images are usually the cause; Claude can shrink it without visible quality loss. Upload anyway?`
    )) return;

    setBusy(true);
    setBusyLabel(`Uploading ${(file.size / 1048576).toFixed(1)} MB…`);
    setMsg(null);
    const path = `${chapter_id}/${crypto.randomUUID()}.pdf`;
    const supabase = createClient();
    const { error: upErr } = await supabase.storage.from("notes").upload(path, file, { contentType: "application/pdf" });
    if (upErr) {
      setBusy(false);
      return setMsg({ tone: "error", text: `Upload failed: ${upErr.message}` });
    }
    const res = await createNote({
      chapter_id,
      title,
      storage_path: path,
      size_bytes: file.size,
      page_count: await countPages(await file.arrayBuffer()),
      is_free_sample: fd.get("is_free_sample") === "on",
      sort: Number(fd.get("sort") || 0),
    });
    setBusy(false);
    if (res?.error) {
      await supabase.storage.from("notes").remove([path]);
      return setMsg({ tone: "error", text: res.error });
    }
    form.current?.reset();
    setMsg({ tone: "ok", text: `Uploaded “${title}”. Students can read it now in Notes.` });
    router.refresh();
  }

  return (
    <form ref={form} onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="b2-label">PDF file (max 25 MB; under 4 MB opens fastest)</label>
        <input
          name="file"
          type="file"
          accept="application/pdf"
          required
          className="b2-input file:mr-4 file:rounded-full file:border-0 file:bg-b2-pine file:px-4 file:py-2 file:text-b2-meadow"
        />
      </div>
      <div>
        <label className="b2-label">Title</label>
        <input name="title" required className="b2-input" placeholder="Hepatology — complete notes" />
      </div>
      <div>
        <label className="b2-label">Chapter</label>
        <ChapterSelect chapters={chapters} />
      </div>
      <div>
        <label className="b2-label">Order</label>
        <input name="sort" type="number" defaultValue={0} className="b2-input" />
      </div>
      <label className="flex min-h-11 items-center gap-3 self-end">
        <input type="checkbox" name="is_free_sample" className="size-5 accent-[#00DF81]" /> Free sample
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={busy} className={btn("primary", "md")}>
          {busy ? <B2Mark className="is-loading" size={20} grain={false} decorative /> : <Upload size={18} />}
          {busy ? busyLabel : "Upload note"}
        </button>
        {msg && <span className={`text-sm ${msg.tone === "ok" ? "text-b2-caribbean" : "text-b2-error"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}
