"use client";

import { Button, ButtonLink, ErrorNote } from "@/components/ui";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-24">
      <ErrorNote
        title="Something went wrong loading this page"
        body={`Nothing you did caused it. Trying again usually works. If it does not, the service behind this page may be down.${error.digest ? ` Reference ${error.digest}.` : ""}`}
        action={
          <div className="flex gap-2">
            <Button size="sm" onClick={reset}>Try again</Button>
            <ButtonLink href="/" size="sm" variant="ghost">Home</ButtonLink>
          </div>
        }
      />
    </main>
  );
}
