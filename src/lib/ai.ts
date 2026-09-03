import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

/**
 * One place to talk to Claude. The model is an environment variable so it can
 * be swapped without a code change. Thinking is left at the model default;
 * effort is tuned per call so chat turns stay quick.
 */
export const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-fable-5-1";

type Effort = "low" | "medium" | "high";

let client: Anthropic | null = null;
export function ai(): Anthropic {
  client ??= new Anthropic();
  return client;
}

export class AiRefusedError extends Error {
  constructor() {
    super("The model declined this request.");
    this.name = "AiRefusedError";
  }
}

type TextArgs = {
  system: string;
  messages: Anthropic.MessageParam[];
  maxTokens?: number;
  effort?: Effort;
};

/** Plain text completion. */
export async function generateText({
  system,
  messages,
  maxTokens = 1024,
  effort = "low",
}: TextArgs): Promise<string> {
  const res = await ai().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
    output_config: { effort },
  });
  if (res.stop_reason === "refusal") throw new AiRefusedError();
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

/**
 * Streams text deltas as a plain UTF-8 body. The UI reads it with a
 * TextDecoder; nothing else is on the wire.
 */
export function streamText({
  system,
  messages,
  maxTokens = 1024,
  effort = "low",
}: TextArgs): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const stream = ai().messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
    output_config: { effort },
  });

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") throw new AiRefusedError();
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
    cancel() {
      stream.abort();
    },
  });
}

type ObjectArgs<T extends z.ZodTypeAny> = TextArgs & { schema: T };

/** Structured output validated against a Zod schema. */
export async function generateObject<T extends z.ZodTypeAny>({
  schema,
  system,
  messages,
  maxTokens = 2048,
  effort = "low",
}: ObjectArgs<T>): Promise<z.infer<T>> {
  const res = await ai().messages.parse({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
    output_config: { effort, format: zodOutputFormat(schema) },
  });
  if (res.stop_reason === "refusal") throw new AiRefusedError();
  if (res.parsed_output == null) {
    throw new Error("The model returned something that did not match the schema.");
  }
  return res.parsed_output as z.infer<T>;
}
