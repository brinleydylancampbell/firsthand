"use client";

import { useMemo, useState, useTransition } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderTestimonials } from "@/app/app/actions";
import { searchTestimonials, type SearchHit } from "@/app/app/search-actions";
import { OBJECTION_LABELS, publicIdentity, type Testimonial, type TestimonialStatus, type Workspace } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, Badge, Button, ButtonLink, EmptyState, ErrorNote, Input, Kbd, Stars } from "@/components/ui";
import { InboxList } from "@/components/inbox-list";
import { SharePanel } from "@/components/share-panel";
import { ImportPanel } from "@/components/import-panel";

type Tab = "pending" | "approved" | "hidden";
const tabLabel: Record<Tab, string> = { pending: "Waiting", approved: "Approved", hidden: "Hidden" };

export function TestimonialsView({ workspace, items }: { workspace: Workspace; items: Testimonial[] }) {
  const [tab, setTab] = useState<Tab>("pending");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, start] = useTransition();
  const [share, setShare] = useState<Testimonial | null>(null);
  const [importing, setImporting] = useState(false);

  const counts = useMemo(() => {
    const c: Record<TestimonialStatus, number> = { draft: 0, pending: 0, approved: 0, hidden: 0 };
    for (const t of items) c[t.status]++;
    return c;
  }, [items]);

  const visible = useMemo(() => items.filter((t) => t.status === tab), [items, tab]);
  const byId = useMemo(() => new Map(items.map((t) => [t.id, t])), [items]);

  function runSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchError(null);
    start(async () => {
      const res = await searchTestimonials(query);
      if (res.ok) setHits(res.hits);
      else setSearchError(res.message);
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Testimonials</h1>
          <p className="mt-1 text-sm text-ink-2">
            {counts.pending ? `${counts.pending} waiting for review` : "Nothing waiting"} · {counts.approved} live on your wall
          </p>
        </div>
        <Button variant="secondary" onClick={() => setImporting(true)}>
          Import a review
        </Button>
      </header>

      <form onSubmit={runSearch} className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value) setHits(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setQuery("");
              setHits(null);
            }
          }}
          placeholder="Find one in plain English: “worried about price, small team, saved time”"
          aria-label="Search testimonials in plain English"
          className="pr-24"
        />
        <Button type="submit" size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2" disabled={searching || query.trim().length < 3}>
          {searching ? "Thinking…" : "Find"}
        </Button>
      </form>
      {searchError ? <div className="mt-3"><ErrorNote title={searchError} /></div> : null}

      {hits !== null ? (
        <section className="mt-4 rounded-2xl border border-line bg-paper-2/70 p-4" aria-live="polite">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{hits.length ? `Best ${hits.length === 1 ? "match" : `${hits.length} matches`}` : "Nothing fits that well"}</p>
            <button type="button" className="text-xs text-ink-3 underline underline-offset-2" onClick={() => setHits(null)}>
              Clear
            </button>
          </div>
          {hits.length ? (
            <ol className="mt-3 space-y-3">
              {hits.map((h, i) => {
                const t = byId.get(h.id);
                if (!t) return null;
                const who = publicIdentity(t);
                return (
                  <li key={h.id} className="flex gap-3 rounded-2xl border border-line bg-card p-3">
                    <span className="mt-0.5 text-sm text-ink-3">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif leading-relaxed">{t.body}</p>
                      <p className="mt-2 text-sm text-ink-2">
                        <span className="font-medium text-ink">{who.display_name}</span>
                        {who.display_meta ? `, ${who.display_meta}` : ""} · <span className="text-accent-strong">{h.reason}</span>
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(t.body)}>Copy</Button>
                        <Button size="sm" variant="ghost" onClick={() => setShare(t)}>Share</Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-2 text-sm text-ink-2">Try describing the doubt it should answer, or the kind of customer.</p>
          )}
        </section>
      ) : null}

      <div className="mt-8 flex gap-1 border-b border-line" role="tablist">
        {(["pending", "approved", "hidden"] as Tab[]).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm",
              tab === k ? "border-accent font-medium text-ink" : "border-transparent text-ink-2 hover:text-ink",
            )}
          >
            {tabLabel[k]} <span className="ml-1 text-ink-3">{counts[k]}</span>
          </button>
        ))}
      </div>

      {tab === "pending" && visible.length > 0 ? (
        <p className="mt-4 hidden items-center gap-1.5 text-sm text-ink-3 sm:flex">
          <Kbd>J</Kbd>
          <Kbd>K</Kbd> move <Kbd>A</Kbd> approve <Kbd>H</Kbd> hide <Kbd>F</Kbd> feature <Kbd>E</Kbd> edit
        </p>
      ) : null}

      <div className="mt-6">
        {visible.length === 0 ? (
          tab === "approved" ? (
            <EmptyState
              title="Nothing approved yet"
              body="Approve testimonials from the inbox and they appear on your wall and in widgets."
              action={<Button variant="secondary" onClick={() => setTab("pending")}>See what is waiting</Button>}
            />
          ) : tab === "pending" ? (
            <EmptyState title="Nothing waiting" body="New submissions land here. Nothing goes public until you approve it." action={<ButtonLink href="/app/collect" variant="secondary">Share a form link</ButtonLink>} />
          ) : (
            <EmptyState title="Nothing hidden" body="Hidden testimonials stay in your records but never show publicly." />
          )
        ) : tab === "approved" ? (
          <ApprovedList items={visible} onShare={setShare} />
        ) : (
          <InboxList initial={visible} removeOnStatusChange={tab === "pending"} />
        )}
      </div>

      {share ? <SharePanel testimonial={share} workspace={workspace} onClose={() => setShare(null)} /> : null}
      {importing ? <ImportPanel onClose={() => setImporting(false)} /> : null}
    </div>
  );
}

/* Approved: drag to reorder, feature marker, share. */
function ApprovedList({ items, onShare }: { items: Testimonial[]; onShare: (t: Testimonial) => void }) {
  const [order, setOrder] = useState(items.map((t) => t.id));
  const [prev, setPrev] = useState(items);
  if (items !== prev) {
    setPrev(items);
    setOrder(items.map((t) => t.id));
  }
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const byId = new Map(items.map((t) => [t.id, t]));

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = order.indexOf(String(active.id));
    const to = order.indexOf(String(over.id));
    const next = arrayMove(order, from, to);
    const before = order;
    setOrder(next);
    start(async () => {
      const res = await reorderTestimonials(next);
      if (!res.ok) {
        setOrder(before);
        setError(res.message);
      }
    });
  }

  return (
    <div className="space-y-3">
      {error ? <ErrorNote title={error} /> : null}
      <p className="text-xs text-ink-3">Drag to set the order on your wall and in widgets. Featured ones always come first.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-card">
            {order.map((id) => {
              const t = byId.get(id);
              return t ? <SortableRow key={id} t={t} onShare={() => onShare(t)} /> : null;
            })}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableRow({ t, onShare }: { t: Testimonial; onShare: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: t.id });
  const who = publicIdentity(t);
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex gap-3 bg-paper px-2 py-4", isDragging && "relative z-10 shadow-sm")}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="mt-1 cursor-grab touch-none rounded-lg px-1 text-ink-3 hover:bg-paper-2 hover:text-ink active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <Avatar src={t.avatar_url} name={t.author_name} size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-medium">{who.display_name}</span>
          {who.display_meta ? <span className="text-sm text-ink-2">{who.display_meta}</span> : null}
          <Stars rating={t.rating} />
        </div>
        <p className="mt-1.5 line-clamp-2 font-serif leading-relaxed">{t.body}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {t.featured ? <Badge tone="accent">Featured</Badge> : null}
          {t.objection ? <Badge>{OBJECTION_LABELS[t.objection]}</Badge> : null}
          {t.outcome ? <Badge>{t.outcome}</Badge> : null}
          {t.provenance_public ? <Badge tone="outline">Provenance public</Badge> : null}
          <Button size="sm" variant="ghost" className="ml-auto" onClick={onShare}>
            Share
          </Button>
        </div>
      </div>
    </li>
  );
}
