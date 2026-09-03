import type Anthropic from "@anthropic-ai/sdk";
import type { InterviewTurn, Objection } from "./types";
import { OBJECTIONS } from "./types";

/**
 * Every prompt Firsthand sends to Claude lives here so they can be read and
 * tuned in one place. Nothing in the app calls Claude without going through
 * one of these.
 */

function transcriptText(turns: InterviewTurn[]): string {
  return turns
    .map((t) => `${t.role === "interviewer" ? "Interviewer" : "Customer"}: ${t.text.trim()}`)
    .join("\n\n");
}

/* --------------------------------------------------------------------------
 * Interview: the next question
 * ------------------------------------------------------------------------ */

export function interviewSystem(workspaceName: string, script: string[]): string {
  return `You are interviewing a customer of ${workspaceName}, on ${workspaceName}'s behalf, to gather a testimonial in the customer's own words.

The script below is a guide to the ground to cover, in order. You will be told which topic is next.

Script:
${script.map((q, i) => `${i + 1}. ${q}`).join("\n")}

How to ask:
- One question at a time. Two lines at most. Plain, warm, specific.
- Build each question on what the customer just said. Pick up a phrase they used, then move to the next topic so it feels like one conversation, not a form.
- Never lead. Do not suggest an answer, do not put words in their mouth, do not praise ${workspaceName} or hint at the answer you hope for.
- Match their register. If they write casually, you do. If they are brief, you are brief.
- If they have already covered the next topic, ask for one concrete detail about it instead of repeating it.
- Do not thank them at length, do not summarise their answer back to them, do not add filler.

Output only the question. No preamble, no quotation marks.`;
}

export function interviewMessages(
  turns: InterviewTurn[],
  nextTopic: string,
  index: number,
  total: number,
): Anthropic.MessageParam[] {
  const history = turns.length ? transcriptText(turns) : "(nothing yet)";
  return [
    {
      role: "user",
      content: `Conversation so far:\n\n${history}\n\nNext topic (${index + 1} of ${total}): ${nextTopic}\n\nAsk the next question.`,
    },
  ];
}

/* --------------------------------------------------------------------------
 * Interview: the draft testimonial, running and final
 * ------------------------------------------------------------------------ */

export function draftSystem(workspaceName: string, running: boolean): string {
  return `You turn interview answers into a short testimonial for ${workspaceName}, written in the first person as the customer.

Rules:
- Use only words, phrases and facts the customer actually said. You may tidy grammar and join fragments. You may not add claims, adjectives, numbers or outcomes they did not state.
- Keep their voice. If they were blunt, stay blunt. If they were casual, stay casual.
- 40 to 80 words when there is enough material. With little material, write less rather than inventing.${
    running
      ? "\n- This is a running draft from a conversation still in progress. Use what is there so far. It is fine for it to feel unfinished."
      : ""
  }
- No quotation marks, no sign-off, no name, no headline, no praise for ${workspaceName} the customer did not give.

Output only the testimonial text.`;
}

export function draftMessages(turns: InterviewTurn[]): Anthropic.MessageParam[] {
  return [
    {
      role: "user",
      content: `Interview transcript:\n\n${transcriptText(turns)}\n\nWrite the testimonial.`,
    },
  ];
}

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
