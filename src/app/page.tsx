import Link from "next/link";
import { ButtonLink } from "@/components/ui";

const demo = process.env.DEMO_WORKSPACE_SLUG ?? "demo";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-20">
      <p className="eyebrow">Firsthand</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">
        Testimonials collected by interview, in your customers’ own words.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-ink-2">
        A short conversation instead of a blank box. Consent and provenance built in. A wall and an embed that never slow your site down.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={`/f/${demo}/interview`} size="lg">
          Try the interview
        </ButtonLink>
        <ButtonLink href={`/w/${demo}`} size="lg" variant="secondary">
          See a wall of love
        </ButtonLink>
        <ButtonLink href="/demo/login" size="lg" variant="ghost">
          Sign in to the demo dashboard
        </ButtonLink>
      </div>
      <p className="mt-10 text-sm text-ink-3">
        Have an account? <Link href="/login" className="underline underline-offset-2 hover:text-ink">Sign in</Link>
      </p>
    </main>
  );
}
