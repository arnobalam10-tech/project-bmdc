import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/access";
import { fmtDate, taka } from "@/lib/format";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deletePayment } from "../actions";

export const metadata: Metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("payments")
    .select("id,amount,trx_id,paid_on,user_id,profiles!payments_user_id_fkey(full_name,email)")
    .order("paid_on", { ascending: false })
    .limit(500);
  const rows = data ?? [];
  const total = rows.reduce((n, r) => n + r.amount, 0);

  return (
    <>
      <PageHeader title="Payments" sub={`${rows.length} payments · ${taka(total)} total`} />
      {rows.length === 0 ? (
        <EmptyState title="No payments recorded yet." sub="Mark a student as paid from their profile and it appears here." />
      ) : (
        <ul className="divide-y divide-b2-divider overflow-hidden rounded-[20px] border border-b2-border bg-b2-dark">
          {rows.map((r) => {
            const who = r.profiles as unknown as { full_name: string; email: string } | null;
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-5">
                <Link href={`/admin/students/${r.user_id}`} className="min-w-0 flex-1 hover:text-b2-caribbean">
                  <span className="block truncate font-medium">{who?.full_name || who?.email}</span>
                  <span className="tabular block text-xs text-b2-pistachio">
                    {fmtDate(r.paid_on)} · TrxID {r.trx_id ?? "—"}
                  </span>
                </Link>
                <span className="tabular font-semibold">{taka(r.amount)}</span>
                <form action={deletePayment}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="user_id" value={r.user_id} />
                  <ConfirmButton message="Delete this payment record? (Access is not changed.)" variant="ghost">
                    Delete
                  </ConfirmButton>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
