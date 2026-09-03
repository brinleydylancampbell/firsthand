# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Owner:** a solo founder or a small business owner (one to ten people) who needs social proof for a website and sales conversations, has no marketing hire, and currently keeps praise in email folders or a spreadsheet. Uses the dashboard for a few minutes at a time, usually to approve what came in or to find a quote before a call.
- **Customer:** the owner's client, opening a link on their phone or laptop after a job or order. Wants to help, has two minutes, freezes at a blank box.
- **Visitor:** someone on the owner's site reading the wall or a widget, deciding whether to trust the business.
- **Judge (temporary, September 2026):** a Build Games judge with a few minutes, who must understand the product, try the interview and reach a working dashboard without asking anyone.

## Product Purpose

Firsthand collects testimonials by short interview rather than a blank form, drafts the testimonial from the customer's own words for them to approve, captures consent and identity at the point of collection, keeps the full provenance, and publishes to a wall and a fast embed. It replaces Senja and Testimonial.to for one person. Success is: customers finish, owners can find the right quote in seconds, visitors believe what they read, and nothing goes public without consent.

## Positioning

The testimonial is written from a real conversation, in the customer's words, and the conversation itself can be shown. Consent is enforced by the database, not a checkbox habit. Asks go out only after the owner has previewed the exact email and gone live. The embed is one script under 5 KB with its height reserved before it loads. Competitors offer verified badges, forms and iframes; none can show the transcript or promise zero layout shift.

## Operating Context

- Owner shares a form link (interview or classic) or connects an order system by webhook so asks go out a few days after delivery.
- Customer answers three or four questions; a draft assembles as they answer; they edit or approve, choose how they are shown (full name, first name and role, anonymous) and consent.
- Owner reviews an inbox, approves with keyboard shortcuts, gets automatic labels (the doubt answered, the outcome, tags, a highlight sentence), searches in plain English, reorders, shares quote cards and a drafted LinkedIn post.
- Public wall at `/w/{workspace}`, widgets via `embed.js`, provenance pages at `/w/{workspace}/t/{id}`.
- Demo workspace "Harbour Bookkeeping" (`demo`) is shared, seeded with twelve synthetic testimonials, reset nightly.
- Stack: Next.js 16 App Router, TypeScript, Tailwind v4, Supabase, Anthropic API, Resend, Vercel.

## Capabilities and Constraints

- In: interview mode with live draft, classic form, paste import, consent and identity step, inbox with shortcuts, labels and plain English search, wall with filter chips and dark mode, four widget types and a builder, embed under 5 KB with reserved height, webhook asks in draft-then-live mode, quote cards in three sizes, LinkedIn draft, provenance pages, demo sandbox.
- Out, deliberately: video testimonials, teams and roles, billing, custom domains, white labelling, mobile app, A/B testing, analytics beyond daily widget views, anything called "enterprise".
- Never mention or integrate specific third-party vendors beyond the stack; the webhook is generic (Zapier and Make appear only as examples of a POST).
- Model is configurable by environment variable; the interview depends on a model key being present.
- Terminology: testimonial (not review), workspace, form, ask, widget, wall of love, provenance, consent.

## Brand Commitments

- Name: **Firsthand**. Mark: the purple hand with two speech arcs, `public/logo.png` (transparent). Favicon derived from it.
- Accent: the mark's purple, `#7858d8`. Workspaces can set their own accent for their public pages.
- Voice: plain, direct, sentence case, second person to the owner, no hype words, no emoji. Numbers only when product-specific.
- Sibling product: the user's other product, SubbyFlow (`C:\appwebdev\personal\subbyflow-site`), is the reference for how simple Firsthand should be to navigate and think about: one page, one action, no navigation menu, one structural shape per section, one accent with a hard rule, drawn figures instead of screenshots. The user has said this applies to the landing page and to navigation across the app.

## Evidence on Hand

- Research summary (3 Sept 2026): roughly forty Reddit threads, low-star Shopify review-app reviews, Product Hunt reviews of Senja. Ranked complaints are in README.md.
- Lighthouse on a production build (3 Sept 2026): landing and wall 100/100/100/100; embed host 100/100/100 with SEO 63 by design. Playwright suite of 18 passing tests.
- Demo content is synthetic and labelled as a demo workspace. **There are no real customer testimonials for Firsthand itself. Do not invent any, nor customer counts, logos or press.**
- No pricing has been set. No production URL yet.

## Product Principles

1. The customer's words, never ours. Drafts quote; they do not embellish.
2. Nothing public without consent, nothing sent without the owner's say-so. Enforced, not promised.
3. Prove, don't claim: show the conversation, the transcript, the reserved height, the score.
4. One person can run it: fewer screens, plainer labels, defaults that are already right.
5. Fast on the host's site is part of the product, not an optimisation.
