"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteWidget, previewWidget, saveWidget } from "@/app/app/widgets/actions";
import { DEFAULT_WIDGET_CONFIG, OBJECTIONS, OBJECTION_LABELS, type Objection, type Theme, type Widget, type WidgetConfig, type WidgetType, type Workspace } from "@/lib/types";
import { appUrl, cn } from "@/lib/utils";
import { snippet } from "@/lib/widget-size";
import { Button, ErrorNote, Field, Input, Select } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";

const types: Array<{ type: WidgetType; label: string; desc: string }> = [
  { type: "wall", label: "Wall", desc: "A grid of cards. Homepage, about page." },
  { type: "carousel", label: "Carousel", desc: "A horizontal strip that scrolls." },
  { type: "single", label: "Single quote", desc: "One quote at a time, rotating. Pricing page." },
  { type: "badge", label: "Badge", desc: "Avatar stack and “Loved by 40+ customers”." },
];

export function WidgetBuilder({
  widget,
  workspace,
  tags,
  series,
}: {
  widget: Widget;
  workspace: Workspace;
  tags: string[];
  series: Array<{ day: string; count: number }>;
}) {
  const [name, setName] = useState(widget.name);
  const [type, setType] = useState<WidgetType>(widget.type);
  const [config, setConfig] = useState<WidgetConfig>({ ...DEFAULT_WIDGET_CONFIG, ...widget.config });
  const [tagText, setTagText] = useState((widget.config?.filters?.tags ?? []).join(", "));
  const [accent, setAccent] = useState("");
  const [radius, setRadius] = useState("");
  const [html, setHtml] = useState<string>("");
  const [previewDark, setPreviewDark] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const [loadingPreview, startPreview] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const origin = appUrl();
  const code = snippet({ origin, widgetId: widget.id, type, config, accent: accent || null, radius: radius || null });
  const max = Math.max(1, ...series.map((s) => s.count));
  const total = series.reduce((s, x) => s + x.count, 0);

  // Debounced live preview.
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      startPreview(async () => {
        try {
          setHtml(await previewWidget(type, config));
        } catch {
          setHtml("");
        }
      });
    }, 250);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [type, config]);

  function patch(p: Partial<WidgetConfig>) {
    setConfig((c) => ({ ...c, ...p }));
  }
  function patchFilters(p: Partial<WidgetConfig["filters"]>) {
    setConfig((c) => ({ ...c, filters: { ...c.filters, ...p } }));
  }

  function save() {
    setError(null);
    start(async () => {
      const res = await saveWidget(widget.id, { name, type, config });
      if (!res.ok) setError(res.message);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  const previewStyle: React.CSSProperties = accent || radius ? ({ "--fh-accent": accent || undefined, "--fh-radius": radius || undefined } as React.CSSProperties) : {};

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <Link href="/app/widgets" className="text-sm text-ink-2 hover:text-ink">← Widgets</Link>
      <header className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Widget</p>
          <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="Widget name" className="mt-1 h-auto border-0 px-0 text-xl font-semibold tracking-tight focus:border-0" />
        </div>
        <div className="flex items-center gap-3">
          {saved ? <span className="text-sm text-ok">Saved</span> : null}
          <Button onClick={save} disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="space-y-7">
          <section>
            <p className="text-sm font-medium">Type</p>
            <div className="mt-2 space-y-1.5">
              {types.map((t) => (
                <label key={t.type} className={cn("flex cursor-pointer items-start gap-3 rounded-sm border p-3", type === t.type ? "border-ink bg-paper-2/60" : "border-line hover:border-ink-3")}>
                  <input type="radio" name="type" className="sr-only" checked={type === t.type} onChange={() => setType(t.type)} />
                  <span>
                    <span className="block text-sm font-medium">{t.label}</span>
                    <span className="block text-xs text-ink-2">{t.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-medium">Which testimonials</p>
            <Field label="Answering the doubt" htmlFor="objection">
              <Select id="objection" value={config.filters.objection ?? ""} onChange={(e) => patchFilters({ objection: (e.target.value || null) as Objection | null })}>
                <option value="">Any</option>
                {OBJECTIONS.map((o) => (
                  <option key={o} value={o}>{OBJECTION_LABELS[o]}</option>
                ))}
              </Select>
            </Field>
            <Field label="Tags" htmlFor="tags" hint={tags.length ? `Available: ${tags.slice(0, 8).join(", ")}` : "Comma separated"}>
              <Input
                id="tags"
                value={tagText}
                onChange={(e) => {
                  setTagText(e.target.value);
                  patchFilters({ tags: e.target.value.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean) });
                }}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Minimum rating" htmlFor="minRating">
                <Select id="minRating" value={config.filters.minRating ?? ""} onChange={(e) => patchFilters({ minRating: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">Any</option>
                  <option value="5">5 stars</option>
                  <option value="4">4 and up</option>
                  <option value="3">3 and up</option>
                </Select>
              </Field>
              <Field label="How many" htmlFor="count">
                <Input id="count" type="number" min={1} max={24} value={config.count} onChange={(e) => patch({ count: Number(e.target.value) })} disabled={type === "badge"} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4" checked={!!config.filters.featuredOnly} onChange={(e) => patchFilters({ featuredOnly: e.target.checked })} />
              Featured only
            </label>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-medium">Appearance</p>
            <Field label="Theme" htmlFor="theme">
              <Select id="theme" value={config.theme} onChange={(e) => patch({ theme: e.target.value as Theme })}>
                <option value="auto">Auto (follows the visitor)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Accent" htmlFor="accent" hint="Stars and links">
                <Input id="accent" value={accent} onChange={(e) => setAccent(e.target.value)} placeholder="#1d4ed8" />
              </Field>
              <Field label="Corner radius" htmlFor="radius">
                <Input id="radius" value={radius} onChange={(e) => setRadius(e.target.value)} placeholder="2px" />
              </Field>
            </div>
            <div className="space-y-1.5 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={config.showRating !== false} onChange={(e) => patch({ showRating: e.target.checked })} /> Show stars</label>
              <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={config.showSource !== false} onChange={(e) => patch({ showSource: e.target.checked })} /> Show source badge</label>
              <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" checked={!!config.showProvenance} onChange={(e) => patch({ showProvenance: e.target.checked })} /> Show “how this was collected” links</label>
            </div>
            {type === "badge" ? (
              <Field label="Badge text" htmlFor="badgeText" hint="Leave blank for “Loved by N customers”.">
                <Input id="badgeText" value={config.badgeText ?? ""} onChange={(e) => patch({ badgeText: e.target.value })} />
              </Field>
            ) : null}
          </section>

          <section>
            <p className="text-sm font-medium">Views</p>
            <p className="mt-0.5 text-xs text-ink-3">{widget.view_count.toLocaleString()} all time · {total} in the last 14 days</p>
            <div className="mt-2 flex h-12 items-end gap-0.5" aria-label="Views per day, last 14 days">
              {series.map((s) => (
                <div key={s.day} title={`${s.day}: ${s.count}`} className="flex-1 bg-ink/70" style={{ height: `${Math.max(4, (s.count / max) * 100)}%` }} />
              ))}
            </div>
          </section>

          <form
            action={() => {
              if (confirm("Delete this widget? Any pages embedding it will show nothing.")) return deleteWidget(widget.id);
            }}
          >
            <Button type="submit" variant="danger" size="sm">Delete widget</Button>
          </form>
        </aside>

        <div className="min-w-0 space-y-8">
          <section>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Preview</p>
              <button type="button" className="text-xs text-ink-2 underline underline-offset-2" onClick={() => setPreviewDark((d) => !d)}>
                {previewDark ? "Light host page" : "Dark host page"}
              </button>
            </div>
            <div className={cn("mt-2 rounded-sm border border-line p-6 transition-colors", previewDark ? "bg-[#0f0f0f] text-[#f2f2f2]" : "bg-paper")} style={previewStyle}>
              {html ? (
                <div className={cn(loadingPreview && "opacity-60 transition-opacity")} dangerouslySetInnerHTML={{ __html: previewDark && config.theme === "auto" ? html.replace('data-theme="auto"', 'data-theme="dark"') : html }} />
              ) : (
                <div className="skeleton h-40" />
              )}
            </div>
            {error ? <div className="mt-3"><ErrorNote title={error} /></div> : null}
          </section>

          <section>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Snippet</p>
              <CopyButton text={code} label="Copy snippet" />
            </div>
            <pre className="mt-2 overflow-x-auto rounded-sm border border-line bg-paper-2 p-4 text-xs leading-relaxed"><code>{code}</code></pre>
            <p className="mt-2 text-xs text-ink-3">
              The style rule reserves the exact height for each breakpoint, so the host page never shifts while the widget loads. Save before pasting so the live widget matches this preview.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
