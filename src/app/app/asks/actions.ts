"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import { appUrl } from "@/lib/utils";
import type { ActionResult } from "@/app/app/actions";

export async function saveAskSettings(fields: { ask_delay_days: number; ask_subject: string; ask_body: string }): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const delay = Math.max(0, Math.min(60, Math.round(Number(fields.ask_delay_days) || 0)));
  if (!fields.ask_body.includes("{{link}}")) return { ok: false, message: "The email needs the {{link}} placeholder somewhere, or nobody can reply." };
  const { error } = await supabase
    .from("workspace")
    .update({ ask_delay_days: delay, ask_subject: fields.ask_subject.trim() || null, ask_body: fields.ask_body.trim() || null })
    .eq("id", workspace.id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/app/asks");
  return { ok: true };
}

/**
 * Draft to live moves waiting asks onto the schedule. Live to draft pulls
 * scheduled asks back so nothing sends. Both are instant and reversible.
 */
export async function setAskMode(mode: "draft" | "live"): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase.from("workspace").update({ ask_mode: mode }).eq("id", workspace.id);
  if (error) return { ok: false, message: error.message };
  if (mode === "live") {
    await supabase.from("ask").update({ status: "scheduled" }).eq("workspace_id", workspace.id).eq("status", "draft");
  } else {
    await supabase.from("ask").update({ status: "draft" }).eq("workspace_id", workspace.id).eq("status", "scheduled");
  }
  revalidatePath("/app/asks");
  return { ok: true };
}

export async function cancelAsk(id: string): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase.from("ask").update({ status: "cancelled" }).eq("id", id).eq("workspace_id", workspace.id).in("status", ["draft", "scheduled"]);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/app/asks");
  return { ok: true };
}

export async function rotateSecret(): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { error } = await supabase.from("workspace").update({ webhook_secret: randomBytes(24).toString("hex") }).eq("id", workspace.id);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/app/asks");
  return { ok: true };
}

/** Posts a sample payload to the workspace's own hook, exactly as an external system would. */
export async function sendTestEvent(): Promise<ActionResult> {
  const { workspace } = await requireWorkspace();
  const res = await fetch(appUrl(`/api/hooks/${workspace.slug}`), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${workspace.webhook_secret}` },
    body: JSON.stringify({
      email: "test@example.com",
      name: "Test Customer",
      order_ref: `TEST-${Math.floor(Math.random() * 9000 + 1000)}`,
      delivered_at: new Date().toISOString(),
    }),
  }).catch(() => null);
  if (!res || !res.ok) return { ok: false, message: `The hook returned ${res?.status ?? "no response"}.` };
  revalidatePath("/app/asks");
  return { ok: true };
}
