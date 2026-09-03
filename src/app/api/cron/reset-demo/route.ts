import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { seedDemo } from "@/lib/seed";
import { DEMO_SLUG } from "@/lib/workspace";

/**
 * Nightly. Reseeds the demo workspace so every judge starts from the same
 * place, and purges abandoned interview drafts older than a week everywhere.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const ok = secret ? request.headers.get("authorization") === `Bearer ${secret}` : process.env.NODE_ENV !== "production";
  if (!ok) return new Response("Unauthorized", { status: 401 });

  const admin = adminClient();
  const { workspaceId } = await seedDemo(admin, DEMO_SLUG);

  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { count } = await admin
    .from("testimonial")
    .delete({ count: "exact" })
    .eq("status", "draft")
    .lt("created_at", weekAgo);

  revalidatePath(`/w/${DEMO_SLUG}`);
  return Response.json({ reseeded: workspaceId, purgedDrafts: count ?? 0 });
}
