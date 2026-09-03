import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import type { Workspace } from "@/lib/types";

const Payload = z.object({
  email: z.string().email(),
  name: z.string().max(120).optional().nullable(),
  order_ref: z.string().max(120).optional().nullable(),
  delivered_at: z.string().datetime({ offset: true }).optional().nullable(),
});

/**
 * Ask at the right moment. Anything that can POST JSON can call this: an
 * order system, a job tracker, Zapier, Make, a shell script.
 *
 *   POST /api/hooks/{workspace}
 *   Authorization: Bearer {webhook secret}
 *   { "email": "...", "name": "...", "order_ref": "...", "delivered_at": "2026-09-01T10:00:00Z" }
 *
 * Schedules an invitation for delivered_at + the workspace delay.
 * While the workspace is in draft mode nothing is ever sent; the ask waits
 * in the dashboard for the owner to preview and go live.
 */
export async function POST(request: Request, ctx: RouteContext<"/api/hooks/[ws]">) {
  const { ws } = await ctx.params;
  const admin = adminClient();
  const { data: workspace } = await admin.from("workspace").select("*").eq("slug", ws).maybeSingle();
  if (!workspace) return Response.json({ error: "Unknown workspace" }, { status: 404 });
  const w = workspace as Workspace;

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token || token !== w.webhook_secret) {
    return Response.json({ error: "Invalid or missing bearer secret" }, { status: 401 });
  }

  const parsed = Payload.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Expected JSON with email, and optionally name, order_ref, delivered_at (ISO 8601)" }, { status: 400 });
  }
  const { email, name, order_ref, delivered_at } = parsed.data;

  const { data: form } = await admin
    .from("form")
    .select("id")
    .eq("workspace_id", w.id)
    .order("mode", { ascending: true }) // 'chat' sorts before 'classic'
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const base = delivered_at ? new Date(delivered_at) : new Date();
  const sendAt = new Date(base.getTime() + w.ask_delay_days * 86_400_000);

  const { data: ask, error } = await admin
    .from("ask")
    .insert({
      workspace_id: w.id,
      form_id: form?.id ?? null,
      email: email.toLowerCase(),
      name: name ?? null,
      order_ref: order_ref ?? null,
      delivered_at: delivered_at ?? null,
      send_at: sendAt.toISOString(),
      status: w.ask_mode === "live" ? "scheduled" : "draft",
    })
    .select("id, send_at, status")
    .single();
  if (error || !ask) return Response.json({ error: "Could not schedule" }, { status: 500 });

  return Response.json(
    {
      id: ask.id,
      send_at: ask.send_at,
      status: ask.status,
      note: ask.status === "draft" ? "Workspace is in draft mode. This will not send until the owner goes live." : undefined,
    },
    { status: 201 },
  );
}
