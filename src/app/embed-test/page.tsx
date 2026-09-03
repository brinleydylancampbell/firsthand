import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Embed test pages", robots: { index: false } };

export default function EmbedTestIndex() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="mt-2 text-xl font-semibold tracking-tight">Three host pages, one snippet</h1>
      <p className="mt-3 text-ink-2">
        The same widgets pasted into deliberately different sites. Fonts are inherited, colours come from CSS variables, and
        the height is reserved before the script runs so nothing on the host page moves.
      </p>
      <ul className="mt-8 space-y-2">
        {[
          ["serif", "A serif newsletter on cream"],
          ["sans", "A sans marketing site with a custom accent and radius"],
          ["dark", "A dark monospace portfolio"],
        ].map(([slug, label]) => (
          <li key={slug}>
            <Link href={`/embed-test/${slug}`} className="underline underline-offset-2 hover:text-ink">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
