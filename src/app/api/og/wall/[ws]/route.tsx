import { ImageResponse } from "next/og";
import { getWorkspaceBySlug } from "@/lib/workspace";
import { averageRating, listApproved } from "@/lib/public";
import { Brand, Frame, loadFonts, Stars } from "@/lib/og";

/** Link preview for the wall of love. */
export async function GET(_request: Request, ctx: RouteContext<"/api/og/wall/[ws]">) {
  const { ws } = await ctx.params;
  const workspace = await getWorkspaceBySlug(ws);
  if (!workspace) return new Response("Not found", { status: 404 });
  const items = await listApproved(workspace.id, {}, 60);
  const avg = averageRating(items);
  const accent = workspace.brand?.accent || "#1d4ed8";
  const faces = items.filter((t) => t.avatar_url).slice(0, 6);
  const lead = items.find((t) => t.featured && t.highlight) ?? items.find((t) => t.highlight) ?? items[0];

  return new ImageResponse(
    (
      <Frame width={1200} height={630} accent={accent}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: 72 }}>
          <Brand name={workspace.name} logo={workspace.brand?.logo_url} size={26} />
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <span style={{ fontSize: 22, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8c8c8c" }}>Wall of love</span>
            <span style={{ fontSize: 60, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.05 }}>What customers say</span>
            {lead ? (
              <span style={{ fontFamily: "Source Serif 4", fontStyle: "italic", fontSize: 30, lineHeight: 1.35, color: "#5a5a5a" }}>
                “{(lead.highlight ?? lead.body).slice(0, 140)}{(lead.highlight ?? lead.body).length > 140 ? "…" : ""}”
              </span>
            ) : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ display: "flex" }}>
                {faces.map((t, i) => (
                  <img key={t.id} src={t.avatar_url!} alt="" width={56} height={56} style={{ width: 56, height: 56, borderRadius: 999, objectFit: "cover", marginLeft: i ? -14 : 0, border: "3px solid #fff" }} />
                ))}
              </div>
              <span style={{ fontSize: 26, fontWeight: 600 }}>
                {items.length} {items.length === 1 ? "testimonial" : "testimonials"}, each with consent
              </span>
            </div>
            {avg ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Stars rating={Math.round(avg)} size={28} color={accent} />
                <span style={{ fontSize: 26, color: "#5a5a5a" }}>{avg} average</span>
              </div>
            ) : null}
          </div>
        </div>
      </Frame>
    ),
    { width: 1200, height: 630, fonts: await loadFonts(), headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}
