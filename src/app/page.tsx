import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { ButtonLink } from "@/components/ui";
import { DEMO_WIDGET_WALL_ID } from "@/lib/seed";
import { snippet } from "@/lib/widget-size";
import { appUrl } from "@/lib/utils";

const demo = process.env.DEMO_WORKSPACE_SLUG ?? "demo";

export const metadata: Metadata = {
  title: "Firsthand · Testimonials in your customers’ own words",
  description: "Collect testimonials with consent built in, find the right one in seconds, and show them anywhere with a 1 KB embed.",
  openGraph: { images: [`/api/og/wall/${demo}`] },
};

/**
 * Show, don't tell. A headline, one button, and the actual product: the demo
 * workspace's wall widget, embedded here with the same snippet a customer
 * would paste. The full landing page comes later; the inside comes first.
 */
export default function Home() {
  const live = snippet({ origin: appUrl(), widgetId: DEMO_WIDGET_WALL_ID, type: "wall", config: { filters: {}, count: 6, theme: "auto" } });

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-5 pt-14 pb-10 sm:px-8 sm:pt-20">
          <h1 className="max-w-3xl text-4xl font-extrabold sm:text-5xl">Testimonials in your customers’ own words.</h1>
          <p className="mt-5 max-w-xl site-lede text-ink-2">Collected with consent. Found in seconds. Shown anywhere without slowing your site down.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href="/demo" size="lg" className="h-[52px] px-6">Open the demo</ButtonLink>
            <span className="site-meta text-ink-3">No sign-up. A shared workspace that resets overnight.</span>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
          <div className="rounded-3xl border border-line bg-card p-5 shadow-card sm:p-8">
            {/* embed.js replaces this div's contents before hydration; that is the point. */}
            <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: live }} />
            <p className="mt-6 site-meta text-ink-3">
              This is the demo workspace’s live widget, pasted into this page with the same three lines a customer would use.{" "}
              <Link href={`/w/${demo}`} className="underline underline-offset-4 hover:text-ink">See the full wall</Link>
              {" · "}
              <Link href="/docs/embed" className="underline underline-offset-4 hover:text-ink">How the embed works</Link>
            </p>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-10 site-meta text-ink-3 sm:px-8">
        <span>Firsthand. Built for The Build Games, September 2026.</span>
        <span className="flex gap-5">
          <a href="https://github.com/brinleydylancampbell/firsthand" target="_blank" rel="noreferrer" className="hover:text-ink">Source</a>
          <Link href="/docs/webhook" className="hover:text-ink">Webhook</Link>
          <Link href="/login" className="hover:text-ink">Sign in</Link>
        </span>
      </footer>
    </>
  );
}
