import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { accessStatus, type Profile } from "@/lib/access";
import { getSettings } from "@/lib/settings";
import { taka } from "@/lib/format";
import { Alert } from "@/components/ui/primitives";
import { PixelEvent } from "@/components/app/MetaPixel";
import { COURSE } from "@/lib/pixel";
import { OrderForm } from "./OrderForm";
import { CheckoutShell, Enrolled, OrderReceipt, Summary, type Receipt } from "./ui";

export const metadata: Metadata = {
  title: "Order the course",
  description: "Order the 4-month BMDC RQE course. Pay with bKash and tell us the number you paid from. No account needed to order.",
};

export default async function EnrollPage() {
  const s = await getSettings();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let order: (Receipt & { id: string }) | null = null;
  if (user) {
    const [{ data: p }, { data: o }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>(),
      supabase
        .from("orders")
        .select("id,number,amount,bkash_number,status,email,full_name,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<Receipt & { id: string }>(),
    ]);
    profile = p;
    order = o;
  }
  const status = profile ? accessStatus(profile) : null;

  if (status === "paid" || status === "admin")
    return (
      <CheckoutShell>
        <Enrolled until={profile?.access_expires_at ?? null} />
      </CheckoutShell>
    );
  if (order?.status === "pending")
    return (
      <CheckoutShell>
        <OrderReceipt order={order} s={s} justPlaced={false} account="signed-in" />
      </CheckoutShell>
    );
  const rejected = order?.status === "rejected" ? order : null;

  return (
    <CheckoutShell>
      <PixelEvent event="InitiateCheckout" params={{ ...COURSE, value: s.offer_price, num_items: 1 }} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-8">
        <div className="min-w-0">
          <div className="mb-5 lg:hidden">
            <Summary s={s} compact />
          </div>
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-2 text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] md:text-[38px]">
            Order the course. <em className="hl">{taka(s.offer_price)}</em>
          </h1>
          <p className="mb-5 mt-2 text-[15px] text-b2-pistachio">No account needed. Takes about a minute.</p>

          {rejected && (
            <div className="mb-5">
              <Alert tone="error">
                We couldn&apos;t find the payment for order #{rejected.number} (from {rejected.bkash_number}). Check the number and order
                again, or message us on WhatsApp.
              </Alert>
            </div>
          )}

          <OrderForm
            name={profile?.full_name || undefined}
            email={profile?.email ?? undefined}
            phone={profile?.phone ?? undefined}
            bkashDefault={rejected?.bkash_number}
            bkashNumber={s.bkash_number}
            price={s.offer_price}
          />
        </div>

        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <Summary s={s} />
        </aside>
      </div>
    </CheckoutShell>
  );
}
