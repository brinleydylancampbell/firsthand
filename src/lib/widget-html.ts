import type { PublicTestimonial, Theme, WidgetConfig, WidgetType } from "./types";
import { BADGE_H, CARD_H, GAP, SINGLE_H } from "./widget-size";

/**
 * The embed fragment, rendered to a string. No React on the host page, no
 * iframe, no React on the server either: the markup is small enough that a
 * template is clearer and faster. Styles are scoped under .fh, inherit the
 * host font, and read CSS variables so hosts can restyle without our CSS.
 */

const sourceLabel: Record<string, string> = { interview: "Interview", classic: "Form", import: "Review" };

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

export function widgetCss(): string {
  return `
.fh{font:inherit;color:var(--fh-text,inherit);line-height:1.45;box-sizing:border-box}
.fh *{box-sizing:border-box;margin:0}
.fh a{color:inherit}
.fh[data-theme=dark]{--fh-text:#f2f2f2;--fh-muted:#a3a3a3;--fh-card:#161616;--fh-line:#2a2a2a}
@media(prefers-color-scheme:dark){.fh[data-theme=auto]{--fh-text:#f2f2f2;--fh-muted:#a3a3a3;--fh-card:#161616;--fh-line:#2a2a2a}}
.fh-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${GAP}px}
@media(max-width:899px){.fh-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:639px){.fh-grid{grid-template-columns:minmax(0,1fr)}}
.fh-card{height:${CARD_H}px;display:flex;flex-direction:column;padding:16px;background:var(--fh-card,transparent);border:1px solid var(--fh-line,rgba(128,128,128,.28));border-radius:var(--fh-radius,2px);overflow:hidden}
.fh-head{display:flex;align-items:center;gap:10px;min-height:36px}
.fh-avatar{width:36px;height:36px;border-radius:50%;object-fit:cover;flex:none;background:var(--fh-line,rgba(128,128,128,.2))}
.fh-initials{width:36px;height:36px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;background:var(--fh-line,rgba(128,128,128,.18));color:var(--fh-muted,#666)}
.fh-who{min-width:0}
.fh-name{font-weight:600;font-size:14px;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fh-meta{font-size:12px;line-height:16px;color:var(--fh-muted,#6b6b6b);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fh-stars{display:inline-flex;gap:1px;margin-left:auto;flex:none}
.fh-star{width:12px;height:12px;fill:var(--fh-accent,currentColor)}
.fh-star.off{fill:var(--fh-line,rgba(128,128,128,.3))}
.fh-body{margin-top:12px;font-size:15px;line-height:22px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.fh-body b{font-weight:600}
.fh-foot{margin-top:auto;padding-top:10px;display:flex;align-items:center;gap:8px;font-size:12px;line-height:16px;color:var(--fh-muted,#6b6b6b)}
.fh-foot a{text-decoration:underline;text-underline-offset:2px}
.fh-strip{display:flex;gap:${GAP}px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:${GAP}px;scrollbar-width:thin}
.fh-strip .fh-card{flex:0 0 min(320px,85%);scroll-snap-align:start}
.fh-single{height:${SINGLE_H}px;display:flex;flex-direction:column;justify-content:center;padding:0 4px}
@media(max-width:639px){.fh-single{height:${SINGLE_H + 24}px}}
.fh-quote{font-size:20px;line-height:28px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.fh-quote b{font-weight:600}
.fh-cite{margin-top:14px;display:flex;align-items:center;gap:10px;font-size:14px}
.fh-cite .fh-avatar,.fh-cite .fh-initials{width:28px;height:28px;font-size:11px}
.fh-cite .fh-dim{opacity:.7}
.fh-badge{height:${BADGE_H}px;display:inline-flex;align-items:center;gap:12px;text-decoration:none}
.fh-stack{display:flex}
.fh-stack .fh-avatar,.fh-stack .fh-initials{width:32px;height:32px;margin-left:-8px;border:2px solid var(--fh-card,#fff);font-size:11px}
.fh-stack>:first-child{margin-left:0}
.fh-badge-text{font-size:14px;line-height:18px;font-weight:600;display:block}
.fh-badge-sub{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--fh-muted,#6b6b6b)}
.fh-badge-sub .fh-stars{margin-left:0}
.fh-empty{font-size:14px;color:var(--fh-muted,#6b6b6b)}
`.trim();
}

const STAR = "M10 1.8l2.5 5.3 5.7.7-4.2 4 1.1 5.7L10 14.7l-5.1 2.8 1.1-5.7-4.2-4 5.7-.7z";

function stars(rating: number | null): string {
  if (!rating) return "";
  const s = [1, 2, 3, 4, 5]
    .map((i) => `<svg class="fh-star${i <= rating ? "" : " off"}" viewBox="0 0 20 20" aria-hidden="true"><path d="${STAR}"/></svg>`)
    .join("");
  return `<span class="fh-stars" role="img" aria-label="${rating} out of 5">${s}</span>`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function pic(t: PublicTestimonial): string {
  if (t.avatar_url) return `<img class="fh-avatar" src="${esc(t.avatar_url)}" alt="" loading="lazy" width="36" height="36">`;
  return `<span class="fh-initials" aria-hidden="true">${esc(initials(t.display_name) || "•")}</span>`;
}

/** Body with the highlight applied. Text is escaped; only our <b> is markup. */
export function bodyHtml(t: PublicTestimonial, cls: string): string {
  if (t.highlight && t.body.includes(t.highlight) && t.highlight_mode !== "none") {
    if (t.highlight_mode === "only") return `<p class="${cls}">${esc(t.highlight)}</p>`;
    const i = t.body.indexOf(t.highlight);
    return `<p class="${cls}">${esc(t.body.slice(0, i))}<b>${esc(t.highlight)}</b>${esc(t.body.slice(i + t.highlight.length))}</p>`;
  }
  return `<p class="${cls}">${esc(t.body)}</p>`;
}

function card(t: PublicTestimonial, config: WidgetConfig, origin: string, ws: string): string {
  const meta = t.display_meta ? `<div class="fh-meta">${esc(t.display_meta)}</div>` : "";
  const foot = [
    config.showSource !== false ? `<span>${sourceLabel[t.source] ?? "Review"}</span>` : "",
    config.showProvenance && t.provenance_public
      ? `<a href="${esc(origin)}/w/${esc(ws)}/t/${t.id}" target="_blank" rel="noreferrer">See how this was collected</a>`
      : "",
  ].join("");
  return `<figure class="fh-card"><div class="fh-head">${pic(t)}<div class="fh-who"><div class="fh-name">${esc(t.display_name)}</div>${meta}</div>${
    config.showRating !== false ? stars(t.rating) : ""
  }</div>${bodyHtml(t, "fh-body")}<figcaption class="fh-foot">${foot}</figcaption></figure>`;
}

export function renderWidget(opts: {
  type: WidgetType;
  config: WidgetConfig;
  items: PublicTestimonial[];
  theme: Theme;
  accent?: string | null;
  radius?: string | null;
  origin: string;
  ws: string;
  avg: number | null;
}): string {
  const { type, config, items, theme, accent, radius, origin, ws, avg } = opts;
  const vars = [accent ? `--fh-accent:${esc(accent)}` : "", radius ? `--fh-radius:${esc(radius)}` : ""].filter(Boolean).join(";");
  const style = vars ? ` style="${vars}"` : "";
  let inner: string;

  if (items.length === 0) {
    inner = `<p class="fh-empty">No testimonials yet.</p>`;
  } else if (type === "wall") {
    inner = `<div class="fh-grid">${items.map((t) => card(t, config, origin, ws)).join("")}</div>`;
  } else if (type === "carousel") {
    inner = `<div class="fh-strip">${items.map((t) => card(t, config, origin, ws)).join("")}</div>`;
  } else if (type === "single") {
    inner = `<div class="fh-single" data-fh-rotate>${items
      .map(
        (t, i) =>
          `<figure${i ? " hidden" : ""}>${bodyHtml(t, "fh-quote")}<figcaption class="fh-cite">${pic(t)}<span><b>${esc(t.display_name)}</b>${
            t.display_meta ? `<span class="fh-dim"> · ${esc(t.display_meta)}</span>` : ""
          }</span>${config.showRating !== false ? stars(t.rating) : ""}</figcaption></figure>`,
      )
      .join("")}</div>`;
  } else {
    const text = config.badgeText || `Loved by ${items.length}${items.length >= 10 ? "+" : ""} customers`;
    const sub = avg ? `${stars(Math.round(avg))} ${avg} average` : "Read what they say";
    inner = `<a class="fh-badge" href="${esc(origin)}/w/${esc(ws)}" target="_blank" rel="noreferrer"><span class="fh-stack">${items
      .slice(0, 5)
      .map(pic)
      .join("")}</span><span><span class="fh-badge-text">${esc(text)}</span><span class="fh-badge-sub">${sub}</span></span></a>`;
  }

  return `<div class="fh" data-theme="${theme}"${style}><style>${widgetCss()}</style>${inner}</div>`;
}
