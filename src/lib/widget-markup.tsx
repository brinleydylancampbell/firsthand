import type { PublicTestimonial, Theme, WidgetConfig, WidgetType } from "./types";
import { BADGE_H, CARD_H, GAP, SINGLE_H } from "./widget-size";

/**
 * Markup for the embed fragment. Rendered to a static string by the widget
 * route and injected by embed.js. No React on the host page, no iframe.
 * Styles are scoped under .fh, inherit the host font, and read CSS variables
 * so the host can restyle without touching our CSS.
 */

const sourceLabel: Record<string, string> = {
  interview: "Interview",
  classic: "Form",
  import: "Review",
};

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
.fh-name{font-weight:600;font-size:14px;line-height:18px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fh-meta{font-size:12px;line-height:16px;color:var(--fh-muted,#777);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fh-stars{display:inline-flex;gap:1px;margin-left:auto;flex:none}
.fh-star{width:12px;height:12px;fill:var(--fh-accent,currentColor)}
.fh-star.off{fill:var(--fh-line,rgba(128,128,128,.3))}
.fh-body{margin-top:12px;font-size:15px;line-height:22px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.fh-body b{font-weight:600}
.fh-foot{margin-top:auto;padding-top:10px;display:flex;align-items:center;gap:8px;font-size:12px;line-height:16px;color:var(--fh-muted,#777)}
.fh-foot a{text-decoration:underline;text-underline-offset:2px}
.fh-strip{display:flex;gap:${GAP}px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:${GAP}px;scrollbar-width:thin}
.fh-strip .fh-card{flex:0 0 min(320px,85%);scroll-snap-align:start}
.fh-single{height:${SINGLE_H}px;display:flex;flex-direction:column;justify-content:center;padding:0 4px}
@media(max-width:639px){.fh-single{height:${SINGLE_H + 24}px}}
.fh-quote{font-size:20px;line-height:28px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.fh-quote b{font-weight:600}
.fh-cite{margin-top:14px;display:flex;align-items:center;gap:10px;font-size:14px}
.fh-cite .fh-avatar,.fh-cite .fh-initials{width:28px;height:28px;font-size:11px}
.fh-badge{height:${BADGE_H}px;display:inline-flex;align-items:center;gap:12px}
.fh-stack{display:flex}
.fh-stack .fh-avatar,.fh-stack .fh-initials{width:32px;height:32px;margin-left:-8px;border:2px solid var(--fh-card,#fff);font-size:11px}
.fh-stack>:first-child{margin-left:0}
.fh-badge-text{font-size:14px;line-height:18px;font-weight:600}
.fh-badge-sub{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--fh-muted,#777)}
.fh-empty{font-size:14px;color:var(--fh-muted,#777)}
`.trim();
}

function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="fh-stars" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={i <= rating ? "fh-star" : "fh-star off"} viewBox="0 0 20 20" aria-hidden>
          <path d="M10 1.8l2.5 5.3 5.7.7-4.2 4 1.1 5.7L10 14.7l-5.1 2.8 1.1-5.7-4.2-4 5.7-.7z" />
        </svg>
      ))}
    </span>
  );
}

function Pic({ t }: { t: PublicTestimonial }) {
  if (t.avatar_url) return <img className="fh-avatar" src={t.avatar_url} alt="" loading="lazy" width={36} height={36} />;
  const letters = t.display_name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join();
  return <span className="fh-initials" aria-hidden>{letters.replace(",", "") || "•"}</span>;
}

/** Body with the highlight applied. */
export function Body({ t, className }: { t: PublicTestimonial; className: string }) {
  if (t.highlight && t.body.includes(t.highlight)) {
    if (t.highlight_mode === "only") return <p className={className}>{t.highlight}</p>;
    if (t.highlight_mode === "bold") {
      const [before, after] = splitOnce(t.body, t.highlight);
      return (
        <p className={className}>
          {before}
          <b>{t.highlight}</b>
          {after}
        </p>
      );
    }
  }
  return <p className={className}>{t.body}</p>;
}

function splitOnce(s: string, needle: string): [string, string] {
  const i = s.indexOf(needle);
  return [s.slice(0, i), s.slice(i + needle.length)];
}

function Card({ t, config, origin, ws }: { t: PublicTestimonial; config: WidgetConfig; origin: string; ws: string }) {
  return (
    <figure className="fh-card">
      <div className="fh-head">
        <Pic t={t} />
        <div style={{ minWidth: 0 }}>
          <div className="fh-name">{t.display_name}</div>
          {t.display_meta ? <div className="fh-meta">{t.display_meta}</div> : null}
        </div>
        {config.showRating !== false ? <Stars rating={t.rating} /> : null}
      </div>
      <Body t={t} className="fh-body" />
      <figcaption className="fh-foot">
        {config.showSource !== false ? <span>{sourceLabel[t.source] ?? "Review"}</span> : null}
        {config.showProvenance && t.provenance_public ? (
          <a href={`${origin}/w/${ws}/t/${t.id}`} target="_blank" rel="noreferrer">
            See how this was collected
          </a>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function WidgetMarkup({
  type,
  config,
  items,
  theme,
  accent,
  radius,
  origin,
  ws,
  avg,
}: {
  type: WidgetType;
  config: WidgetConfig;
  items: PublicTestimonial[];
  theme: Theme;
  accent?: string | null;
  radius?: string | null;
  origin: string;
  ws: string;
  avg: number | null;
}) {
  const style: Record<string, string> = {};
  if (accent) style["--fh-accent"] = accent;
  if (radius) style["--fh-radius"] = radius;

  return (
    <div className="fh" data-theme={theme} style={style as React.CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: widgetCss() }} />
      {items.length === 0 ? (
        <p className="fh-empty">No testimonials yet.</p>
      ) : type === "wall" ? (
        <div className="fh-grid">
          {items.map((t) => (
            <Card key={t.id} t={t} config={config} origin={origin} ws={ws} />
          ))}
        </div>
      ) : type === "carousel" ? (
        <div className="fh-strip">
          {items.map((t) => (
            <Card key={t.id} t={t} config={config} origin={origin} ws={ws} />
          ))}
        </div>
      ) : type === "single" ? (
        <div className="fh-single" data-fh-rotate>
          {items.map((t, i) => (
            <figure key={t.id} hidden={i !== 0}>
              <Body t={t} className="fh-quote" />
              <figcaption className="fh-cite">
                <Pic t={t} />
                <span>
                  <b>{t.display_name}</b>
                  {t.display_meta ? <span style={{ opacity: 0.7 }}> · {t.display_meta}</span> : null}
                </span>
                {config.showRating !== false ? <Stars rating={t.rating} /> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <a className="fh-badge" href={`${origin}/w/${ws}`} target="_blank" rel="noreferrer">
          <span className="fh-stack">
            {items.slice(0, 5).map((t) => (
              <Pic key={t.id} t={t} />
            ))}
          </span>
          <span>
            <span className="fh-badge-text">{config.badgeText || `Loved by ${items.length}${items.length >= 10 ? "+" : ""} customers`}</span>
            <span className="fh-badge-sub">
              {avg ? (
                <>
                  <Stars rating={Math.round(avg)} /> {avg} average
                </>
              ) : (
                "Read what they say"
              )}
            </span>
          </span>
        </a>
      )}
    </div>
  );
}
