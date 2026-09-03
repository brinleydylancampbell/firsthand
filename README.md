# Firsthand

Testimonials collected by interview, in your customers' own words. Consent and provenance built in. A wall and an embed that never slow your site down.

Built for The Build Games, September 2026, as a replacement for Senja and Testimonial.to for a solo founder or small business.

**Demo:** the public URL is in the repo description. No login needed for the wall, the forms or the embed test pages. "Sign in to the demo dashboard" takes any email and magic-links you into a real, shared sandbox that resets nightly.

## What it replaces

| You used to | Now |
|---|---|
| Send a form with a blank box and get "great service, thanks" | Send a link to a three minute interview. Each question follows from the last answer. The testimonial is drafted from their words while they watch, and they approve it. |
| Ask for permission months later, or not at all | Every form ends with consent, a timestamp, and a one-tap identity choice: full name, first name and role, or anonymous. Nothing without consent can be approved. The database enforces it. |
| Remember to ask, weeks late | Your order or job system posts one line of JSON when something is delivered. Firsthand asks N days later. Nothing sends until you have previewed the email and gone live. |
| Scroll 80 testimonials looking for the pricing one | On approve, each one is labelled with the doubt it answers, the outcome and tags. Filter chips, targeted widgets, and a plain English search that returns the best three. |
| Hope people believe a quote and a headshot | Every testimonial keeps its origin. Turn on a link and visitors read the real interview or see the import source. |
| Paste a script that tanks your Lighthouse score | A 1.1 KB script, one div, no iframe. Inherits your font. The snippet reserves the exact height per breakpoint so nothing shifts. |

## What is in

- Interview mode with a live draft panel, editable script per form, optional voice input
- Classic form with the same consent and identity step
- Paste import from Google, Trustpilot, X, LinkedIn or email, source kept for provenance
- One testimonials list with a Waiting tab, keyboard shortcuts (J, K, A, H, F, E) and optimistic updates
- Automatic labels on approve: objection, outcome, tags, highlight sentence
- Plain English search over the approved set
- Wall of love with filter chips, dark mode, public "how this was collected" pages
- Four widget types (wall, carousel, single rotating quote, avatar badge), a builder with live preview, and the snippet
- `embed.js` under 5 KB with a CI size gate, server rendered fragments cached at the edge, daily rolled-up view counts
- Ask at the right moment: generic webhook, draft-then-live, exact email preview, test event button, Zapier and Make instructions
- Quote cards in three sizes and a drafted LinkedIn post
- Demo workspace seeded with twelve testimonials, three forms, two widgets, reset nightly

## What is deliberately out

Video testimonials, teams and roles, billing, custom domains, white labelling, mobile app, A/B testing of forms, analytics beyond widget views, anything with the word "enterprise". One person can run this.

## The deal

No seat limits. No view caps. No usage fees. No tracking on your visitors beyond a daily view count. Nothing sends without your say-so. Nothing is public without the customer's consent.

## Self host in five steps

1. **Supabase.** Create a project. In the SQL editor run `supabase/migrations/20260903000001_init.sql`, or `npx supabase link` then `npx supabase db push`. Under Authentication, add `https://your-domain/auth/callback` to the redirect URLs. Optional but recommended: set Resend as the custom SMTP sender so magic links come from your domain.
2. **Keys.** Copy `.env.example` to `.env.local` and fill in Supabase, Anthropic, Resend, `NEXT_PUBLIC_APP_URL`, and a random `CRON_SECRET`.
3. **Install and seed.** `npm install`, then `node --env-file=.env.local scripts/seed.mjs` to create the demo workspace (skip this if you do not want a demo).
4. **Run.** `npm run dev` and open `http://localhost:3000`. Sign in with your email; a workspace is created for you.
5. **Deploy.** Push to GitHub, import into Vercel, add the same environment variables. `vercel.ts` registers the two crons (send due asks every 15 minutes, reset the demo nightly). Vercel sends `CRON_SECRET` automatically.

The model is set by `ANTHROPIC_MODEL`. Swap it without touching code.

## How the embed stays fast

- `src/embed/embed.js` is plain ES2017, minified to `public/embed.js` by `npm run build:embed`. CI fails if it passes 5 KB.
- Each widget is one fetch to `/api/widget/:id`, an HTML fragment rendered on the server and cached at the edge (`s-maxage=60, stale-while-revalidate=86400`).
- Cards are fixed height and grids have a fixed column count per breakpoint, so the builder computes the exact height and puts it in the snippet as a style rule. Zero layout shift, measured by Playwright in three host pages with different fonts, one dark, one mobile.
- Styles are scoped under `.fh-` classes, use `font: inherit`, and read `--fh-accent`, `--fh-radius`, `--fh-text`, `--fh-card`, `--fh-line`.
- One `sendBeacon` per load, rolled up per day. No cookies, no fingerprinting, nothing about the visitor.

## Lighthouse

Run against a deployment:

```
npx lighthouse https://your-domain/w/demo --only-categories=performance,accessibility,best-practices,seo --preset=desktop --quiet --chrome-flags="--headless"
npx lighthouse https://your-domain/embed-test/serif --only-categories=performance --preset=desktop --quiet --chrome-flags="--headless"
```

Latest scores are recorded below and on the landing page.

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| `/` landing | 100 | 100 | 100 | 100 |
| `/w/demo` wall of love | 100 | 100 | 100 | 100 |
| `/embed-test/serif` embed host, widgets loaded | 100 | 100 | 100 | 63 (page is `noindex`, by design) |

Measured 3 Sept 2026 against a local production build (`next build && next start`), desktop preset, Chrome headless. Cumulative layout shift was 0 on all three, largest contentful paint 0.6 s, total blocking time 0 ms. The embed host page is `noindex`, which is the only point it loses.

## Tests

```
npm run typecheck     # next typegen + tsc
npm run lint
npm run build:embed && npm run check:embed
npm run test:e2e      # Playwright against a seeded local dev server
```

The e2e suite covers: classic form to pending with the identity choice applied, wall filter chips and dark mode, provenance page, embed rendering in three hosts with layout shift under 0.02 and inherited fonts, widget fragments never leaking pending or hidden testimonials, webhook auth, an interview turn when a model key is present, and (with the local mail catcher) magic link sign in for both the demo sandbox and a fresh workspace, keyboard approve to the wall, the share panel, the widget builder and a webhook test event.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind v4, Supabase (Postgres, Auth, Storage), Anthropic API, Resend, Vercel. No component library. Inter Tight for headings and quotes, Inter for body, IBM Plex Mono for data.

## Layout

```
src/app/f/[ws]/[form]        public forms (interview or classic) and the thank-you page
src/app/w/[ws]               wall of love, /t/[id] provenance
src/app/app                  dashboard: testimonials (waiting, approved, hidden), collect, show, settings
src/components/site          the landing page, one section per file
src/app/api/interview        streaming question and draft routes
src/app/api/widget           embed fragments and the view beacon
src/app/api/hooks/[ws]       the ask webhook
src/app/api/cron             send-asks, reset-demo
src/app/api/og               quote cards and link previews
src/lib/prompts.ts           every prompt the app sends to Claude
src/lib/seed.ts              the demo workspace
src/embed/embed.js           the embed script source
supabase/migrations          schema, RLS, the consent constraint
tests/                       Playwright
```

## Research this came from

Roughly forty threads across r/SaaS, r/Entrepreneur, r/smallbusiness and r/marketing, the one to three star reviews of the largest Shopify review apps, and Product Hunt reviews of Senja. In order of how often they came up: the blank box problem, slow and shifting embeds, not being able to find the right testimonial later, asking too late, apps emailing whole lists without approval, fake testimonials eroding trust, permission never captured, pricing creep, widgets breaking on theme change, painful import, support going silent. Nobody asked for voice or video.

## Licence

MIT.
