"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/app/app/actions";

export type FormFields = {
  title: string;
  slug: string;
  intro: string | null;
  incentive: string | null;
  thank_you: string | null;
};

export async function createForm(): Promise<void> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const slug = `form-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await supabase
    .from("form")
    .insert({
      workspace_id: workspace.id,
      slug,
      title: "Tell us how it went",
      intro: "A couple of sentences in your own words is plenty. You choose how you are named before anything is published.",
      mode: "classic",
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not create the form.");
  revalidatePath("/app/collect");
  redirect(`/app/forms/${data.id}`);
}

export async function saveForm(id: string, fields: FormFields): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const slug = slugify(fields.slug) || slugify(fields.title) || "form";
  if (!fields.title.trim()) return { ok: false, message: "Give the form a title." };

  const { error } = await supabase
    .from("form")
    .update({
      title: fields.title.trim(),
      slug,
      intro: fields.intro?.trim() || null,
      incentive: fields.incentive?.trim() || null,
      thank_you: fields.thank_you?.trim() || null,
      mode: "classic",
    })
    .eq("id", id)
    .eq("workspace_id", workspace.id);
  if (error) {
    if (error.code === "23505") return { ok: false, message: "Another form already uses that link. Pick a different slug." };
    return { ok: false, message: error.message };
  }
  revalidatePath("/app/collect");
  revalidatePath(`/app/forms/${id}`);
  revalidatePath(`/f/${workspace.slug}/${slug}`);
  return { ok: true };
}

export async function deleteForm(id: string): Promise<void> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  await supabase.from("form").delete().eq("id", id).eq("workspace_id", workspace.id);
  revalidatePath("/app/collect");
  redirect("/app/collect");
}
