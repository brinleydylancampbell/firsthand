"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import type { Brand } from "@/lib/types";
import type { ActionResult } from "@/app/app/actions";

export async function saveSettings(fields: { name: string; brand: Brand; provenance_default: boolean }): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const name = fields.name.trim();
  if (name.length < 2) return { ok: false, message: "Give the workspace a name." };
  const accent = fields.brand.accent?.trim() || null;
  if (accent && !/^#[0-9a-fA-F]{6}$/.test(accent)) return { ok: false, message: "Accent must be a six digit hex colour, like #1d4ed8." };
  const brand: Brand = {
    logo_url: fields.brand.logo_url || null,
    accent,
    font: fields.brand.font === "serif" ? "serif" : "sans",
  };
  const { error } = await supabase
    .from("workspace")
    .update({ name, brand, provenance_default: fields.provenance_default })
    .eq("id", workspace.id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/app", "layout");
  revalidatePath(`/w/${workspace.slug}`);
  return { ok: true };
}
