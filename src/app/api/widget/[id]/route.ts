import { renderToStaticMarkup } from "react-dom/server";
import { adminClient } from "@/lib/supabase/admin";
import { averageRating, listApproved } from "@/lib/public";
import { DEFAULT_WIDGET_CONFIG, type Theme, type Widget } from "@/lib/types";
import { WidgetMarkup } from "@/lib/widget-markup";
import { appUrl } from "@/lib/utils";

const CACHE = "public, s-maxage=60, stale-while-revalidate=86400";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" };

/**
 * Server rendered widget fragment. Fetched once by embed.js, cached at the
 * edge for a minute and served stale for a day while it refreshes, so a host
 * page never waits on the database.
 */
export async function GET(request: Request, ctx: RouteContext<"/api/widget/[id]">) {
  const { id } = await ctx.params;
  const url = new URL(request.url);
  const themeParam = url.searchParams.get("theme");
  const accent = sanitizeColor(url.searchParams.get("accent"));
  const radius = sanitizeLength(url.searchParams.get("radius"));

  const admin = adminClient();
  const { data } = await admin
    .from("widget")
    .select("id, type, config, workspace:workspace(slug)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return new Response("<!-- widget not found -->", { status: 404, headers: { "Content-Type": "text/html", ...CORS } });

  const widget = data as unknown as Widget & { workspace: { slug: string } };
  const config = { ...DEFAULT_WIDGET_CONFIG, ...(widget.config ?? {}) };
  const theme: Theme = themeParam === "light" || themeParam === "dark" ? themeParam : config.theme ?? "auto";

  const { data: ws } = await admin.from("workspace").select("id").eq("slug", widget.workspace.slug).single();
  const items = await listApproved(ws!.id, config.filters, widget.type === "badge" ? 200 : config.count);

  const html = renderToStaticMarkup(
    WidgetMarkup({
      type: widget.type,
      config,
      items,
      theme,
      accent,
      radius,
      origin: appUrl(),
      ws: widget.workspace.slug,
      avg: averageRating(items),
    }),
  );

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": CACHE, ...CORS },
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

function sanitizeColor(v: string | null): string | null {
  if (!v) return null;
  return /^#[0-9a-fA-F]{3,8}$|^[a-zA-Z]{3,20}$|^(rgb|hsl)a?\([\d\s.,%\/]+\)$/.test(v) ? v : null;
}

function sanitizeLength(v: string | null): string | null {
  if (!v) return null;
  return /^\d{1,3}(px|rem|em|%)?$/.test(v) ? (/^\d+$/.test(v) ? `${v}px` : v) : null;
}
