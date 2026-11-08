import type { Metadata } from "next";
import { BackLink } from "@/components/app/BackLink";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { requireUser } from "@/lib/access";
import { getSettings } from "@/lib/settings";
import { EnrollButton } from "@/components/enroll/Enroll";
import PdfViewerLoader from "./viewer";

export const metadata: Metadata = { title: "Notes" };

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile, full } = await requireUser();
  const { data: note } = await supabase
    .from("notes")
    .select("id,title,storage_path,is_free_sample")
    .eq("id", id)
    .maybeSingle();
  if (!note) notFound();

  if (!full && !note.is_free_sample) {
    return (
      <div>
        <BackLink href="/notes" label="Notes" />
        <div className="b2-film deep rounded-[28px] p-8 text-center">
          <Lock className="mx-auto text-b2-pistachio" size={32} />
          <h1 className="mt-3 text-xl font-semibold">{note.title}</h1>
          <p className="mt-2 text-b2-pistachio">These notes are for enrolled students.</p>
          <div className="mt-6">
            <EnrollButton s={await getSettings()} email={profile.email ?? ""} />
          </div>
        </div>
      </div>
    );
  }

  // Storage RLS re-checks entitlement; the URL expires in 2 minutes.
  const { data: signed } = await supabase.storage.from("notes").createSignedUrl(note.storage_path, 120);
  await supabase.from("note_views").upsert({ user_id: user.id, note_id: note.id, last_viewed_at: new Date().toISOString() });
  if (!signed?.signedUrl) notFound();

  return <PdfViewerLoader url={signed.signedUrl} title={note.title} />;
}
