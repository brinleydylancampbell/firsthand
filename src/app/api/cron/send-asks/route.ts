import { adminClient } from "@/lib/supabase/admin";
import { sendAsk } from "@/lib/email";
import type { Ask, Workspace } from "@/lib/types";

/**
 * Every 15 minutes. Sends asks that are due, only for workspaces that are
 * live. Draft asks are never touched here.
 */
export async function GET(request: Request) {
  if (!authorized(request)) return new Response("Unauthorized", { status: 401 });
  const admin = adminClient();

  const { data } = await admin
    .from("ask")
    .select("*, workspace:workspace(*), form:form(slug)")
    .eq("status", "scheduled")
    .lte("send_at", new Date().toISOString())
    .limit(100);

  let sent = 0;
  let failed = 0;
  for (const row of (data ?? []) as Array<Ask & { workspace: Workspace; form: { slug: string } | null }>) {
    if (row.workspace.ask_mode !== "live") continue;
    try {
      await sendAsk(row.workspace, row, row.form?.slug ?? "share");
      await admin.from("ask").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", row.id);
      sent++;
    } catch (err) {
      console.error("ask send failed", row.id, err);
      failed++;
    }
  }
  return Response.json({ sent, failed });
}

export function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
