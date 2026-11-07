import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { accessStatus, requireAdmin, type Profile } from "@/lib/access";
import { getSettings, waLink } from "@/lib/settings";
import { fmtDate, fmtDateTime, hours, taka } from "@/lib/format";
import { Card, Pill, StatTile } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/client";
import { ConfirmButton, FlagToggle } from "@/components/admin/ConfirmButton";
import { btn } from "@/components/ui/Button";
import { markPaid, resetDevice, revokeAccess, saveAdminNote, setAccessEnd, setMultiDevice } from "../../actions";

export const metadata: Metadata = { title: "Student" };

export default async function StudentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: p }, s, { data: device }, { data: payments }, { data: attempts }, { data: watch }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle<Profile>(),
    getSettings(),
    supabase.from("devices").select("*").eq("user_id", id).maybeSingle(),
    supabase.from("payments").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("attempts").select("id,mode,score,n_questions,submitted_at,question_sets(title)").eq("user_id", id).order("started_at", { ascending: false }).limit(10),
    supabase.from("watch_progress").select("seconds_watched").eq("user_id", id),
  ]);
  if (!p) notFound();
  const status = accessStatus(p);
  const watched = (watch ?? []).reduce((n, w) => n + w.seconds_watched, 0);
  const endDefault = p.access_expires_at
    ? new Date(p.access_expires_at).toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" })
    : s.default_access_end;

  return (
    <div className="space-y-6">
      <Link href="/admin/students" className="inline-flex min-h-10 items-center gap-1 text-b2-meadow hover:underline">
        <ArrowLeft size={18} /> Students
      </Link>

      <Card>
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{p.full_name || "—"}</h1>
            <p className="text-b2-pistachio">{p.email}</p>
            <p className="tabular text-b2-pistachio">{p.phone ?? "No phone"}</p>
            <p className="mt-2 text-sm text-b2-stone">
              Joined {fmtDate(p.created_at)}
              {p.last_active_at ? ` · last active ${fmtDateTime(p.last_active_at)}` : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {status === "paid" ? (
              <Pill tone="caribbean">Paid · until {p.access_expires_at ? fmtDate(p.access_expires_at) : "no end date"}</Pill>
            ) : status === "expired" ? (
              <Pill tone="warning">Expired {p.access_expires_at ? fmtDate(p.access_expires_at) : ""}</Pill>
            ) : (
              <Pill tone="stone">Free</Pill>
            )}
            {p.phone && (
              <a href={waLink(p.phone)} target="_blank" rel="noopener noreferrer" className={btn("secondary", "sm")}>
                <MessageCircle size={16} /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="font-semibold">{status === "free" ? "Mark as paid" : "Record another payment"}</p>
          <p className="mt-1 text-sm text-b2-pistachio">After you verify the bKash TrxID on WhatsApp.</p>
          <form action={markPaid} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="user_id" value={p.id} />
            <div>
              <label className="b2-label" htmlFor="amount">Amount (৳)</label>
              <input id="amount" name="amount" type="number" min={0} defaultValue={s.offer_price} className="b2-input" required />
            </div>
            <div>
              <label className="b2-label" htmlFor="trx_id">bKash TrxID</label>
              <input id="trx_id" name="trx_id" className="b2-input" placeholder="e.g. 9K7A1B2C3D" />
            </div>
            <div>
              <label className="b2-label" htmlFor="paid_on">Paid on</label>
              <input id="paid_on" name="paid_on" type="date" defaultValue={new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" })} className="b2-input" />
            </div>
            <div>
              <label className="b2-label" htmlFor="access_end">Access until</label>
              <input id="access_end" name="access_end" type="date" defaultValue={endDefault} className="b2-input" />
            </div>
            <div className="sm:col-span-2">
              <SubmitButton pending="Saving" className="w-full sm:w-auto">
                {status === "free" ? "Mark as paid & unlock" : "Save payment"}
              </SubmitButton>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card>
            <p className="font-semibold">Access</p>
            <form action={setAccessEnd} className="mt-3 flex flex-wrap items-end gap-3">
              <input type="hidden" name="user_id" value={p.id} />
              <div className="flex-1">
                <label className="b2-label" htmlFor="end2">Change end date</label>
                <input id="end2" name="access_end" type="date" defaultValue={endDefault} className="b2-input" />
              </div>
              <SubmitButton variant="secondary" pending="Saving">Save</SubmitButton>
            </form>
            {p.is_paid && (
              <form action={revokeAccess} className="mt-4">
                <input type="hidden" name="user_id" value={p.id} />
                <ConfirmButton message={`Revoke paid access for ${p.full_name}? They become a free account.`}>Revoke paid access</ConfirmButton>
              </form>
            )}
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">Device</p>
              <form action={setMultiDevice}>
                <input type="hidden" name="user_id" value={p.id} />
                <input type="hidden" name="value" value={String(!p.multi_device)} />
                <FlagToggle on={p.multi_device} label="Allow multiple devices" />
              </form>
            </div>
            {p.multi_device ? (
              <p className="mt-2 text-sm text-b2-warning">
                One-device lock is off for this account. It can log in on any number of devices.
              </p>
            ) : device ? (
              <>
                <p className="mt-2 break-words text-sm text-b2-pistachio">{device.user_agent || "Unknown browser"}</p>
                <p className="mt-1 text-sm text-b2-stone">Bound {fmtDateTime(device.bound_at)} · last seen {fmtDateTime(device.last_seen_at)}</p>
                <form action={resetDevice} className="mt-4">
                  <input type="hidden" name="user_id" value={p.id} />
                  <ConfirmButton message="Reset device? The next device this student logs in on becomes their device." variant="secondary">
                    Reset device
                  </ConfirmButton>
                </form>
              </>
            ) : (
              <p className="mt-2 text-sm text-b2-pistachio">No device bound yet. The next login binds one.</p>
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Attempts" value={attempts?.length ?? 0} hint="last 10 shown" />
        <StatTile label="Hours watched" value={hours(watched)} />
        <StatTile label="Payments" value={payments?.length ?? 0} />
        <StatTile label="Paid total" value={taka((payments ?? []).reduce((n, x) => n + x.amount, 0))} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="mb-3 font-semibold">Payments</p>
          {payments?.length ? (
            <ul className="divide-y divide-b2-divider text-sm">
              {payments.map((x) => (
                <li key={x.id} className="flex justify-between gap-3 py-2.5">
                  <span>{fmtDate(x.paid_on)} · <span className="tabular">{x.trx_id ?? "no TrxID"}</span></span>
                  <span className="tabular font-semibold">{taka(x.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-b2-pistachio">No payments recorded.</p>
          )}
        </Card>
        <Card>
          <p className="mb-3 font-semibold">Recent MCQ attempts</p>
          {attempts?.length ? (
            <ul className="divide-y divide-b2-divider text-sm">
              {attempts.map((a) => (
                <li key={a.id} className="flex justify-between gap-3 py-2.5">
                  <span className="truncate">
                    {(a.question_sets as unknown as { title: string } | null)?.title} · {a.mode}
                  </span>
                  <span className="tabular">{a.submitted_at ? `${Number(a.score).toFixed(2)} / ${a.n_questions}` : "in progress"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-b2-pistachio">No attempts yet.</p>
          )}
        </Card>
      </div>

      <Card>
        <p className="mb-3 font-semibold">Private note</p>
        <form action={saveAdminNote} className="space-y-3">
          <input type="hidden" name="user_id" value={p.id} />
          <textarea name="admin_note" defaultValue={p.admin_note ?? ""} rows={3} className="b2-input" placeholder="Only you can see this." />
          <SubmitButton variant="secondary" pending="Saving">Save note</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
