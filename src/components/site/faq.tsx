import Link from "next/link";

const items: Array<[string, React.ReactNode]> = [
  [
    "Is this AI writing fake reviews?",
    "No. The draft uses only phrases the customer said, tidied. It adds no claims. They read it, change anything they like and approve it before it is sent, and the whole conversation is kept with the testimonial. If you turn the link on, visitors can read it too.",
  ],
  [
    "What if a customer won’t do a chat?",
    "Give them the classic form: name, rating, a text box. It ends with the same consent and identity step, so nothing about the rest of the product changes.",
  ],
  [
    "Can I bring in reviews I already have?",
    "Paste anything: a Google review, a post, an email. The name and text are split out for you, the source is kept, and you confirm it is already public before it goes in.",
  ],
  [
    "Will the embed hurt my Lighthouse score?",
    <>
      No. It is one script of 1.1 KB and one fetch for a fragment rendered on our server. The snippet reserves the height so nothing shifts.{" "}
      <Link href="/embed-test/serif" className="text-accent-strong underline underline-offset-4">Here it is inside a host page.</Link>
    </>,
  ],
  [
    "What happens when I sign in to the demo?",
    "You join a shared workspace, Harbour Bookkeeping, with twelve testimonials and two waiting for review. Everything works: approve, search, build a widget, send a test webhook. It resets overnight. A normal sign-in gives you an empty workspace of your own instead.",
  ],
];

export function Faq() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
      <h2 className="text-3xl font-bold sm:text-4xl">Before you ask.</h2>
      <div className="mt-10 divide-y divide-line border-y border-line">
        {items.map(([q, a]) => (
          <details key={q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-heading text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {q}
              <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden className="shrink-0 text-ink-3 transition-transform duration-300 group-open:rotate-180">
                <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <p className="mt-3 max-w-2xl site-body text-ink-2">{a}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 site-body text-ink-2">
        Something not covered? The source is{" "}
        <a href="https://github.com/brinleydylancampbell/firsthand" target="_blank" rel="noreferrer" className="text-accent-strong underline underline-offset-4">on GitHub</a>.
      </p>
    </section>
  );
}
