"use client";

import { Button, ButtonLink, ErrorNote } from "@/components/ui";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const auth = /JWT|session|auth/i.test(error.message);
  return (
    <div className="mx-auto w-full max-w-xl px-6 py-16">
      <ErrorNote
        title={auth ? "Your session has expired" : "This page could not load"}
        body={
          auth
            ? "Sign in again and you will be back where you were."
            : `The dashboard hit an error talking to the database. Your data is safe. Try again, and if it keeps happening check the Supabase project is reachable.${error.digest ? ` Reference ${error.digest}.` : ""}`
        }
        action={
          <div className="flex gap-2">
            {auth ? <ButtonLink href="/login" size="sm">Sign in</ButtonLink> : <Button size="sm" onClick={reset}>Try again</Button>}
            <ButtonLink href="/app" size="sm" variant="ghost">Back to the inbox</ButtonLink>
          </div>
        }
      />
    </div>
  );
}
