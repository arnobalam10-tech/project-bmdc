import type { Metadata } from "next";
import Link from "next/link";
import { B2Logo } from "@/components/brand/B2";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[680px] px-5 py-12">
      <B2Logo />
      <h1 className="mt-10 text-3xl font-semibold tracking-tight">Privacy</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-b2-pistachio">
        <p>We collect your name, email and phone/WhatsApp number to run your account, verify payments and contact you about classes.</p>
        <p>We store your study activity (MCQ answers, classes watched, notes opened) to show your progress. The leaderboard shows only your first name and last initial.</p>
        <p>We store an anonymous device identifier in a cookie to enforce one device per account.</p>
        <p>We never sell your data. Data is stored with Supabase. Ask us on WhatsApp to delete your account.</p>
      </div>
      <Link href="/" className="mt-10 inline-block text-b2-caribbean hover:underline">← Back to home</Link>
    </main>
  );
}
