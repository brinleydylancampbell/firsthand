import { revalidatePath } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";
import { seedDemo } from "@/lib/seed";
import { DEMO_SLUG } from "@/lib/workspace";

/**
 * Nightly. Reseeds the demo workspace so every visitor starts from the same
 * place, purges abandoned drafts older than a week, and removes anonymous
 * demo visitors older than a day.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const ok = secret ? request.headers.get("authorization") === `Bearer ${secret}` : process.env.NODE_ENV !== "production";
  if (!ok) return new Response("Unauthorized", { status: 401 });

  const admin = adminClient();
  const { workspaceId } = await seedDemo(admin, DEMO_SLUG);

  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { count } = await admin.from("testimonial").delete({ count: "exact" }).eq("status", "draft").lt("created_at", weekAgo);

  // Anonymous sessions older than a day. Paged so a busy demo day does not time out.
  const dayAgo = Date.now() - 86_400_000;
  let removed = 0;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data.users.length) break;
    const stale = data.users.filter((u) => u.is_anonymous && new Date(u.created_at).getTime() < dayAgo);
    for (const u of stale) {
      const { error: delErr } = await admin.auth.admin.deleteUser(u.id);
      if (!delErr) removed++;
    }
    if (data.users.length < 200) break;
  }

  revalidatePath(`/w/${DEMO_SLUG}`);
  return Response.json({ reseeded: workspaceId, purgedDrafts: count ?? 0, removedAnonymous: removed });
}
