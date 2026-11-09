import Link from "next/link";
import { requireAdmin } from "@/lib/access";
import { taka } from "@/lib/format";
import { Card, PageHeader, StatTile } from "@/components/ui/primitives";
import { btn } from "@/components/ui/Button";

type Overview = {
  total: number;
  paid: number;
  expired: number;
  free: number;
  today: number;
  week: number;
  revenue: number;
  signups_by_day: { day: string; count: number }[];
};

export default async function AdminOverview() {
  const { supabase } = await requireAdmin();
  const [{ data }, { data: recent }, { count: toVerify }] = await Promise.all([
    supabase.rpc("admin_overview"),
    supabase.from("profiles").select("id,full_name,email,is_paid,created_at").eq("role", "student").order("created_at", { ascending: false }).limit(8),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  const o = (data ?? {}) as Overview;
  const days = o.signups_by_day ?? [];
  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" sub="Students, enrolments and revenue at a glance." />
      {(toVerify ?? 0) > 0 && (
        <Link
          href="/admin/orders"
          className="flex items-center justify-between gap-3 rounded-[20px] border border-b2-warning/40 bg-b2-warning/5 px-5 py-4 hover:border-b2-warning"
        >
          <span className="font-semibold">
            {toVerify} new {toVerify === 1 ? "order" : "orders"} to verify
          </span>
          <span className="text-b2-warning">Open orders →</span>
        </Link>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Total signups" value={o.total ?? 0} />
        <StatTile label="Paid (active)" value={o.paid ?? 0} />
        <StatTile label="Free" value={o.free ?? 0} />
        <StatTile label="Expired" value={o.expired ?? 0} />
        <StatTile label="This week" value={o.week ?? 0} hint={`${o.today ?? 0} today`} />
        <StatTile label="Revenue" value={taka(o.revenue ?? 0)} />
      </div>

      <Card>
        <p className="font-semibold">Signups, last 30 days</p>
        {days.length === 0 ? (
          <p className="mt-4 text-b2-pistachio">No signups yet.</p>
        ) : (
          <div className="mt-5 flex h-40 items-end gap-1.5" role="img" aria-label="Signups per day">
            {days.map((d) => (
              <div key={d.day} className="group relative flex-1">
                <div className="rounded-t-md bg-b2-caribbean/80 transition-colors group-hover:bg-b2-caribbean" style={{ height: `${(d.count / max) * 150}px` }} />
                <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-b2-black px-2 py-0.5 text-xs group-hover:block">
                  {d.day.slice(5)}: {d.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold">Newest students</p>
          <Link href="/admin/students" className={btn("ghost", "sm")}>All students →</Link>
        </div>
        <ul className="divide-y divide-b2-divider">
          {(recent ?? []).map((r) => (
            <li key={r.id}>
              <Link href={`/admin/students/${r.id}`} className="flex min-h-14 items-center gap-3 py-2 hover:text-b2-caribbean">
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{r.full_name || "—"}</span>
                  <span className="block truncate text-xs text-b2-pistachio">{r.email}</span>
                </span>
                <span className={`text-xs ${r.is_paid ? "text-b2-caribbean" : "text-b2-stone"}`}>{r.is_paid ? "Paid" : "Free"}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
