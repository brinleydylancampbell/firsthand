import Link from "next/link";

/**
 * The most cited failure in the research was the embed. This is the one
 * place the page uses measured numbers, and they are real: production build,
 * desktop preset, 3 September 2026.
 */
export function EmbedProof() {
  return (
    <section className="bg-paper-2/60">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">It will not slow your site down.</h2>
          <p className="mt-4 site-lede text-ink-2">People gave up on social proof because the widget tanked their score and shifted their page. This one does neither.</p>
          <p className="mt-5 site-body text-ink-2">
            The script is <span className="font-mono text-ink">1.1 KB</span>. The snippet reserves the exact height for each breakpoint before anything loads, so the page beneath never moves: layout shift measured
            at <span className="font-mono text-ink">0</span> in three host pages with different fonts, one dark, one on a phone. The wall of love scores <span className="font-mono text-ink">100</span> in every Lighthouse category.
            No iframe. Your font is inherited.
          </p>
          <p className="mt-5 site-body text-ink-2">
            <Link href="/embed-test/serif" className="font-medium text-accent-strong underline underline-offset-4">See it inside a host page</Link>
            {" "}or{" "}
            <Link href="/docs/embed" className="font-medium text-accent-strong underline underline-offset-4">read how it works</Link>.
          </p>
        </div>

        <figure className="rounded-3xl border border-line bg-card p-4 shadow-card sm:p-5">
          <div className="flex items-center gap-1.5 px-1 pb-3">
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong/40" />
            <span className="ml-3 h-5 flex-1 rounded-md bg-paper-2 font-mono text-[10px] leading-5 text-ink-3 pl-2">yourcompany.com/pricing</span>
          </div>
          <div className="rounded-2xl border border-line p-5" style={{ fontFamily: "Georgia, serif" }}>
            <div className="h-3 w-1/2 rounded bg-ink/80" />
            <div className="mt-2 h-2.5 w-11/12 rounded bg-ink/15" />
            <div className="mt-1.5 h-2.5 w-4/5 rounded bg-ink/15" />
            <div className="relative mt-5 rounded-xl border border-dashed border-accent/60 p-3">
              <span className="absolute -top-2.5 right-3 rounded-full bg-card px-2 font-mono text-[10px] text-accent-strong">min-height reserved</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  ["Tom Okafor", "It took one call."],
                  ["Hannah Lindqvist", "Two quarters in, zero surprises."],
                ].map(([n, q]) => (
                  <div key={n} className="rounded-lg border border-line bg-card p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-accent-soft" />
                      <span className="text-xs font-semibold" style={{ fontFamily: "inherit" }}>{n}</span>
                      <span className="ml-auto text-[10px] text-accent">★★★★★</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-ink-2" style={{ fontFamily: "inherit" }}>“{q}”</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 h-2.5 w-3/4 rounded bg-ink/15" />
            <div className="mt-1.5 h-2.5 w-2/3 rounded bg-ink/15" />
          </div>
          <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 site-meta text-ink-3">
            <span>A serif host page. The widget inherits it.</span>
            <span className="font-mono">embed.js 1.1 KB · CLS 0 · Lighthouse 100</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
