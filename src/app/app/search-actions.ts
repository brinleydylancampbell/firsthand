"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { generateObject, generateText } from "@/lib/ai";
import { importMessages, importSystem, linkedinMessages, linkedinSystem, searchMessages, searchSystem } from "@/lib/prompts";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import { publicIdentity, type Testimonial } from "@/lib/types";
import { safeUrl } from "@/lib/utils";

/* Plain English search, LinkedIn drafting and paste import. All owner-only. */

const SearchSchema = z.object({
  results: z.array(z.object({ id: z.string(), reason: z.string() })),
});

export type SearchHit = { id: string; reason: string };

export async function searchTestimonials(query: string): Promise<{ ok: true; hits: SearchHit[] } | { ok: false; message: string }> {
  const q = query.trim().slice(0, 300);
  if (q.length < 3) return { ok: false, message: "Say a little more about what you need." };
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonial")
    .select("id, body, objection, outcome, tags, author_role, author_company")
    .eq("workspace_id", workspace.id)
    .eq("status", "approved")
    .limit(300);
  const candidates = (data ?? []) as Array<Pick<Testimonial, "id" | "body" | "objection" | "outcome" | "tags" | "author_role" | "author_company">>;
  if (!candidates.length) return { ok: true, hits: [] };

  try {
    const out = await generateObject({
      schema: SearchSchema,
      system: searchSystem,
      messages: searchMessages(q, candidates.map((c) => ({ ...c, tags: c.tags ?? [] }))),
      maxTokens: 600,
    });
    const valid = new Set(candidates.map((c) => c.id));
    return { ok: true, hits: out.results.filter((r) => valid.has(r.id)).slice(0, 3) };
  } catch {
    return { ok: false, message: "Search is unavailable right now. Try again in a moment." };
  }
}

export async function draftLinkedinPost(id: string): Promise<{ ok: true; text: string } | { ok: false; message: string }> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase.from("testimonial").select("*").eq("id", id).maybeSingle();
  if (!data) return { ok: false, message: "Not found." };
  const t = data as Testimonial;
  const who = publicIdentity(t);
  try {
    const text = await generateText({
      system: linkedinSystem(workspace.name),
      messages: linkedinMessages(t.body, who.display_name, who.display_meta),
      maxTokens: 400,
    });
    return { ok: true, text };
  } catch {
    return { ok: false, message: "Could not draft the post right now." };
  }
}

const ImportSchema = z.object({
  body: z.string(),
  author_name: z.string().nullable(),
  author_role: z.string().nullable(),
  author_company: z.string().nullable(),
  rating: z.number().nullable(),
  source_label: z.enum(["google", "trustpilot", "x", "linkedin", "email", "other"]),
});

export type ImportResult = { ok: true; id: string } | { ok: false; message: string };

/**
 * Paste anything. Claude splits author from text. The owner confirms the
 * review is already public and they have the right to reuse it; that
 * assertion is what stands in for consent on an import, and it is recorded.
 */
export async function importTestimonial(input: { text: string; sourceUrl?: string; confirmed: boolean }): Promise<ImportResult> {
  const text = input.text.trim().slice(0, 6000);
  if (text.length < 10) return { ok: false, message: "Paste the review text first." };
  if (!input.confirmed) return { ok: false, message: "Confirm the review is already public and you can reuse it." };
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();

  let parsed: z.infer<typeof ImportSchema>;
  try {
    parsed = await generateObject({ schema: ImportSchema, system: importSystem, messages: importMessages(text), maxTokens: 800 });
  } catch {
    return { ok: false, message: "Could not read that text. Try pasting just the review and the name." };
  }

  const rating = parsed.rating && parsed.rating >= 1 && parsed.rating <= 5 ? Math.round(parsed.rating) : null;
  const sourceUrl = safeUrl(input.sourceUrl);
  const { data, error } = await supabase
    .from("testimonial")
    .insert({
      workspace_id: workspace.id,
      author_name: parsed.author_name,
      author_role: parsed.author_role,
      author_company: parsed.author_company,
      rating,
      body: parsed.body.trim() || text,
      source: "import",
      status: "pending",
      identity_mode: parsed.author_name ? "full" : "anonymous",
      consent_public: true,
      consent_at: new Date().toISOString(),
      consent_text: `Imported by the workspace owner, who confirmed this review is already public at its source and may be reused.`,
      provenance: { type: "import", source_label: parsed.source_label, source_url: sourceUrl },
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, message: "Could not save the import." };
  revalidatePath("/app");
  revalidatePath("/app/testimonials");
  return { ok: true, id: data.id };
}
