import type { Metadata } from "next";
import { requireAdmin } from "@/lib/access";
import { getSettings } from "@/lib/settings";
import { Alert, Card, PageHeader } from "@/components/ui/primitives";
import { SubmitButton } from "@/components/ui/client";
import { saveSettings } from "../actions";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  await requireAdmin();
  const s = await getSettings();
  const workshopLocal = new Date(new Date(s.workshop_at).getTime() + 6 * 3600_000).toISOString().slice(0, 16);

  const field = (name: string, label: string, value: string | number, type = "text", hint?: string) => (
    <div>
      <label className="b2-label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} defaultValue={value} required className="b2-input" />
      {hint && <p className="mt-1 text-xs text-b2-pistachio">{hint}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" sub="These feed the landing page and enroll steps. Changes appear within a few minutes." />
      {saved && <Alert tone="success">Saved.</Alert>}
      <Card>
        <form action={saveSettings} className="grid gap-4 sm:grid-cols-2">
          {field("price", "Regular price (৳)", s.price, "number")}
          {field("offer_price", "Offer price (৳)", s.offer_price, "number")}
          {field("bkash_number", "bKash number (Personal)", s.bkash_number, "tel")}
          {field("whatsapp_number", "WhatsApp number", s.whatsapp_number, "tel")}
          {field("batch_start", "Batch starts", s.batch_start, "date")}
          {field("workshop_at", "Free workshop (Bangladesh time)", workshopLocal, "datetime-local", "The workshop's Meet link is set under Live sessions.")}
          {field("default_access_end", "Default access end for paid students", s.default_access_end, "date")}
          {field("facebook_url", "Facebook page URL", s.facebook_url, "url")}
          <div className="sm:col-span-2">
            <SubmitButton pending="Saving">Save settings</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
