import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { PixelEvent } from "@/components/app/MetaPixel";
import { COURSE } from "@/lib/pixel";
import { CheckoutShell, OrderReceipt, type Receipt } from "../ui";

export const metadata: Metadata = { title: "Order received", robots: { index: false } };

export default async function OrderDonePage({ searchParams }: { searchParams: Promise<{ o?: string }> }) {
  const { o } = await searchParams;
  if (!o || !/^[0-9a-f-]{36}$/i.test(o)) notFound();
  const supabase = await createClient();
  const [s, { data }, { data: auth }] = await Promise.all([
    getSettings(),
    supabase.rpc("get_order_receipt", { p_id: o }).maybeSingle<Receipt & { event_id: string; has_account: boolean }>(),
    supabase.auth.getUser(),
  ]);
  if (!data) notFound();

  return (
    <CheckoutShell>
      {/* same event id as the server-side Lead, so Meta counts it once */}
      <PixelEvent event="Lead" params={{ ...COURSE, value: data.amount }} eventId={`lead-${data.event_id}`} />
      <OrderReceipt order={data} s={s} orderId={o} justPlaced account={auth.user ? "signed-in" : data.has_account ? "exists" : "none"} />
    </CheckoutShell>
  );
}
