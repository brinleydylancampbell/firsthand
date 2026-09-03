const items = [
  {
    title: "Customers finish",
    body: "Four questions, one at a time, each following from the last answer. The testimonial drafts itself from their words while they watch. Nobody stares at a box.",
  },
  {
    title: "You find the right one",
    body: "Every approved testimonial is labelled with the doubt it answers. Ask in plain English before a call and get the best three.",
  },
  {
    title: "Visitors believe it",
    body: "Consent, the chosen name and the real conversation are kept. Turn on a link and anyone can see exactly how it was collected.",
  },
];

/** Three outcomes, hairline and heading. No icons, no cards. */
export function Outcomes() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <h2 className="text-3xl font-bold sm:text-4xl">Less chasing. Better quotes.</h2>
      <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
        {items.map((it) => (
          <div key={it.title} className="border-t border-line-strong/40 pt-5">
            <h3 className="font-heading text-lg font-semibold">{it.title}</h3>
            <p className="mt-2 site-body text-ink-2">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
