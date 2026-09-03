"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { OBJECTION_LABELS, type Objection, type PublicTestimonial, type Workspace } from "@/lib/types";
import { useDarkMode } from "@/lib/use-theme";
import { cn } from "@/lib/utils";
import { Avatar, Stars } from "@/components/ui";
import { Logo } from "@/components/logo";

type Chip = { key: string; label: string; test: (t: PublicTestimonial) => boolean };

const sourceLabel: Record<string, string> = {
  google: "Google review",
  trustpilot: "Trustpilot",
  x: "Post on X",
  linkedin: "LinkedIn",
  email: "By email",
};

export function Wall({ workspace, items }: { workspace: Workspace; items: PublicTestimonial[] }) {
  const [dark, toggleDark] = useDarkMode();
  const [active, setActive] = useState<string | null>(null);

  const chips = useMemo<Chip[]>(() => {
    const out: Chip[] = [];
    if (items.some((t) => t.featured)) out.push({ key: "featured", label: "Featured", test: (t) => t.featured });
    const objections = new Map<Objection, number>();
    const tags = new Map<string, number>();
    for (const t of items) {
      if (t.objection) objections.set(t.objection, (objections.get(t.objection) ?? 0) + 1);
      for (const tag of t.tags ?? []) tags.set(tag, (tags.get(tag) ?? 0) + 1);
    }
    for (const [o, n] of [...objections.entries()].sort((a, b) => b[1] - a[1])) {
      if (n >= 1) out.push({ key: `o:${o}`, label: OBJECTION_LABELS[o], test: (t) => t.objection === o });
    }
    for (const [tag, n] of [...tags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)) {
      if (n >= 2) out.push({ key: `t:${tag}`, label: tag, test: (t) => (t.tags ?? []).includes(tag) });
    }
    return out;
  }, [items]);

  const shown = useMemo(() => {
    const chip = chips.find((c) => c.key === active);
    return chip ? items.filter(chip.test) : items;
  }, [items, chips, active]);

  const style = { "--accent": workspace.brand?.accent || undefined } as CSSProperties;

  return (
    <div className={cn("flex min-h-full flex-1 flex-col bg-paper text-ink transition-colors", dark && "dark", workspace.brand?.font === "serif" && "font-serif")} style={style}>
      <header className="mx-auto w-full max-w-6xl px-6 pt-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {workspace.brand?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={workspace.brand.logo_url} alt="" className="h-7 w-auto" />
            ) : (
              <span aria-hidden className="inline-block h-2.5 w-2.5 bg-accent" />
            )}
            <span className="font-medium">{workspace.name}</span>
          </div>
          <button
            type="button"
            onClick={toggleDark}
            className="rounded-2xl border border-line px-2.5 py-1 text-sm text-ink-2 hover:text-ink"
            aria-pressed={dark}
          >
            {dark ? "Light" : "Dark"}
          </button>
        </div>
        <div className="mt-12 max-w-2xl">
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">What customers say</h1>
          <p className="mt-3 text-ink-2">
            {items.length} {items.length === 1 ? "testimonial" : "testimonials"}, each one published with the customer’s consent, in their own words.
          </p>
        </div>
        {chips.length ? (
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter testimonials">
            <ChipButton active={active === null} onClick={() => setActive(null)}>
              All
            </ChipButton>
            {chips.map((c) => (
              <ChipButton key={c.key} active={active === c.key} onClick={() => setActive(active === c.key ? null : c.key)}>
                {c.label}
              </ChipButton>
            ))}
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {shown.length === 0 ? (
          <p className="text-ink-3">Nothing here yet.</p>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [column-fill:_balance]">
            {shown.map((t) => (
              <WallCard key={t.id} t={t} ws={workspace.slug} />
            ))}
          </div>
        )}
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-xs text-ink-3">
        <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
          Collected with <Logo size={16} className="text-xs font-medium underline-offset-2 hover:underline" />. Nothing here is published without the customer’s consent.
        </span>
      </footer>
    </div>
  );
}

function ChipButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-8 rounded-full border px-3.5 text-sm transition-colors",
        active ? "border-ink bg-ink text-card" : "border-line text-ink-2 hover:border-line-strong hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function WallCard({ t, ws }: { t: PublicTestimonial; ws: string }) {
  const src = t.source === "import" ? sourceLabel[t.source_label ?? ""] ?? "Imported review" : t.source === "interview" ? "Interview" : null;
  return (
    <figure className="mb-4 break-inside-avoid rounded-2xl border border-line bg-card p-5">
      <div className="flex items-center gap-3">
        <Avatar src={t.avatar_url} name={t.display_name} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{t.display_name}</p>
          {t.display_meta ? <p className="truncate text-sm text-ink-2">{t.display_meta}</p> : null}
        </div>
        <Stars rating={t.rating} />
      </div>
      <blockquote className="mt-4 font-serif text-[1.05rem] leading-relaxed">
        <HighlightedBody t={t} />
      </blockquote>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
        {src ? <span>{src}</span> : null}
        {t.verified ? <span>Verified customer</span> : null}
        {t.provenance_public ? (
          <Link href={`/w/${ws}/t/${t.id}`} className="underline underline-offset-2 hover:text-ink">
            See how this was collected
          </Link>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function HighlightedBody({ t }: { t: PublicTestimonial }) {
  if (t.highlight && t.body.includes(t.highlight) && t.highlight_mode !== "none") {
    if (t.highlight_mode === "only") return <>{t.highlight}</>;
    const i = t.body.indexOf(t.highlight);
    return (
      <>
        <span className="text-ink-2">{t.body.slice(0, i)}</span>
        <strong className="font-semibold text-ink">{t.highlight}</strong>
        <span className="text-ink-2">{t.body.slice(i + t.highlight.length)}</span>
      </>
    );
  }
  return <>{t.body}</>;
}
