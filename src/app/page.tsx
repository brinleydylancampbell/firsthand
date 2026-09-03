import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";

const demo = process.env.DEMO_WORKSPACE_SLUG ?? "demo";

export const metadata: Metadata = {
  title: "Firsthand · Testimonials collected by interview",
  description:
    "A short conversation instead of a blank box. Consent and provenance built in. A wall and an embed that never slow your site down. Replaces Senja and Testimonial.to for a solo founder or small business.",
  openGraph: { images: [`/api/og/wall/${demo}`] },
};

const problems = [
  {
    heard: "“Customers freeze at the blank box and write ‘great service, thanks’.”",
    built: "Interview mode",
    how: "Three or four questions, each one following from the last answer. The testimonial is drafted from their own words while they watch, and they approve it before anything is sent.",
    href: `/f/${demo}/interview`,
    cta: "Try the interview",
  },
  {
    heard: "“The widget tanked my Lighthouse score and shifted my whole page.”",
    built: "A 1 KB embed",
    how: "One script tag and a div. No iframe. Inherits your font. The snippet reserves the exact height per breakpoint, so nothing moves. Server rendered, cached at the edge.",
    href: "/embed-test/serif",
    cta: "See it in a host page",
  },
  {
    heard: "“I have 80 testimonials and spend 20 minutes before every call finding one.”",
    built: "Find the right one",
    how: "On approve, each testimonial is labelled with the doubt it answers, the outcome, and tags. Filter chips on the wall, targeted widgets for the pricing page, and a search box that takes plain English.",
    href: "/demo/login",
    cta: "Search the demo",
  },
  {
    heard: "“The app emailed my entire customer list the day I installed it.”",
    built: "Ask at the right moment, in draft first",
    how: "Your order system posts one line of JSON when something is delivered. Asks queue up. You see the exact email and the first recipients, then flip it live. Nothing sends on connect.",
    href: "/docs/webhook",
    cta: "Read the webhook docs",
  },
  {
    heard: "“Nobody believes testimonials any more. Stock photo, fake name.”",
    built: "Provenance you can show",
    how: "Every testimonial keeps its origin: the real interview transcript, the import source, the order it followed. Turn on a link and visitors can read the actual questions and answers.",
    href: `/w/${demo}`,
    cta: "See how one was collected",
  },
  {
    heard: "“Lovely email, but I never asked if I could use it publicly.”",
    built: "Consent and identity, every time",
    how: "The last step of every form: consent to publish with a timestamp, a one-tap choice of full name, first name, or anonymous, and a plain sentence about where it will appear. Nothing without consent can be approved. The database enforces it.",
    href: `/f/${demo}/quick`,
    cta: "See the consent step",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Logo size={30} priority />
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/docs/embed" className="text-ink-2 hover:text-ink">Embed</Link>
          <Link href="/docs/webhook" className="text-ink-2 hover:text-ink">Webhook</Link>
          <a href="https://github.com/brinleydylancampbell/firsthand" className="text-ink-2 hover:text-ink" rel="noreferrer" target="_blank">Source</a>
          <Link href="/login" className="text-ink-2 hover:text-ink">Sign in</Link>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-5xl px-6 pt-16 pb-20">
        <h1 className="max-w-3xl text-2xl font-semibold tracking-tight sm:text-[2.75rem] sm:leading-[1.1]">
          Testimonials collected by interview, in your customers’ own words.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-2">
          A short conversation instead of a blank box. Consent and provenance built in. A wall and an embed that never slow your site down. Built to replace Senja and Testimonial.to for one founder or a small team.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href={`/f/${demo}/interview`} size="lg">Try the interview</ButtonLink>
          <ButtonLink href={`/w/${demo}`} size="lg" variant="secondary">See a wall of love</ButtonLink>
          <ButtonLink href="/demo/login" size="lg" variant="ghost">Sign in to the demo dashboard</ButtonLink>
        </div>
        <p className="mt-4 text-sm text-ink-3">The demo is a real workspace with twelve testimonials. Any email gets you in. It resets every night.</p>
      </section>

      <section className="border-t border-line bg-paper-2/40">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <p className="eyebrow">What people said, and what we built</p>
          <p className="mt-2 max-w-2xl text-ink-2">
            From roughly forty threads on Reddit, the one to three star reviews of the big Shopify review apps, and Product Hunt. The complaints repeated. So do the answers.
          </p>
          <div className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-2">
            {problems.map((p) => (
              <article key={p.built}>
                <p className="font-serif text-lg italic leading-relaxed text-ink-2">{p.heard}</p>
                <h2 className="mt-4 text-lg font-semibold">{p.built}</h2>
                <p className="mt-2 text-ink-2">{p.how}</p>
                <Link href={p.href} className="mt-3 inline-block text-sm font-medium underline underline-offset-4 hover:text-accent">
                  {p.cta} →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="eyebrow">Also in the box</p>
            <ul className="mt-4 space-y-2 text-ink-2">
              <li>Classic form, for when a chat is too much.</li>
              <li>Paste import from Google, Trustpilot, X, or an email. Source kept.</li>
              <li>Wall of love with filter chips and dark mode.</li>
              <li>Four widget types: wall, carousel, single rotating quote, avatar badge.</li>
              <li>Quote cards in three sizes, and a LinkedIn post drafted for you.</li>
              <li>Highlight extraction: the strongest sentence, bold or on its own.</li>
              <li>Daily view counts per widget. That is the only analytics.</li>
              <li>Keyboard inbox: J, K, A, H, F.</li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">The deal</p>
            <ul className="mt-4 space-y-2 text-ink-2">
              <li>No seat limits. No view caps. No usage fees.</li>
              <li>No tracking on your visitors beyond a daily view count.</li>
              <li>Nothing sends without your say-so.</li>
              <li>Nothing is public without the customer’s consent.</li>
              <li>Open source. Self host in five steps.</li>
            </ul>
            <p className="mt-6 text-sm text-ink-3">
              Deliberately not here: video testimonials, teams and roles, billing, custom domains, white labelling, A/B tests. One person can run this.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <p className="eyebrow">Speed, measured</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            <Stat value="1.1 KB" label="embed.js, minified" />
            <Stat value="0.00" label="cumulative layout shift in three host pages" />
            <Stat value={<LighthouseScore />} label="Lighthouse performance, wall of love" />
          </div>
          <p className="mt-4 text-sm text-ink-3">
            Scores from the latest run are in the README, with the command to reproduce them. The <Link href="/embed-test" className="underline underline-offset-2">embed test pages</Link> are public.
          </p>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-ink-3">
          <span className="inline-flex items-center gap-2"><Logo size={20} wordmark={false} href={null} /> Firsthand. Built for The Build Games, September 2026.</span>
          <a href="https://github.com/brinleydylancampbell/firsthand" rel="noreferrer" target="_blank" className="underline underline-offset-2 hover:text-ink">
            github.com/brinleydylancampbell/firsthand
          </a>
        </div>
      </footer>
    </main>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-sm border border-line p-5">
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-ink-2">{label}</p>
    </div>
  );
}

function LighthouseScore() {
  // Measured 3 Sept 2026 on a production build, desktop preset. Command and full table in the README.
  return <>{process.env.NEXT_PUBLIC_LIGHTHOUSE_WALL ?? "100"}</>;
}
