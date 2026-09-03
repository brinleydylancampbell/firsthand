import { ImageResponse } from "next/og";
import { adminClient } from "@/lib/supabase/admin";
import { publicIdentity, type Testimonial, type Workspace } from "@/lib/types";
import { loadFonts, QuoteCard, SIZES, type SizeKey } from "@/lib/og";

/**
 * Quote card as a PNG in three sizes. Only approved, consented testimonials
 * render; anything else is a 404 so the URL can never leak a private one.
 */
export async function GET(request: Request, ctx: RouteContext<"/api/og/testimonial/[id]">) {
  const { id } = await ctx.params;
  const sizeParam = new URL(request.url).searchParams.get("size");
  const size: SizeKey = sizeParam === "portrait" || sizeParam === "landscape" ? sizeParam : "square";

  const admin = adminClient();
  const { data } = await admin
    .from("testimonial")
    .select("*, workspace:workspace(*)")
    .eq("id", id)
    .eq("status", "approved")
    .eq("consent_public", true)
    .maybeSingle();
  if (!data) return new Response("Not found", { status: 404 });
  const t = data as Testimonial & { workspace: Workspace };
  const who = publicIdentity(t);

  return new ImageResponse(
    (
      <QuoteCard
        size={size}
        body={t.body}
        displayName={who.display_name}
        displayMeta={who.display_meta}
        avatar={t.identity_mode === "anonymous" ? null : t.avatar_url}
        rating={t.rating}
        accent={t.workspace.brand?.accent || "#7858d8"}
        workspaceName={t.workspace.name}
        logo={t.workspace.brand?.logo_url}
      />
    ),
    {
      ...SIZES[size],
      fonts: await loadFonts(),
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        "Content-Disposition": `inline; filename="testimonial-${t.id.slice(0, 8)}-${size}.png"`,
      },
    },
  );
}
