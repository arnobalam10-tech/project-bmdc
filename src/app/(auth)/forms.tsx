"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { SubmitButton } from "@/components/ui/client";
import { Alert } from "@/components/ui/primitives";
import { btn } from "@/components/ui/Button";
import {
  forgotPassword,
  resetPassword,
  saveOnboarding,
  signIn,
  signInWithGoogle,
  signUp,
  type FormState,
} from "./actions";
import { GoogleIcon } from "./AuthShell";

function Messages({ state }: { state: FormState }) {
  if (state?.error) return <Alert tone="error">{state.error}</Alert>;
  if (state?.ok) return <Alert tone="success">{state.ok}</Alert>;
  return null;
}

export function PasswordInput({ name = "password", autoComplete, label = "Password" }: { name?: string; autoComplete: string; label?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="b2-label" htmlFor={name}>
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          required
          minLength={autoComplete === "new-password" ? 8 : undefined}
          autoComplete={autoComplete}
          className="b2-input pr-12"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center text-b2-meadow"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export function PhoneInput({ defaultValue }: { defaultValue?: string }) {
  return (
    <div>
      <label className="b2-label" htmlFor="phone">
        Phone / WhatsApp
      </label>
      <div className="flex">
        <span className="grid place-items-center rounded-l-[10px] border border-r-0 border-b2-border bg-b2-pine px-3 text-b2-pistachio">
          +880
        </span>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="1XXXXXXXXX"
          required
          defaultValue={defaultValue}
          className="b2-input !rounded-l-none"
        />
      </div>
      <p className="mt-1.5 text-xs text-b2-pistachio">With or without the first 0. We use it to match your bKash payment and WhatsApp.</p>
    </div>
  );
}

export function GoogleButton({ next, label = "Continue with Google" }: { next?: string; label?: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="next" value={next ?? "/dashboard"} />
      <SubmitButton variant="white" size="lg" className="w-full" pending="Opening Google">
        <GoogleIcon /> {label}
      </SubmitButton>
    </form>
  );
}

export function Divider() {
  return (
    <div className="my-6 flex items-center gap-4 text-sm text-b2-stone">
      <span className="h-px flex-1 bg-b2-divider" /> or with email <span className="h-px flex-1 bg-b2-divider" />
    </div>
  );
}

export function LoginForm({ next, error }: { next?: string; error?: string }) {
  const [state, action] = useActionState(signIn, undefined);
  return (
    <>
      {error && (
        <div className="mb-4">
          <Alert tone="error">
            {error === "google" ? "Google sign-in didn't go through. Try again." : "That link has expired. Try again."}
          </Alert>
        </div>
      )}
      <GoogleButton next={next} />
      <Divider />
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next ?? "/dashboard"} />
        <div>
          <label className="b2-label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required className="b2-input" />
        </div>
        <PasswordInput autoComplete="current-password" />
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-b2-meadow hover:underline">
            Forgot password?
          </Link>
        </div>
        <Messages state={state} />
        <SubmitButton size="lg" className="w-full" pending="Logging in">
          Log in
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-b2-pistachio">
        New here?{" "}
        <Link href="/signup" className="font-medium text-b2-caribbean hover:underline">
          Create a free account
        </Link>
      </p>
    </>
  );
}

export function SignupForm({ from }: { from?: string }) {
  const [state, action] = useActionState(signUp, undefined);
  return (
    <>
      <GoogleButton label="Sign up with Google" next={from === "workshop" ? "/dashboard?welcome=workshop" : "/dashboard?welcome=1"} />
      <Divider />
      <form action={action} className="space-y-4">
        <input type="hidden" name="from" value={from ?? ""} />
        <div>
          <label className="b2-label" htmlFor="full_name">
            Full name
          </label>
          <input id="full_name" name="full_name" autoComplete="name" required className="b2-input" placeholder="Dr. Your Name" />
        </div>
        <div>
          <label className="b2-label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required className="b2-input" />
        </div>
        <PhoneInput />
        <PasswordInput autoComplete="new-password" />
        <Messages state={state} />
        <SubmitButton size="lg" className="w-full" pending="Creating your account">
          Create free account
        </SubmitButton>
        <p className="text-center text-xs leading-relaxed text-b2-pistachio">
          One account works on one device. By signing up you agree to our{" "}
          <Link href="/terms" className="underline">
            terms
          </Link>
          .
        </p>
      </form>
      <p className="mt-6 text-center text-b2-pistachio">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-b2-caribbean hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(forgotPassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="b2-label" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="b2-input" />
      </div>
      <Messages state={state} />
      <SubmitButton size="lg" className="w-full" pending="Sending">
        Send reset link
      </SubmitButton>
      <Link href="/login" className={btn("ghost", "md", "w-full")}>
        Back to log in
      </Link>
    </form>
  );
}

export function ResetForm() {
  const [state, action] = useActionState(resetPassword, undefined);
  return (
    <form action={action} className="space-y-4">
      <PasswordInput autoComplete="new-password" label="New password" />
      <PasswordInput name="confirm" autoComplete="new-password" label="Confirm new password" />
      <Messages state={state} />
      <SubmitButton size="lg" className="w-full" pending="Saving">
        Save new password
      </SubmitButton>
    </form>
  );
}

export function OnboardingForm({ name, phone }: { name?: string; phone?: string }) {
  const [state, action] = useActionState(saveOnboarding, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="b2-label" htmlFor="full_name">
          Full name
        </label>
        <input id="full_name" name="full_name" defaultValue={name} autoComplete="name" required className="b2-input" />
      </div>
      <PhoneInput defaultValue={phone} />
      <Messages state={state} />
      <SubmitButton size="lg" className="w-full" pending="Saving">
        Continue
      </SubmitButton>
    </form>
  );
}
