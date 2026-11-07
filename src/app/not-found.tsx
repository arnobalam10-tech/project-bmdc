import { B2Mark } from "@/components/brand/B2";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <B2Mark className="is-wave mx-auto" size={80} />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">This page isn&apos;t here.</h1>
        <p className="mt-2 text-b2-pistachio">It may have moved, or the link is wrong.</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/dashboard">Dashboard</ButtonLink>
          <ButtonLink href="/" variant="secondary">Home</ButtonLink>
        </div>
      </div>
    </main>
  );
}
