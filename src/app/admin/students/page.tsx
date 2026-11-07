import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { accessStatus, requireAdmin, type Profile } from "@/lib/access";
import { fmtDate } from "@/lib/format";
import { EmptyState, PageHeader, Pill } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Students" };

const FILTERS = ["all", "paid", "free", "expired"] as const;

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ q?: string; f?: string }> }) {
  const { q = "", f = "all" } = await searchParams;
  const { supabase } = await requireAdmin();
  let query = supabase.from("profiles").select("*").eq("role", "student").order("created_at", { ascending: false }).limit(500);
  if (q) {
    const term = q.replace(/[%,()]/g, " ").trim();
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);
  }
  if (f === "free") query = query.eq("is_paid", false);
  if (f === "paid" || f === "expired") query = query.eq("is_paid", true);
  const { data } = await query;
  let rows = (data ?? []) as Profile[];
  if (f === "paid") rows = rows.filter((r) => accessStatus(r) === "paid");
  if (f === "expired") rows = rows.filter((r) => accessStatus(r) === "expired");

  const pill = (p: Profile) => {
    const s = accessStatus(p);
    return s === "paid" ? <Pill tone="caribbean">Paid</Pill> : s === "expired" ? <Pill tone="warning">Expired</Pill> : <Pill tone="stone">Free</Pill>;
  };

  return (
    <>
      <PageHeader title="Students" sub={`${rows.length} shown`} />
      <form className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-b2-stone" />
          <input name="q" defaultValue={q} placeholder="Search name, email or phone" className="b2-input !pl-11" />
        </div>
        <input type="hidden" name="f" value={f} />
        <button className="min-h-12 rounded-full border border-b2-meadow px-6 font-semibold text-b2-meadow">Search</button>
      </form>
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((x) => (
          <Link
            key={x}
            href={`/admin/students?f=${x}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`min-h-10 rounded-full border px-4 py-2 text-sm font-medium capitalize ${
              f === x ? "border-transparent bg-b2-caribbean text-b2-ink" : "border-b2-border text-b2-meadow"
            }`}
          >
            {x}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No students found." />
      ) : (
        <>
          {/* phone: cards */}
          <ul className="space-y-3 md:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/students/${r.id}`} className="block rounded-[20px] border border-b2-border bg-b2-dark p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-medium">{r.full_name || "—"}</p>
                    {pill(r)}
                  </div>
                  <p className="mt-1 truncate text-sm text-b2-pistachio">{r.email}</p>
                  <p className="tabular text-sm text-b2-pistachio">{r.phone ?? "no phone"} · joined {fmtDate(r.created_at, { year: undefined })}</p>
                </Link>
              </li>
            ))}
          </ul>
          {/* desktop: table with sticky header */}
          <div className="hidden overflow-hidden rounded-[20px] border border-b2-border md:block">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-b2-pine text-xs uppercase tracking-[0.1em] text-b2-pistachio">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Access until</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-b2-divider bg-b2-dark">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[.03]">
                    <td className="px-4 py-3">
                      <Link href={`/admin/students/${r.id}`} className="font-medium hover:text-b2-caribbean">
                        {r.full_name || "—"}
                      </Link>
                    </td>
                    <td className="max-w-56 truncate px-4 py-3 text-b2-pistachio">{r.email}</td>
                    <td className="tabular px-4 py-3 text-b2-pistachio">{r.phone ?? "—"}</td>
                    <td className="px-4 py-3">{pill(r)}</td>
                    <td className="px-4 py-3 text-b2-pistachio">{r.access_expires_at ? fmtDate(r.access_expires_at) : "—"}</td>
                    <td className="px-4 py-3 text-b2-pistachio">{fmtDate(r.created_at, { year: undefined })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
