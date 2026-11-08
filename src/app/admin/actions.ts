"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/access";
import { endOfDhakaDay } from "@/lib/format";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";
/** "2026-12-01T19:30" (Dhaka local, from datetime-local) → ISO */
const dhakaLocal = (v: string) => new Date(`${v}:00+06:00`).toISOString();

/* ───────── students ───────── */

export async function markPaid(fd: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = str(fd, "user_id");
  const amount = Number(str(fd, "amount") || 0);
  const end = str(fd, "access_end");
  await supabase.from("payments").insert({
    user_id: id,
    amount,
    trx_id: str(fd, "trx_id") || null,
    paid_on: str(fd, "paid_on") || new Date().toISOString().slice(0, 10),
    recorded_by: user.id,
  });
  await supabase
    .from("profiles")
    .update({ is_paid: true, access_expires_at: end ? endOfDhakaDay(end) : null })
    .eq("id", id);
  revalidatePath(`/admin/students/${id}`);
  revalidatePath("/admin");
}

export async function setAccessEnd(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "user_id");
  const end = str(fd, "access_end");
  await supabase.from("profiles").update({ is_paid: true, access_expires_at: end ? endOfDhakaDay(end) : null }).eq("id", id);
  revalidatePath(`/admin/students/${id}`);
}

export async function revokeAccess(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "user_id");
  await supabase.from("profiles").update({ is_paid: false }).eq("id", id);
  revalidatePath(`/admin/students/${id}`);
}

export async function resetDevice(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "user_id");
  await supabase.from("devices").delete().eq("user_id", id);
  revalidatePath(`/admin/students/${id}`);
}

export async function setMultiDevice(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "user_id");
  const on = fd.get("value") === "true";
  await supabase.from("profiles").update({ multi_device: on }).eq("id", id);
  if (on) await supabase.from("devices").delete().eq("user_id", id);
  revalidatePath(`/admin/students/${id}`);
}

export async function saveAdminNote(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "user_id");
  await supabase.from("profiles").update({ admin_note: str(fd, "admin_note") || null }).eq("id", id);
  revalidatePath(`/admin/students/${id}`);
}

export async function deletePayment(fd: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("payments").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/payments");
  const uid = str(fd, "user_id");
  if (uid) revalidatePath(`/admin/students/${uid}`);
}

/* ───────── live sessions ───────── */

export async function saveSession(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const row = {
    title: str(fd, "title"),
    description: str(fd, "description") || null,
    meet_url: str(fd, "meet_url") || null,
    starts_at: dhakaLocal(str(fd, "starts_at")),
    duration_min: Number(str(fd, "duration_min") || 90),
    audience: fd.get("audience") === "all" ? "all" : "paid",
  };
  if (id) await supabase.from("live_sessions").update(row).eq("id", id);
  else await supabase.from("live_sessions").insert(row);
  revalidatePath("/admin/live");
  redirect("/admin/live");
}

export async function deleteSession(fd: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("live_sessions").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/live");
}

/* ───────── recordings ───────── */

export async function saveRecording(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const row = {
    chapter_id: str(fd, "chapter_id"),
    title: str(fd, "title"),
    class_code: str(fd, "class_code").toUpperCase() || null,
    duration_sec: Math.round(Number(str(fd, "duration_min") || 0) * 60),
    bunny_video_id: str(fd, "bunny_video_id") || null,
    sort: Number(str(fd, "sort") || 0),
    is_free_sample: bool(fd, "is_free_sample"),
    published: bool(fd, "published"),
  };
  if (id) await supabase.from("recordings").update(row).eq("id", id);
  else await supabase.from("recordings").insert(row);
  revalidatePath("/admin/recordings");
  redirect("/admin/recordings");
}

export async function toggleFlag(fd: FormData) {
  const { supabase } = await requireAdmin();
  const table = str(fd, "table");
  const field = str(fd, "field");
  if (!["recordings", "notes", "question_sets"].includes(table) || !["is_free_sample", "published"].includes(field)) return;
  await supabase.from(table).update({ [field]: fd.get("value") === "true" }).eq("id", str(fd, "id"));
  revalidatePath(`/admin/${table === "question_sets" ? "mcq" : table}`);
}

export async function setFreeCount(fd: FormData) {
  const { supabase } = await requireAdmin();
  const n = Math.max(0, Math.min(500, Math.floor(Number(str(fd, "free_count")) || 0)));
  await supabase.from("question_sets").update({ free_count: n }).eq("id", str(fd, "id"));
  revalidatePath("/admin/mcq");
}

export async function deleteRecording(fd: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("recordings").delete().eq("id", str(fd, "id"));
  revalidatePath("/admin/recordings");
}

/* ───────── notes ───────── */

export async function createNote(input: {
  chapter_id: string;
  title: string;
  storage_path: string;
  size_bytes: number;
  page_count: number | null;
  is_free_sample: boolean;
  sort: number;
}) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("notes").insert(input);
  if (error) return { error: error.message };
  revalidatePath("/admin/notes");
  return { ok: true };
}

export async function deleteNote(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, "id");
  const { data } = await supabase.from("notes").select("storage_path").eq("id", id).single();
  if (data) await supabase.storage.from("notes").remove([data.storage_path]);
  await supabase.from("notes").delete().eq("id", id);
  revalidatePath("/admin/notes");
}

/* ───────── settings ───────── */

const SETTING_KEYS = {
  price: "number",
  offer_price: "number",
  bkash_number: "string",
  whatsapp_number: "string",
  batch_start: "string",
  workshop_at: "datetime",
  default_access_end: "string",
  facebook_url: "string",
} as const;

export async function saveSettings(fd: FormData) {
  const { supabase } = await requireAdmin();
  const rows = Object.entries(SETTING_KEYS).map(([key, type]) => {
    const raw = str(fd, key);
    const value = type === "number" ? Number(raw) : type === "datetime" ? `${raw}:00+06:00` : raw;
    return { key, value };
  });
  await supabase.from("settings").upsert(rows);
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}
