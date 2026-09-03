import Link from "next/link";
import { Logo } from "@/components/logo";

/** Three lines and the quiet exits: source, docs, a real sign-in. */
export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Logo size={24} />
          <p className="mt-2 site-meta text-ink-3">Testimonials in your customers’ own words. Built for The Build Games, September 2026.</p>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 site-meta text-ink-2">
          <li><a href="https://github.com/brinleydylancampbell/firsthand" target="_blank" rel="noreferrer" className="hover:text-ink">Source</a></li>
          <li><Link href="/docs/embed" className="hover:text-ink">Embed</Link></li>
          <li><Link href="/docs/webhook" className="hover:text-ink">Webhook</Link></li>
          <li><Link href="/w/demo" className="hover:text-ink">Demo wall</Link></li>
          <li><Link href="/login" className="hover:text-ink">Sign in to your workspace</Link></li>
        </ul>
      </div>
    </footer>
  );
}
