import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import { renderAsk } from "@/lib/email";
import type { Ask } from "@/lib/types";
import { AsksView } from "@/components/asks-view";

export const metadata: Metadata = { title: "Asks" };

export default async function AsksPage() {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const [{ data: asks }, { data: form }] = await Promise.all([
    supabase.from("ask").select("*").eq("workspace_id", workspace.id).order("created_at", { ascending: false }).limit(50),
    supabase.from("form").select("slug").eq("workspace_id", workspace.id).order("mode", { ascending: true }).order("created_at", { ascending: true }).limit(1).maybeSingle(),
  ]);
  const formSlug = form?.slug ?? "share";
  const list = (asks ?? []) as Ask[];
  const queued = list.filter((a) => a.status === "draft" || a.status === "scheduled");
  const sample = queued[0] ?? { name: "Sam Reilly", email: "sam@example.com", token: "preview" };
  const preview = await renderAsk(workspace, sample, formSlug);

  return <AsksView workspace={workspace} asks={list} preview={{ subject: preview.subject, html: preview.html }} formSlug={formSlug} />;
}
