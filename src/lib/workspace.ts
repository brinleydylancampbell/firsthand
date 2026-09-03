import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { adminClient } from "./supabase/admin";
import { createClient } from "./supabase/server";
import { DEFAULT_QUESTIONS, DEFAULT_WIDGET_CONFIG, type Workspace } from "./types";
import { slugify } from "./utils";

export const DEMO_SLUG = process.env.DEMO_WORKSPACE_SLUG ?? "demo";

/**
 * The signed-in user and their workspace, or a redirect to /login.
 * Cached per request so layouts and pages can both call it.
 */
export const requireWorkspace = cache(async (): Promise<{ user: User; workspace: Workspace }> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("workspace_member")
    .select("workspace:workspace(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const workspace = (data?.workspace as unknown as Workspace | null) ?? null;
  if (!workspace) {
    // Signed in but never provisioned (for example the callback was interrupted).
    const created = await ensureWorkspace(user, { joinDemo: false });
    return { user, workspace: created };
  }
  return { user, workspace };
});

/**
 * Called once from the auth callback. Real sign-ins get a fresh workspace with
 * a default form and widget. Demo sign-ins join the shared demo workspace.
 */
export async function ensureWorkspace(user: User, opts: { joinDemo: boolean }): Promise<Workspace> {
  const admin = adminClient();

  const { data: existing } = await admin
    .from("workspace_member")
    .select("workspace:workspace(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const current = (existing?.workspace as unknown as Workspace | null) ?? null;

  if (opts.joinDemo) {
    const { data: demo } = await admin.from("workspace").select("*").eq("slug", DEMO_SLUG).maybeSingle();
    if (demo) {
      await admin
        .from("workspace_member")
        .upsert({ workspace_id: demo.id, user_id: user.id }, { onConflict: "workspace_id,user_id" });
      return demo as Workspace;
    }
  }

  if (current) return current;

  const base = slugify(user.email?.split("@")[0] ?? "workspace") || "workspace";
  const name = user.email?.split("@")[0] ?? "My workspace";

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data: ws, error } = await admin
      .from("workspace")
      .insert({ name, slug })
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") continue; // slug taken, try again
      throw error;
    }
    await admin.from("workspace_member").insert({ workspace_id: ws.id, user_id: user.id });
    await admin.from("form").insert({
      workspace_id: ws.id,
      slug: "share",
      title: `Tell us how it went`,
      intro: `A few quick questions. Your answers become a short testimonial you get to approve before anything is published.`,
      questions: DEFAULT_QUESTIONS,
      mode: "chat",
    });
    await admin.from("widget").insert({
      workspace_id: ws.id,
      name: "Wall",
      type: "wall",
      config: DEFAULT_WIDGET_CONFIG,
    });
    return ws as Workspace;
  }
  throw new Error("Could not create a workspace slug.");
}

export async function getWorkspaceBySlug(slug: string): Promise<Workspace | null> {
  const { data } = await adminClient().from("workspace").select("*").eq("slug", slug).maybeSingle();
  return (data as Workspace | null) ?? null;
}
