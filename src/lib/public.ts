import { adminClient } from "./supabase/admin";
import { toPublic, type PublicTestimonial, type Testimonial, type WidgetFilters } from "./types";

/**
 * Public reads. Always approved, always consented, never the private fields.
 * Featured first, then the owner's manual order, then newest.
 */
export async function listApproved(
  workspaceId: string,
  filters: WidgetFilters = {},
  limit = 200,
): Promise<PublicTestimonial[]> {
  let q = adminClient()
    .from("testimonial")
    .select(
      "id, author_name, author_role, author_company, avatar_url, rating, body, source, featured, sort_order, tags, objection, outcome, highlight, highlight_mode, identity_mode, provenance, provenance_public, consent_public, created_at",
    )
    .eq("workspace_id", workspaceId)
    .eq("status", "approved")
    .eq("consent_public", true)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.featuredOnly) q = q.eq("featured", true);
  if (filters.objection) q = q.eq("objection", filters.objection);
  if (filters.minRating) q = q.gte("rating", filters.minRating);
  if (filters.tags?.length) q = q.contains("tags", filters.tags);

  const { data } = await q;
  return ((data ?? []) as Testimonial[]).map(toPublic);
}

export function averageRating(items: Array<{ rating: number | null }>): number | null {
  const rated = items.filter((t) => t.rating);
  if (!rated.length) return null;
  return Math.round((rated.reduce((s, t) => s + (t.rating ?? 0), 0) / rated.length) * 10) / 10;
}
