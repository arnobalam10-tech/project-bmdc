import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { requireAdmin } from "@/lib/access";
import { getSettings, waLink } from "@/lib/settings";
import { fmtDateTime, taka } from "@/lib/format";
import { EmptyState, PageHeader, Pill } from "@/components/ui/primitives";
import { CopyButton, SubmitButton } from "@/components/ui/client";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { btn } from "@/components/ui/Button";
import { approveOrder, rejectOrder, reopenOrder } from "../actions";

export const metadata: Metadata = { title: "Orders" };

const TABS = [
  ["pending", "To verify"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
  ["all", "All"],
] as const;

type Row = {
  id: string;
  number: number;
  user_id: string;
  amount: number;
  bkash_number: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  profiles: { full_name: string; email: string | null; phone: string | null } | null;
};

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const { s: tab = "pending" } = await searchParams;
  const { supabase } = await requireAdmin();
  const settings = await getSettings();
  let q = supabase
    .from("orders")
    .select("id,number,user_id,amount,bkash_number,status,admin_note,created_at,reviewed_at,profiles!orders_user_id_fkey(full_name,email,phone)")
    .order("created_at", { ascending: tab === "pending" })
    .limit(300);
  if (tab !== "all") q = q.eq("status", tab);
  const [{ data, error }, { count: pendingCount }] = await Promise.all([
    q,
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <>
      <PageHeader
        title="Orders"
        sub="Check each sender number in your bKash app, then approve to unlock the student."
      />
      <nav className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1">
        {TABS.map(([key, label]) => (
          <Link key={key} href={`/admin/orders?s=${key}`} className={btn(tab === key ? "primary" : "secondary", "sm", "flex-none")}>
            {label}
            {key === "pending" && (pendingCount ?? 0) > 0 ? ` · ${pendingCount}` : ""}
          </Link>
        ))}
      </nav>

      {error ? (
        <EmptyState title="Orders aren't set up yet." sub="The orders table is missing in the database. Apply migration 0010_orders.sql." />
      ) : rows.length === 0 ? (
        <EmptyState
          title={tab === "pending" ? "Nothing to verify." : "No orders here yet."}
          sub={tab === "pending" ? "New orders from the Join the batch page show up here." : undefined}
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((o) => {
            const who = o.profiles;
            return (
              <li key={o.id} className="rounded-[20px] border border-b2-border bg-b2-dark p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tabular font-semibold">#{o.number}</span>
                      {o.status === "pending" ? (
                        <Pill tone="warning">To verify</Pill>
                      ) : o.status === "approved" ? (
                        <Pill tone="caribbean">Approved</Pill>
                      ) : (
                        <Pill tone="error">Rejected</Pill>
                      )}
                      <span className="text-xs text-b2-pistachio">{fmtDateTime(o.created_at)}</span>
                    </div>
                    <Link href={`/admin/students/${o.user_id}`} className="mt-2 block hover:text-b2-caribbean">
                      <span className="block truncate font-medium">{who?.full_name || "—"}</span>
                      <span className="block truncate text-sm text-b2-pistachio">
                        {who?.email}
                        {who?.phone ? ` · ${who.phone}` : ""}
                      </span>
                    </Link>
                  </div>
                  <div className="rounded-2xl bg-b2-black/40 px-4 py-3 sm:bg-transparent sm:p-0 sm:text-right">
                    <p className="text-xs uppercase tracking-[0.12em] text-b2-pistachio">bKash from</p>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <span className="tabular text-xl font-semibold">{o.bkash_number}</span>
                      <CopyButton text={o.bkash_number} />
                    </div>
                    <p className="tabular text-sm text-b2-pistachio">{taka(o.amount)}</p>
                  </div>
                </div>

                {o.admin_note && <p className="mt-3 text-sm text-b2-pistachio">Note: {o.admin_note}</p>}

                {o.status === "pending" && (
                  <div className="mt-4 grid gap-3 border-t border-b2-divider pt-4 lg:grid-cols-[1fr_auto]">
                    <form action={approveOrder} className="flex flex-wrap items-end gap-3">
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="user_id" value={o.user_id} />
                      <div>
                        <label className="b2-label" htmlFor={`end-${o.id}`}>Access until</label>
                        <input id={`end-${o.id}`} name="access_end" type="date" defaultValue={settings.default_access_end} className="b2-input" />
                      </div>
                      <SubmitButton pending="Unlocking">Approve & unlock</SubmitButton>
                    </form>
                    <div className="flex flex-wrap items-end gap-3">
                      {who?.phone && (
                        <a
                          href={waLink(who.phone, `Assalamu alaikum, this is Project BMDC about your order #${o.number}.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={btn("secondary", "sm")}
                        >
                          <MessageCircle size={16} /> WhatsApp
                        </a>
                      )}
                      <form action={rejectOrder} className="flex w-full items-end gap-2 sm:w-auto">
                        <input type="hidden" name="id" value={o.id} />
                        <input name="admin_note" placeholder="Reason (shown to student)" className="b2-input !min-h-10 min-w-0 flex-1 sm:w-52 sm:flex-none" />
                        <ConfirmButton message={`Reject order #${o.number}? The student will be asked to check the number.`} variant="ghost">
                          Reject
                        </ConfirmButton>
                      </form>
                    </div>
                  </div>
                )}
                {o.status === "rejected" && (
                  <form action={reopenOrder} className="mt-3">
                    <input type="hidden" name="id" value={o.id} />
                    <SubmitButton variant="ghost" size="sm" pending="Reopening">Move back to “To verify”</SubmitButton>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
