import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { streamText } from "@/lib/ai";
import { interviewMessages, interviewSystem } from "@/lib/prompts";
import { DEFAULT_QUESTIONS, type Form, type InterviewTurn } from "@/lib/types";

const Body = z.object({
  id: z.string().uuid().nullable(),
  ws: z.string().min(1),
  form: z.string().min(1),
  ask: z.string().nullable().optional(),
  turns: z
    .array(
      z.object({
        role: z.enum(["interviewer", "customer"]),
        text: z.string().max(4000),
      }),
    )
    .max(24),
});

/**
 * One interview turn. Saves the transcript so far to a draft testimonial row
 * (creating it on the first call) and streams the next question as plain text.
 * The row id comes back in a header so the client can keep it.
 * Returns 204 when the script is exhausted.
 */
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request" }, { status: 400 });
  const { id, ws, form: formSlug, turns, ask } = parsed.data;

  const admin = adminClient();
  const { data: workspace } = await admin.from("workspace").select("id, name").eq("slug", ws).maybeSingle();
  if (!workspace) return Response.json({ error: "Unknown workspace" }, { status: 404 });
  const { data: formRow } = await admin
    .from("form")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("slug", formSlug)
    .maybeSingle();
  if (!formRow) return Response.json({ error: "Unknown form" }, { status: 404 });
  const form = formRow as Form;
  const script = form.questions?.length ? form.questions : DEFAULT_QUESTIONS;

  const answered = turns.filter((t) => t.role === "customer").length;

  // Persist the transcript. Provenance links back to the ask if there was one.
  let testimonialId = id;
  const transcript: InterviewTurn[] = turns;
  if (testimonialId) {
    const { data: existing } = await admin
      .from("testimonial")
      .select("id, status")
      .eq("id", testimonialId)
      .eq("workspace_id", workspace.id)
      .maybeSingle();
    if (!existing || existing.status !== "draft") testimonialId = null;
    else await admin.from("testimonial").update({ raw_transcript: transcript }).eq("id", testimonialId);
  }
  if (!testimonialId) {
    let provenance: Record<string, unknown> = { type: "interview" };
    if (ask) {
      const { data: a } = await admin.from("ask").select("id, order_ref").eq("token", ask).eq("workspace_id", workspace.id).maybeSingle();
      if (a) provenance = { type: "interview", ask_id: a.id, order_ref: a.order_ref };
    }
    const { data: created, error } = await admin
      .from("testimonial")
      .insert({
        workspace_id: workspace.id,
        form_id: form.id,
        source: "interview",
        status: "draft",
        raw_transcript: transcript,
        provenance,
        provenance_public: false,
      })
      .select("id")
      .single();
    if (error || !created) return Response.json({ error: "Could not start" }, { status: 500 });
    testimonialId = created.id;
  }

  const headers = new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Testimonial-Id": testimonialId as string,
    "X-Question-Index": String(answered),
    "X-Question-Total": String(script.length),
  });

  if (answered >= script.length) {
    return new Response(null, { status: 204, headers });
  }

  const stream = streamText({
    system: interviewSystem(workspace.name, script),
    messages: interviewMessages(transcript, script[answered], answered, script.length),
    maxTokens: 200,
    effort: "low",
  });
  return new Response(stream, { headers });
}
