"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "@/app/login/actions";
import { Button, ErrorNote, Field, Input } from "@/components/ui";

export function LoginForm({ demo, next }: { demo?: boolean; next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, null);

  if (state?.ok) {
    return (
      <div className="rounded-sm border border-line p-5">
        <p className="font-medium">Check your inbox</p>
        <p className="mt-1 text-sm text-ink-2">
          We sent a sign-in link to <span className="text-ink">{state.email}</span>. It works once and expires in an hour.
          Open it in this browser.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {demo ? <input type="hidden" name="join" value="demo" /> : null}
      <input type="hidden" name="next" value={next ?? "/app"} />
      <Field label="Email" htmlFor="email" hint={demo ? "Any address works. You join the shared demo workspace, which resets nightly." : "No password. We email you a link."}>
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus placeholder="you@company.com" />
      </Field>
      {state && !state.ok ? <ErrorNote title={state.message} /> : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending…" : demo ? "Send me a demo link" : "Send me a sign-in link"}
      </Button>
    </form>
  );
}
