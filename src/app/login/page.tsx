import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/app";
  const error = sp.error === "link";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <Logo size={32} className="mb-10 self-start" />
      <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 mb-8 text-ink-2">
        New here? The same link creates your workspace.
      </p>
      {error ? (
        <p role="alert" className="mb-4 rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          That link has expired or was already used. Request a new one.
        </p>
      ) : null}
      <LoginForm next={next} />
      <p className="mt-8 text-sm text-ink-3">
        Just looking? <Link href="/demo/login" className="underline underline-offset-2 hover:text-ink">Sign in to the demo dashboard</Link> instead.
      </p>
    </main>
  );
}
