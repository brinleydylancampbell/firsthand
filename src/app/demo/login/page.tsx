import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Demo dashboard" };

export default function DemoLoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <Link href="/" className="eyebrow mb-10 inline-block">
        Firsthand
      </Link>
      <h1 className="text-xl font-semibold tracking-tight">Try the demo dashboard</h1>
      <p className="mt-2 mb-8 text-ink-2">
        A real workspace with twelve testimonials waiting. Approve, edit, build a widget, run the search. Everything you do
        is real and resets overnight.
      </p>
      <LoginForm demo next="/app" />
      <p className="mt-8 text-sm text-ink-3">
        Want your own? <Link href="/login" className="underline underline-offset-2 hover:text-ink">Sign in normally</Link>.
      </p>
    </main>
  );
}
