import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEMO_WIDGET_PRICING_ID, DEMO_WIDGET_WALL_ID } from "@/lib/seed";
import { snippet } from "@/lib/widget-size";
import { appUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Embed test", robots: { index: false } };

/**
 * Three deliberately different host pages: a serif site, a sans site and a
 * dark site. Each pastes the snippet exactly as a customer would. Playwright
 * measures layout shift here, and Lighthouse runs against them.
 */
const hosts = {
  serif: {
    title: "The Quiet Ledger",
    font: "Georgia, 'Times New Roman', serif",
    bg: "#fbf8f2",
    fg: "#2a2622",
    theme: undefined,
    blurb: "A small newsletter about running a calmer business. Set in a serif so the widget has to inherit it.",
  },
  sans: {
    title: "Northwind Tools",
    font: "'Trebuchet MS', 'Segoe UI', Verdana, sans-serif",
    bg: "#ffffff",
    fg: "#0b1220",
    theme: undefined,
    blurb: "A plain marketing site with a system sans. Accent and radius are overridden with data attributes.",
  },
  dark: {
    title: "Nightshift Studio",
    font: "'Courier New', monospace",
    bg: "#0b0b0d",
    fg: "#e6e6e6",
    theme: "dark" as const,
    blurb: "A dark portfolio in monospace. The widget is forced to its dark theme.",
  },
};

export default async function EmbedTestPage(props: PageProps<"/embed-test/[host]">) {
  const { host } = await props.params;
  const h = hosts[host as keyof typeof hosts];
  if (!h) notFound();
  const origin = appUrl();

  const wall = snippet({
    origin,
    widgetId: DEMO_WIDGET_WALL_ID,
    type: "wall",
    config: { filters: {}, count: 6, theme: h.theme ?? "auto" },
    accent: host === "sans" ? "#c2410c" : null,
    radius: host === "sans" ? "8px" : null,
  });
  const single = snippet({
    origin,
    widgetId: DEMO_WIDGET_PRICING_ID,
    type: "single",
    config: { filters: {}, count: 3, theme: h.theme ?? "auto" },
  });

  return (
    <main data-testid="host" style={{ fontFamily: h.font, background: h.bg, color: h.fg, minHeight: "100%", flex: 1 }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        <p style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.8 }}>Embed test host: {host}</p>
        <h1 style={{ fontSize: 34, margin: "12px 0 8px", lineHeight: 1.15 }}>{h.title}</h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 620, opacity: 0.85 }}>{h.blurb}</p>

        <h2 style={{ fontSize: 22, margin: "48px 0 16px" }}>What people say</h2>
        <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: wall }} />

        <h2 style={{ fontSize: 22, margin: "48px 0 16px" }}>On the pricing page</h2>
        <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: single }} />

        <p style={{ marginTop: 48, fontSize: 14, opacity: 0.85, lineHeight: 1.6 }}>
          Everything below the widgets should stay exactly where it was while they load. The heights above were reserved by
          the snippet before the script ran.
        </p>
        <div data-testid="below" style={{ marginTop: 24, padding: 16, border: "1px dashed currentColor", opacity: 0.8 }}>
          Anchor paragraph used by the layout shift test.
        </div>
      </div>
    </main>
  );
}
