"use client";

import { B2Mark } from "@/components/brand/B2";
import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-[60dvh] place-items-center px-5 text-center">
      <div>
        <B2Mark className="is-heartbeat mx-auto" size={72} />
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">That didn&apos;t go through.</h1>
        <p className="mt-2 text-b2-pistachio">Check your connection and try again.</p>
        <Button className="mt-6" onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
