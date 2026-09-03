import type { WidgetConfig, WidgetType } from "./types";

/**
 * Widget dimensions are deterministic so the snippet can reserve the exact
 * height before the script runs. Cards are fixed height, grids have fixed
 * column counts per breakpoint, so there is nothing left to shift.
 */
export const CARD_H = 200;
export const GAP = 12;
export const SINGLE_H = 176;
export const CAROUSEL_H = CARD_H + GAP;
export const BADGE_H = 44;

export type Reserved = { desktop: number; tablet: number; mobile: number };

export function reservedHeight(type: WidgetType, config: WidgetConfig): Reserved {
  const n = Math.max(1, Math.min(24, config.count || 6));
  const rows = (cols: number) => Math.ceil(n / cols) * CARD_H + (Math.ceil(n / cols) - 1) * GAP;
  switch (type) {
    case "wall":
      return { desktop: rows(3), tablet: rows(2), mobile: rows(1) };
    case "carousel":
      return { desktop: CAROUSEL_H, tablet: CAROUSEL_H, mobile: CAROUSEL_H };
    case "single":
      return { desktop: SINGLE_H, tablet: SINGLE_H, mobile: SINGLE_H + 24 };
    case "badge":
      return { desktop: BADGE_H, tablet: BADGE_H, mobile: BADGE_H };
  }
}

/** The copy-and-paste snippet. One style rule, one div, one script. */
export function snippet(opts: {
  origin: string;
  widgetId: string;
  type: WidgetType;
  config: WidgetConfig;
  accent?: string | null;
  radius?: string | null;
}): string {
  const h = reservedHeight(opts.type, opts.config);
  const sel = `[data-firsthand="${opts.widgetId}"]`;
  const attrs = [
    `data-firsthand="${opts.widgetId}"`,
    opts.config.theme && opts.config.theme !== "auto" ? `data-theme="${opts.config.theme}"` : null,
    opts.accent ? `data-accent="${opts.accent}"` : null,
    opts.radius ? `data-radius="${opts.radius}"` : null,
  ]
    .filter(Boolean)
    .join(" ");
  return [
    `<style>${sel}{min-height:${h.desktop}px}@media(max-width:899px){${sel}{min-height:${h.tablet}px}}@media(max-width:639px){${sel}{min-height:${h.mobile}px}}</style>`,
    `<div ${attrs}></div>`,
    `<script src="${opts.origin}/embed.js" async></script>`,
  ].join("\n");
}
