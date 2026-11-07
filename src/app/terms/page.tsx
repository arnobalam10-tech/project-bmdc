import type { Metadata } from "next";
import Link from "next/link";
import { B2Logo } from "@/components/brand/B2";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[680px] px-5 py-12">
      <B2Logo />
      <h1 className="mt-10 text-3xl font-semibold tracking-tight">Terms of use</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-b2-pistachio">
        <p>Project BMDC provides an online preparation course for the BMDC Registration Qualifying Examination (RQE). By creating an account you agree to the following.</p>
        <p><b className="text-b2-flash">One account, one person, one device.</b> Your account is for your personal use only and works on one device. Sharing your login, recordings, notes or questions is not allowed and may lead to your account being closed without a refund.</p>
        <p><b className="text-b2-flash">Payment.</b> The course fee is paid by bKash and verified manually. Access for paid students lasts until the end date shown on your profile.</p>
        <p><b className="text-b2-flash">Content.</b> All classes, recordings, notes, questions and explanations belong to Project BMDC. Do not download, copy, record or redistribute them.</p>
        <p><b className="text-b2-flash">No guarantee.</b> The course is built to help you pass in one attempt, but we cannot guarantee any exam result.</p>
        <p>Questions? Message us on WhatsApp.</p>
      </div>
      <Link href="/" className="mt-10 inline-block text-b2-caribbean hover:underline">← Back to home</Link>
    </main>
  );
}
