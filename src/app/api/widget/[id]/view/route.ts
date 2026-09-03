import { adminClient } from "@/lib/supabase/admin";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS" };

/** One beacon per embed load. Rolled up by day. Nothing about the visitor is stored. */
export async function POST(_request: Request, ctx: RouteContext<"/api/widget/[id]/view">) {
  const { id } = await ctx.params;
  if (/^[0-9a-f-]{36}$/i.test(id)) {
    await adminClient().rpc("record_widget_view", { w: id });
  }
  return new Response(null, { status: 204, headers: CORS });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
