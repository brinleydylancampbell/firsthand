import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { streamText } from "@/lib/ai";
import { draftMessages, draftSystem } from "@/lib/prompts";
import { DEFAULT_QUESTIONS } from "@/lib/types";

const Body = z.object({
  ws: z.string().min(1),
  form: z.string().min(1),
  turns: z
    .array(z.object({ role: z.enum(["interviewer", "customer"]), text: z.string().max(4000) }))
    .max(24),
});

/**
 * Streams the running draft: the testimonial as it stands from the answers so
 * far. Called after every answer so the customer watches it take shape, and
 * once more at the end for the version they review.
 */
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request" }, { status: 400 });
  const { ws, form: formSlug, turns } = parsed.data;

  const admin = adminClient();
  const { data: workspace } = await admin.from("workspace").select("id, name").eq("slug", ws).maybeSingle();
  if (!workspace) return Response.json({ error: "Unknown workspace" }, { status: 404 });
  const { data: form } = await admin
    .from("form")
    .select("questions")
    .eq("workspace_id", workspace.id)
    .eq("slug", formSlug)
    .maybeSingle();
  const total = (form?.questions as string[] | null)?.length || DEFAULT_QUESTIONS.length;

  const answered = turns.filter((t) => t.role === "customer" && t.text.trim()).length;
  if (answered === 0) return new Response(null, { status: 204 });

  const stream = streamText({
    system: draftSystem(workspace.name, answered < total),
    messages: draftMessages(turns),
    maxTokens: 300,
    effort: "low",
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
