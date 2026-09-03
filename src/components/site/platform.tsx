import { Arcs } from "./arcs";

/**
 * The ink band. Five things the product does, each as a heading, two lines
 * and a small drawn diagram. Three across, then two wider.
 */
export function Platform() {
  return (
    <section className="relative overflow-hidden bg-band text-white">
      <Arcs className="pointer-events-none absolute -right-40 top-1/2 h-[720px] w-[720px] -translate-y-1/2 text-white/[0.07]" />
      <div className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28 2xl:max-w-[88rem]">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">From conversation to your website.</h2>
          <p className="mt-4 site-lede text-white/65">Set up a form once. Everything downstream is already right.</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-6 xl:gap-6">
          <Card span={2} title="Drafted from their words" body="Only phrases the customer used. No added claims. They edit or approve before it is sent.">
            <DraftDiagram />
          </Card>
          <Card span={2} title="Consent where it is collected" body="A timestamp, a chosen name, a plain sentence about where it appears. Nothing without consent can be approved.">
            <ConsentDiagram />
          </Card>
          <Card span={2} title="Found in seconds" body="Each one is labelled with the doubt it answers. Search in plain English and get the best three.">
            <SearchDiagram />
          </Card>
          <Card span={3} title="Ask at the right moment" body="Your order system posts one line when a job is done. You read the exact email and flip it live. Nothing sends before that.">
            <AskDiagram />
          </Card>
          <Card span={3} title="A wall and an embed that never shift" body="One script under 5 KB. Height reserved before it loads. Your font, your colours, no iframe.">
            <EmbedDiagram />
          </Card>
        </div>
      </div>
    </section>
  );
}

function Card({ span, title, body, children }: { span: 2 | 3; title: string; body: string; children: React.ReactNode }) {
  return (
    <article
      className={`flex flex-col rounded-2xl bg-band-2/70 p-6 ring-1 ring-white/10 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgb(0_0_0/0.8)] ${span === 2 ? "sm:col-span-3 xl:col-span-2" : "sm:col-span-3"}`}
    >
      <h3 className="font-heading text-lg font-semibold xl:text-xl">{title}</h3>
      <p className="mt-2 site-body text-white/65">{body}</p>
      <div className="mt-6 flex-1">{children}</div>
    </article>
  );
}

/* Diagrams: hairlines, mono labels and one accent. */

function DraftDiagram() {
  return (
    <div className="space-y-3 text-xs">
      <div className="space-y-2">
        {["Doing the books on a Sunday night…", "The price, honestly…", "The numbers are just done."].map((l) => (
          <div key={l} className="truncate rounded-lg border border-white/10 px-2.5 py-1.5 text-white/70">{l}</div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-white/40">
        <svg width="16" height="20" viewBox="0 0 16 20" aria-hidden><path d="M8 2v14m-6-6 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="font-mono text-[10px]">drafted from these, nothing added</span>
      </div>
      <div className="rounded-lg border border-accent/40 bg-accent/10 p-3 font-heading text-[13px] leading-snug text-white">
        “Before Harbour I was doing the books on a Sunday night… Now the numbers are just done.”
      </div>
    </div>
  );
}

function ConsentDiagram() {
  return (
    <div className="space-y-2 text-xs">
      {[
        ["Priya Raman · Founder, Lumen Skincare", true],
        ["Priya · Founder", false],
        ["Verified customer", false],
      ].map(([label, on]) => (
        <div key={label as string} className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 ${on ? "border-accent bg-accent/15 text-white" : "border-white/10 text-white/60"}`}>
          <span>{label as string}</span>
          <span aria-hidden className={`h-3 w-3 rounded-full border ${on ? "border-accent bg-accent" : "border-white/30"}`} />
        </div>
      ))}
      <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-white/50">
        <span>consent_at 2026-08-30 09:14</span>
        <span className="text-accent">approved ✓</span>
      </div>
    </div>
  );
}

function SearchDiagram() {
  return (
    <div className="text-xs">
      <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-white/80">
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden className="text-white/50"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        one about price, from a small team
      </div>
      <ol className="mt-3 space-y-1.5">
        {[
          ["Priya Raman", "Worried about price"],
          ["Sophie Marsh", "Raised prices with confidence"],
          ["Marcus Bell", "Two-man workshop"],
        ].map(([who, why], i) => (
          <li key={who} className="flex items-center gap-2 text-white/70">
            <span className="font-mono text-[10px] text-white/40">{i + 1}</span>
            <span className="text-white">{who}</span>
            <span className="ml-auto rounded-full bg-accent/15 px-2 py-0.5 text-[10px] text-accent">{why}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AskDiagram() {
  return (
    <div className="grid items-center gap-3 text-xs sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
      <div className="rounded-lg border border-white/10 bg-black/20 p-3 font-mono text-[11px] leading-relaxed text-white/70">
        {"{ email, name,"}<br />{"  order_ref,"}<br />{"  delivered_at }"}
      </div>
      <Arrow label="+ 2 days" />
      <div className="rounded-lg border border-white/10 p-3 text-white/80">
        <div className="font-medium text-white">How did it go?</div>
        <div className="mt-1 text-white/60">Hi Sam, would you spare three minutes…</div>
      </div>
      <Arrow label="you flip it" />
      <div className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2.5">
        <span className="text-white/70">Draft mode</span>
        <span aria-hidden className="relative h-5 w-9 rounded-full bg-white/15"><span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white/70" /></span>
      </div>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-white/40">
      <svg width="28" height="16" viewBox="0 0 28 16" aria-hidden className="rotate-90 sm:rotate-0"><path d="M2 8h22m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <span className="font-mono text-[10px]">{label}</span>
    </div>
  );
}

function EmbedDiagram() {
  return (
    <div className="grid gap-3 text-xs sm:grid-cols-[1fr_1fr]">
      <pre className="overflow-hidden rounded-lg border border-white/10 bg-black/20 p-3 font-mono text-[11px] leading-relaxed text-white/70">{`<div data-firsthand="…"
     style="min-height:412px">
</div>
<script src="/embed.js" async>`}</pre>
      <div className="rounded-lg border border-white/10 p-3">
        <div className="h-2 w-2/3 rounded bg-white/15" />
        <div className="mt-1.5 h-2 w-1/2 rounded bg-white/10" />
        <div className="mt-3 flex h-[76px] items-center justify-center rounded-md border border-dashed border-accent/60 font-mono text-[10px] text-accent">412px reserved · CLS 0</div>
        <div className="mt-3 h-2 w-3/4 rounded bg-white/10" />
      </div>
    </div>
  );
}
