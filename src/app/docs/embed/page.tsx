import type { Metadata } from "next";
import Link from "next/link";
import { appUrl } from "@/lib/utils";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Embed docs", description: "How the Firsthand embed works: one script, one div, no iframe, no tracking." };

export default function EmbedDocs() {
  const origin = appUrl();
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <Logo size={28} />
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">The embed</h1>
      <p className="mt-3 text-lg text-ink-2">One script tag and a div. No iframe. Inherits your font. Reserves its height so your page never shifts. Under 5 KB.</p>

      <section className="prose-fh mt-10 space-y-4">
        <h2 className="text-lg font-semibold">The snippet</h2>
        <p className="text-ink-2">Copy it from the widget builder. It looks like this:</p>
        <pre className="overflow-x-auto rounded-2xl border border-line bg-paper-2 p-4 text-xs leading-relaxed"><code>{`<style>[data-firsthand="WIDGET_ID"]{min-height:412px}@media(max-width:899px){[data-firsthand="WIDGET_ID"]{min-height:624px}}@media(max-width:639px){[data-firsthand="WIDGET_ID"]{min-height:1260px}}</style>
<div data-firsthand="WIDGET_ID"></div>
<script src="${origin}/embed.js" async></script>`}</code></pre>
        <p className="text-ink-2">The style rule is what stops layout shift. Cards are fixed height and the grid has a fixed column count per breakpoint, so the builder knows the exact height before anything loads.</p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">What the script does</h2>
        <ol className="list-decimal space-y-2 pl-5 text-ink-2">
          <li>Finds every element with a <code>data-firsthand</code> attribute.</li>
          <li>Fetches one HTML fragment per widget from <code>/api/widget/ID</code>. The fragment is rendered on our server and cached at the edge, so your visitor never waits on a database.</li>
          <li>Injects the fragment. No React, no iframe, no external CSS file. Styles are scoped under <code>.fh-</code> classes and use <code>font: inherit</code>.</li>
          <li>Sends one beacon to count the view. That is rolled up per day. No cookies, no fingerprinting, no IP storage, nothing about the visitor.</li>
        </ol>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">Styling</h2>
        <p className="text-ink-2">Attributes on the div, or CSS variables on any ancestor. Attributes win.</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-3">
              <th className="py-2 font-medium">Attribute</th>
              <th className="py-2 font-medium">CSS variable</th>
              <th className="py-2 font-medium">What it changes</th>
            </tr>
          </thead>
          <tbody className="text-ink-2">
            {[
              ["data-theme=\"light|dark\"", "", "Forces a theme. By default the widget inherits your page’s text colour and draws translucent borders, so it fits light and dark sites without configuration."],
              ["data-accent=\"#c2410c\"", "--fh-accent", "Stars and links"],
              ["data-radius=\"8px\"", "--fh-radius", "Card corners"],
              ["", "--fh-text", "Text colour"],
              ["", "--fh-muted", "Secondary text"],
              ["", "--fh-card", "Card background"],
              ["", "--fh-line", "Card border"],
            ].map(([a, v, d]) => (
              <tr key={a + v} className="border-b border-line-2">
                <td className="py-2 pr-3"><code className="text-xs">{a}</code></td>
                <td className="py-2 pr-3"><code className="text-xs">{v}</code></td>
                <td className="py-2">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">Single page apps</h2>
        <p className="text-ink-2">The script runs once on load. If you render the div later, call <code>window.Firsthand.render()</code>.</p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">Test pages</h2>
        <p className="text-ink-2">
          The same snippet inside <Link href="/embed-test/serif" className="underline underline-offset-2">a serif site</Link>,{" "}
          <Link href="/embed-test/sans" className="underline underline-offset-2">a sans site with overrides</Link> and{" "}
          <Link href="/embed-test/dark" className="underline underline-offset-2">a dark site</Link>. Playwright measures layout shift against them on every push.
        </p>
      </section>
    </main>
  );
}
