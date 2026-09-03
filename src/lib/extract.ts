import { z } from "zod";
import { generateObject } from "./ai";
import { extractMessages, extractSystem } from "./prompts";
import { OBJECTIONS, type Objection } from "./types";

const ExtractSchema = z.object({
  objection: z.enum(["price", "trust", "time", "switching", "fit"]),
  outcome: z.string(),
  tags: z.array(z.string()),
  highlight: z.string(),
});

export type Labels = {
  objection: Objection;
  outcome: string;
  tags: string[];
  highlight: string | null;
};

/**
 * Labels a testimonial on approve. The highlight is only kept when it really
 * is a verbatim slice of the body, so the wall never bolds invented text.
 */
export async function extractLabels(body: string, context?: string): Promise<Labels> {
  const out = await generateObject({
    schema: ExtractSchema,
    system: extractSystem,
    messages: extractMessages(body, context),
    maxTokens: 400,
  });

  const objection = OBJECTIONS.includes(out.objection) ? out.objection : "trust";
  const outcome = out.outcome.trim().split(/\s+/).slice(0, 5).join(" ");
  const tags = Array.from(
    new Set(
      out.tags
        .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9 \-]/g, ""))
        .filter((t) => t.length > 1 && t.length <= 24),
    ),
  ).slice(0, 3);
  const candidate = out.highlight.trim();
  const highlight = candidate && body.includes(candidate) ? candidate : null;

  return { objection, outcome, tags, highlight };
}
