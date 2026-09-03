import type Anthropic from "@anthropic-ai/sdk";
import type { Objection } from "./types";
import { OBJECTIONS } from "./types";

/**
 * Every prompt Firsthand sends to Claude lives here so they can be read and
 * tuned in one place. Nothing in the app calls Claude without going through
 * one of these.
 */

/* --------------------------------------------------------------------------
 * Extraction on approve: objection, outcome, tags, highlight
 * ------------------------------------------------------------------------ */

export const extractSystem = `You read one customer testimonial and label it so the owner can find it later.

Return:
- objection: the doubt this testimonial answers best. One of ${OBJECTIONS.join(", ")}. price = cost or value worries. trust = needed proof, reassurance or reliability. time = was busy, needed it fast or wanted less effort. switching = came from another provider or a manual process. fit = unsure it suited their size, sector or situation. If nothing fits, choose the closest.
- outcome: the result the customer claims, in five words or fewer, in plain language. Example: "Closed deals faster". Do not invent a result that is not in the text.
- tags: two or three short lowercase topical tags, one or two words each. Example: ["onboarding", "support", "small team"].
- highlight: the single strongest sentence, copied exactly, character for character, from the testimonial. It must appear verbatim in the text. If the testimonial is one sentence, return that sentence.`;

export function extractMessages(body: string, context?: string): Anthropic.MessageParam[] {
  return [
    {
      role: "user",
      content: `${context ? `Context: ${context}\n\n` : ""}Testimonial:\n\n${body}`,
    },
  ];
}

/* --------------------------------------------------------------------------
 * Plain English search
 * ------------------------------------------------------------------------ */

export const searchSystem = `You help a business owner find the right testimonial for a situation. They describe what they need in plain English. You are given every approved testimonial with its labels.

Return the ids of the best three, best first, each with a one-line reason written for the owner (for example "Mentions the price worry and a small team"). Only return testimonials that genuinely fit. If fewer than three fit, return fewer. If none fit, return an empty list.`;

export type SearchCandidate = {
  id: string;
  body: string;
  objection: Objection | null;
  outcome: string | null;
  tags: string[];
  author_role: string | null;
  author_company: string | null;
};

export function searchMessages(query: string, candidates: SearchCandidate[]): Anthropic.MessageParam[] {
  const list = candidates
    .map(
      (c) =>
        `id: ${c.id}\nobjection: ${c.objection ?? "-"}\noutcome: ${c.outcome ?? "-"}\ntags: ${c.tags.join(", ") || "-"}\nauthor: ${[c.author_role, c.author_company].filter(Boolean).join(", ") || "-"}\ntext: ${c.body}`,
    )
    .join("\n\n---\n\n");
  return [
    {
      role: "user",
      content: `The owner is looking for: ${query}\n\nTestimonials:\n\n${list}`,
    },
  ];
}

/* --------------------------------------------------------------------------
 * Import: parse pasted text
 * ------------------------------------------------------------------------ */

export const importSystem = `You parse a review the owner has pasted from somewhere else: a review site, a social post, an email, a chat message. Split it into the review text and the author details.

Rules:
- body: the review itself, cleaned of UI noise (dates, "helpful" counts, "Read more", handles on their own line). Keep the author's wording. Do not rewrite or shorten it.
- author_name: the person's name if present, otherwise null. Strip handles to a display name if that is all there is.
- author_role and author_company: only if stated. Otherwise null.
- rating: a 1 to 5 number only if stars or a score are present, otherwise null.
- source_label: where this looks like it came from, one of: google, trustpilot, x, linkedin, email, other.`;

export function importMessages(text: string): Anthropic.MessageParam[] {
  return [{ role: "user", content: `Pasted text:\n\n${text}` }];
}

/* --------------------------------------------------------------------------
 * LinkedIn post
 * ------------------------------------------------------------------------ */

export function linkedinSystem(workspaceName: string): string {
  return `You write a short LinkedIn post for ${workspaceName} that shares one customer testimonial.

Format:
- Two short lines of introduction, in ${workspaceName}'s voice, that set up the quote without repeating it. Human, specific, no hype words, no emoji, no hashtags.
- A blank line.
- The testimonial as a quote, in quotation marks, exactly as given.
- A blank line.
- One line crediting the customer using the display name given.

Output only the post.`;
}

export function linkedinMessages(body: string, displayName: string, meta: string | null): Anthropic.MessageParam[] {
  return [
    {
      role: "user",
      content: `Testimonial:\n${body}\n\nCredit as: ${displayName}${meta ? `, ${meta}` : ""}`,
    },
  ];
}
