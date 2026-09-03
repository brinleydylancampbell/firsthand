const rows: Array<[string, string]> = [
  ["Consent", "Nothing is public until the customer agrees, with a timestamp and the name they chose. The database refuses to approve without it."],
  ["Sending", "Nothing sends until you have read the exact email and switched to live. Connecting a system never triggers a message on its own."],
  ["Tracking", "One view count per widget per day. No cookies, no fingerprinting, nothing about your visitors."],
  ["Limits", "No seat limits, no view caps, no usage fees. One person can run it."],
  ["Source", "MIT licensed on GitHub. Self host in five steps, or use the hosted demo."],
];

/** Spec sheet, term and definition. Facts, not features. */
export function Deal() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <h2 className="text-3xl font-bold sm:text-4xl">The deal.</h2>
      <p className="mt-4 max-w-2xl site-lede text-ink-2">The things the research said people got burned by, written down.</p>
      <dl className="mt-12 divide-y divide-line border-y border-line">
        {rows.map(([term, def]) => (
          <div key={term} className="grid gap-2 py-5 sm:grid-cols-[220px_1fr] sm:gap-8">
            <dt className="font-heading text-lg font-semibold">{term}</dt>
            <dd className="site-body text-ink-2">{def}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
