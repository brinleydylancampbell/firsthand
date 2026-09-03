/**
 * The interview, drawn in real DOM rather than screenshotted, so it stays
 * legible at every width and reads as evidence rather than texture. Content
 * is the demo workspace's own seeded conversation and is labelled as such.
 */
export function InterviewFigure() {
  return (
    <figure className="mx-auto w-full max-w-[84rem]">
      <div className="overflow-hidden rounded-3xl border border-line bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-line px-5 py-3 site-meta text-ink-3">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
            Harbour Bookkeeping · Three minutes, in your words
          </span>
          <span className="font-mono">Question 2 of 4</span>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* Conversation */}
          <div className="p-5 sm:p-7 lg:border-r lg:border-line">
            <ol className="space-y-5 border-l border-line pl-5">
              <li>
                <p className="site-meta text-ink-2">What was going on before you found Harbour?</p>
                <p className="mt-1.5 font-heading text-[17px] leading-snug">Doing the books myself on a Sunday night. Glass of wine, spreadsheet, dreading January every year.</p>
              </li>
            </ol>
            <p className="mt-7 font-heading text-xl font-medium leading-snug sm:text-[22px]">
              You mentioned dreading January. What nearly stopped you handing it over?
            </p>
            <div className="mt-4 rounded-xl border border-line-strong/60 bg-card px-4 py-3 font-heading text-[17px] leading-relaxed">
              The price, honestly. It felt like a luxury for a busin
              <span aria-hidden className="ml-px inline-block h-[1.1em] w-px translate-y-[3px] bg-accent motion-safe:animate-pulse" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="site-meta text-ink-3">Enter to send</span>
              <span className="inline-flex h-9 items-center rounded-lg bg-accent px-3.5 text-sm font-medium text-accent-ink">Next</span>
            </div>
          </div>

          {/* Draft */}
          <div className="bg-paper-2/60 p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your testimonial</span>
              <span className="site-meta text-ink-3">Updating…</span>
            </div>
            <p className="mt-3 font-heading text-lg leading-relaxed">
              I was doing the books on a Sunday night with a glass of wine and a spreadsheet, dreading January every year.
              <span className="text-ink-3"> What nearly stopped me was the price, honestly</span>
              <span aria-hidden className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] rounded-full bg-accent/70" />
            </p>
            <p className="mt-4 site-meta text-ink-3">Written from your answers, in your words. You edit or approve it at the end.</p>

            <div className="mt-6 rounded-xl border border-line bg-card p-3.5">
              <p className="text-sm font-medium">How should we show you?</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-accent bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong">Priya Raman · Founder, Lumen Skincare</span>
                <span className="rounded-full border border-line px-3 py-1 text-xs text-ink-2">Priya · Founder</span>
                <span className="rounded-full border border-line px-3 py-1 text-xs text-ink-2">Verified customer</span>
              </div>
              <label className="mt-3 flex items-start gap-2.5 text-xs leading-relaxed text-ink-2">
                <span aria-hidden className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] bg-accent text-accent-ink">
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5.2l2 2 4-4.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                I agree that Harbour Bookkeeping may publish this on their website and in their widgets. I can ask for it to be removed at any time.
              </label>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center site-meta text-ink-3">Demo conversation from the sample workspace. Nothing here is a real customer.</figcaption>
    </figure>
  );
}
