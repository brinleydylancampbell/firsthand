import { ImageResponse } from "next/og";
import { adminClient } from "@/lib/supabase/admin";
import { getWorkspaceBySlug } from "@/lib/workspace";
import { Brand, Frame, loadFonts } from "@/lib/og";

/** Link preview for a collection form, so the link a customer receives looks intentional. */
export async function GET(_request: Request, ctx: RouteContext<"/api/og/form/[ws]/[form]">) {
  const { ws, form: formSlug } = await ctx.params;
  const workspace = await getWorkspaceBySlug(ws);
  if (!workspace) return new Response("Not found", { status: 404 });
  const { data: form } = await adminClient().from("form").select("title, intro, mode").eq("workspace_id", workspace.id).eq("slug", formSlug).maybeSingle();
  if (!form) return new Response("Not found", { status: 404 });
  const accent = workspace.brand?.accent || "#1d4ed8";

  return new ImageResponse(
    (
      <Frame width={1200} height={630} accent={accent}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: 72 }}>
          <Brand name={workspace.name} logo={workspace.brand?.logo_url} size={26} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span style={{ fontSize: 22, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8c8c8c" }}>
              {form.mode === "chat" ? "A three minute conversation" : "A quick review"}
            </span>
            <span style={{ fontSize: 62, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{form.title}</span>
            {form.intro ? <span style={{ fontSize: 28, lineHeight: 1.4, color: "#5a5a5a" }}>{form.intro.slice(0, 160)}</span> : null}
          </div>
          <span style={{ fontSize: 22, color: "#8c8c8c" }}>In your own words. You approve every line before it is used.</span>
        </div>
      </Frame>
    ),
    { width: 1200, height: 630, fonts: await loadFonts(), headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}
