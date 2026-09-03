"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import { averageRating, listApproved } from "@/lib/public";
import { DEFAULT_WIDGET_CONFIG, type WidgetConfig, type WidgetType } from "@/lib/types";
import { renderWidget } from "@/lib/widget-html";
import { appUrl } from "@/lib/utils";
import type { ActionResult } from "@/app/app/actions";

export async function createWidget(): Promise<void> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("widget")
    .insert({ workspace_id: workspace.id, name: "New widget", type: "wall", config: DEFAULT_WIDGET_CONFIG })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not create the widget.");
  revalidatePath("/app/widgets");
  redirect(`/app/widgets/${data.id}`);
}

export async function saveWidget(id: string, fields: { name: string; type: WidgetType; config: WidgetConfig }): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const config: WidgetConfig = {
    ...DEFAULT_WIDGET_CONFIG,
    ...fields.config,
    count: Math.max(1, Math.min(24, Number(fields.config.count) || 6)),
  };
  const { error } = await supabase
    .from("widget")
    .update({ name: fields.name.trim() || "Untitled widget", type: fields.type, config })
    .eq("id", id)
    .eq("workspace_id", workspace.id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/app/widgets");
  revalidatePath(`/app/widgets/${id}`);
  return { ok: true };
}

export async function deleteWidget(id: string): Promise<void> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  await supabase.from("widget").delete().eq("id", id).eq("workspace_id", workspace.id);
  revalidatePath("/app/widgets");
  redirect("/app/widgets");
}

/** Live preview for the builder: same markup the embed serves. */
export async function previewWidget(type: WidgetType, config: WidgetConfig): Promise<string> {
  const { workspace } = await requireWorkspace();
  const merged = { ...DEFAULT_WIDGET_CONFIG, ...config };
  const items = await listApproved(workspace.id, merged.filters, type === "badge" ? 200 : merged.count);
  return renderWidget({
      type,
      config: merged,
      items,
      theme: merged.theme,
      origin: appUrl(),
      ws: workspace.slug,
      avg: averageRating(items),
    });
}
