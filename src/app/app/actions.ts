"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import { extractLabels } from "@/lib/extract";
import type { HighlightMode, Objection, TestimonialStatus } from "@/lib/types";

/** Every action re-checks the session. Row level security does the rest. */
async function ctx() {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  return { supabase, workspace };
}

function revalidate(slug: string) {
  revalidatePath("/app");
  revalidatePath("/app/testimonials");
  revalidatePath("/w/[ws]", "page");
  revalidatePath(`/w/${slug}`);
}

export type ActionResult = { ok: true } | { ok: false; message: string };

export async function setStatus(id: string, status: TestimonialStatus): Promise<ActionResult> {
  const { supabase, workspace } = await ctx();

  if (status === "approved") {
    const { data: t } = await supabase
      .from("testimonial")
      .select("id, body, consent_public, objection, author_role, author_company")
      .eq("id", id)
      .maybeSingle();
    if (!t) return { ok: false, message: "That testimonial no longer exists." };
    if (!t.consent_public) {
      return { ok: false, message: "This customer has not consented to publishing. It cannot be approved." };
    }

    const { error } = await supabase.from("testimonial").update({ status }).eq("id", id);
    if (error) return { ok: false, message: error.message };
    revalidate(workspace.slug);

    // Label it so it can be found later. Approval stands even if this fails.
    if (!t.objection && t.body.trim()) {
      try {
        const labels = await extractLabels(
          t.body,
          [t.author_role, t.author_company].filter(Boolean).join(" at ") || undefined,
        );
        await supabase
          .from("testimonial")
          .update({
            objection: labels.objection,
            outcome: labels.outcome,
            tags: labels.tags,
            highlight: labels.highlight,
          })
          .eq("id", id);
        revalidate(workspace.slug);
      } catch (err) {
        console.error("extraction failed", err);
      }
    }
    return { ok: true };
  }

  const { error } = await supabase.from("testimonial").update({ status }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidate(workspace.slug);
  return { ok: true };
}

export async function setFeatured(id: string, featured: boolean): Promise<ActionResult> {
  const { supabase, workspace } = await ctx();
  const { error } = await supabase.from("testimonial").update({ featured }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidate(workspace.slug);
  return { ok: true };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const { supabase, workspace } = await ctx();
  const { error } = await supabase.from("testimonial").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidate(workspace.slug);
  return { ok: true };
}

export type EditableFields = Partial<{
  body: string;
  author_name: string | null;
  author_role: string | null;
  author_company: string | null;
  author_url: string | null;
  avatar_url: string | null;
  rating: number | null;
  tags: string[];
  objection: Objection | null;
  outcome: string | null;
  highlight: string | null;
  highlight_mode: HighlightMode;
  provenance_public: boolean;
}>;

export async function updateTestimonial(id: string, fields: EditableFields): Promise<ActionResult> {
  const { supabase, workspace } = await ctx();
  const clean: EditableFields = { ...fields };
  if (clean.body !== undefined) clean.body = clean.body.trim();
  if (clean.highlight !== undefined && clean.highlight && clean.body === undefined) {
    // Keep the invariant: a highlight must be a slice of the body.
    const { data } = await supabase.from("testimonial").select("body").eq("id", id).maybeSingle();
    if (data && !data.body.includes(clean.highlight)) clean.highlight = null;
  }
  if (clean.tags) clean.tags = clean.tags.map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8);
  const { error } = await supabase.from("testimonial").update(clean).eq("id", id);
  if (error) return { ok: false, message: error.message };
  revalidate(workspace.slug);
  return { ok: true };
}

export async function reorderTestimonials(ids: string[]): Promise<ActionResult> {
  const { supabase, workspace } = await ctx();
  const results = await Promise.all(
    ids.map((id, i) => supabase.from("testimonial").update({ sort_order: i }).eq("id", id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, message: failed.error.message };
  revalidate(workspace.slug);
  return { ok: true };
}

export async function relabel(id: string): Promise<ActionResult> {
  const { supabase, workspace } = await ctx();
  const { data: t } = await supabase
    .from("testimonial")
    .select("body, author_role, author_company")
    .eq("id", id)
    .maybeSingle();
  if (!t) return { ok: false, message: "Not found." };
  try {
    const labels = await extractLabels(t.body, [t.author_role, t.author_company].filter(Boolean).join(" at ") || undefined);
    await supabase.from("testimonial").update(labels).eq("id", id);
  } catch {
    return { ok: false, message: "Labelling failed. Try again in a moment." };
  }
  revalidate(workspace.slug);
  return { ok: true };
}
