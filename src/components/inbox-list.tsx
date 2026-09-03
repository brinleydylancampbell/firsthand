"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { deleteTestimonial, setFeatured, setStatus, updateTestimonial, type ActionResult } from "@/app/app/actions";
import { OBJECTION_LABELS, type Testimonial, type TestimonialStatus } from "@/lib/types";
import { cn, relativeDate } from "@/lib/utils";
import { Avatar, Badge, Button, ErrorNote, Field, Input, Kbd, Select, Stars, Textarea } from "@/components/ui";

type Props = {
  initial: Testimonial[];
  /** Inbox mode: approving or hiding removes the row. */
  removeOnStatusChange?: boolean;
};

const statusLabel: Record<TestimonialStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  hidden: "Hidden",
};

export function InboxList({ initial, removeOnStatusChange = false }: Props) {
  const [items, setItems] = useState<Testimonial[]>(initial);
  const [selected, setSelected] = useState<string | null>(initial[0]?.id ?? null);
  const [editing, setEditing] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const listRef = useRef<HTMLUListElement>(null);

  // The server re-renders after every action; adopt the fresh list.
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setItems(initial);
    if (!(selected && initial.some((t) => t.id === selected))) setSelected(initial[0]?.id ?? null);
  }

  const apply = useCallback(
    (id: string, optimistic: (t: Testimonial) => Testimonial | null, run: () => Promise<ActionResult>) => {
      const before = items;
      const idx = before.findIndex((t) => t.id === id);
      const nextList = before.map((t) => (t.id === id ? optimistic(t) : t)).filter((t): t is Testimonial => t !== null);
      setItems(nextList);
      if (!nextList.some((t) => t.id === selected)) {
        setSelected(nextList[Math.min(idx, nextList.length - 1)]?.id ?? null);
      }
      setError(null);
      startTransition(async () => {
        const res = await run();
        if (!res.ok) {
          setItems(before);
          setSelected(id);
          setError(res.message);
        }
      });
    },
    [items, selected],
  );

  const changeStatus = useCallback(
    (id: string, status: TestimonialStatus) => {
      const t = items.find((x) => x.id === id);
      if (!t) return;
      if (status === "approved" && !t.consent_public) {
        setError("This customer has not consented to publishing, so it cannot be approved.");
        return;
      }
      apply(
        id,
        (x) => (removeOnStatusChange ? null : { ...x, status }),
        () => setStatus(id, status),
      );
    },
    [apply, items, removeOnStatusChange],
  );

  const toggleFeatured = useCallback(
    (id: string) => {
      const t = items.find((x) => x.id === id);
      if (!t) return;
      apply(id, (x) => ({ ...x, featured: !x.featured }), () => setFeatured(id, !t.featured));
    },
    [apply, items],
  );

  const remove = useCallback(
    (id: string) => {
      if (!confirm("Delete this testimonial permanently?")) return;
      apply(id, () => null, () => deleteTestimonial(id));
    },
    [apply],
  );

  // Keyboard: J/K move, A approve, H hide, F feature, E edit, ? help, Esc close.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") {
        setEditing(null);
        setHelp(false);
        return;
      }
      if (e.key === "?") {
        setHelp((h) => !h);
        return;
      }
      if (!items.length) return;
      const idx = items.findIndex((t) => t.id === selected);
      const move = (delta: number) => {
        const next = items[Math.min(items.length - 1, Math.max(0, (idx < 0 ? 0 : idx) + delta))];
        if (next) {
          setSelected(next.id);
          listRef.current?.querySelector<HTMLElement>(`[data-id="${next.id}"]`)?.scrollIntoView({ block: "nearest" });
        }
      };
      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          move(1);
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          move(-1);
          break;
        case "a":
          if (selected) changeStatus(selected, "approved");
          break;
        case "h":
          if (selected) changeStatus(selected, "hidden");
          break;
        case "f":
          if (selected) toggleFeatured(selected);
          break;
        case "e":
          if (selected) setEditing(selected);
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, selected, changeStatus, toggleFeatured]);

  return (
    <div className="space-y-4">
      {error ? <ErrorNote title={error} action={<Button size="sm" variant="secondary" onClick={() => setError(null)}>Dismiss</Button>} /> : null}
      {help ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-line bg-paper-2 p-3 text-sm text-ink-2">
          <span><Kbd>J</Kbd> <Kbd>K</Kbd> move</span>
          <span><Kbd>A</Kbd> approve</span>
          <span><Kbd>H</Kbd> hide</span>
          <span><Kbd>F</Kbd> feature</span>
          <span><Kbd>E</Kbd> edit</span>
          <span><Kbd>Esc</Kbd> close</span>
        </div>
      ) : null}
      <ul ref={listRef} className="divide-y divide-line rounded-2xl border border-line bg-card">
        {items.map((t) => (
          <Row
            key={t.id}
            t={t}
            selected={t.id === selected}
            editing={t.id === editing}
            onSelect={() => setSelected(t.id)}
            onApprove={() => changeStatus(t.id, "approved")}
            onHide={() => changeStatus(t.id, "hidden")}
            onUnhide={() => changeStatus(t.id, "approved")}
            onPending={() => changeStatus(t.id, "pending")}
            onFeature={() => toggleFeatured(t.id)}
            onEdit={() => setEditing(editing === t.id ? null : t.id)}
            onDelete={() => remove(t.id)}
            onSaved={(next) => {
              setItems((list) => list.map((x) => (x.id === t.id ? { ...x, ...next } : x)));
              setEditing(null);
            }}
          />
        ))}
      </ul>
      {items.length === 0 ? <p className="py-8 text-center text-sm text-ink-3">All clear.</p> : null}
    </div>
  );
}

function Row({
  t,
  selected,
  editing,
  onSelect,
  onApprove,
  onHide,
  onUnhide,
  onPending,
  onFeature,
  onEdit,
  onDelete,
  onSaved,
}: {
  t: Testimonial;
  selected: boolean;
  editing: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onHide: () => void;
  onUnhide: () => void;
  onPending: () => void;
  onFeature: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSaved: (fields: Partial<Testimonial>) => void;
}) {
  const meta = [t.author_role, t.author_company].filter(Boolean).join(", ");
  const identityNote =
    t.identity_mode === "anonymous" ? "Shows as “Verified customer”" : t.identity_mode === "first_role" ? "Shows first name and role" : null;

  return (
    <li
      data-id={t.id}
      onClick={onSelect}
      className={cn(
        "relative cursor-default px-4 py-4 transition-colors sm:px-5",
        selected ? "bg-paper-2/60" : "hover:bg-paper-2/40",
      )}
    >
      {selected ? <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-ink" /> : null}
      <div className="flex gap-3">
        <Avatar src={t.avatar_url} name={t.author_name} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-medium">{t.author_name || "No name given"}</span>
            {meta ? <span className="text-sm text-ink-2">{meta}</span> : null}
            <Stars rating={t.rating} className="ml-1" />
            <span className="ml-auto text-xs text-ink-3" suppressHydrationWarning>{relativeDate(t.created_at)}</span>
          </div>

          {!editing ? (
            <p className={cn("mt-2 font-serif text-[1.05rem] leading-relaxed text-ink", !selected && "line-clamp-3")}>
              {t.body || <span className="text-ink-3">No text yet.</span>}
            </p>
          ) : (
            <EditPanel t={t} onCancel={onEdit} onSaved={onSaved} />
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Badge tone="outline">{t.source === "import" ? "Imported" : "Form"}</Badge>
            {t.consent_public ? <Badge tone="ok">Consent given</Badge> : <Badge tone="danger">No consent</Badge>}
            {t.status !== "pending" ? <Badge>{statusLabel[t.status]}</Badge> : null}
            {t.featured ? <Badge tone="accent">Featured</Badge> : null}
            {t.objection ? <Badge>{OBJECTION_LABELS[t.objection]}</Badge> : null}
            {t.outcome ? <Badge>{t.outcome}</Badge> : null}
            {t.tags?.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
            {identityNote ? <span className="text-xs text-ink-3">{identityNote}</span> : null}
          </div>

          {selected && !editing ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {t.status !== "approved" ? (
                <Button size="sm" onClick={onApprove} disabled={!t.consent_public} title={!t.consent_public ? "Cannot approve without consent" : undefined}>
                  Approve
                </Button>
              ) : null}
              {t.status === "hidden" ? (
                <Button size="sm" variant="secondary" onClick={onUnhide}>Unhide</Button>
              ) : t.status !== "pending" ? null : null}
              {t.status !== "hidden" ? (
                <Button size="sm" variant="secondary" onClick={onHide}>Hide</Button>
              ) : null}
              {t.status === "approved" ? (
                <Button size="sm" variant="secondary" onClick={onPending}>Back to inbox</Button>
              ) : null}
              <Button size="sm" variant="secondary" onClick={onFeature}>{t.featured ? "Unfeature" : "Feature"}</Button>
              <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
              <Button size="sm" variant="ghost" className="text-danger" onClick={onDelete}>Delete</Button>
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function EditPanel({
  t,
  onCancel,
  onSaved,
}: {
  t: Testimonial;
  onCancel: () => void;
  onSaved: (fields: Partial<Testimonial>) => void;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fields = {
      body: String(fd.get("body") ?? ""),
      author_name: String(fd.get("author_name") ?? "").trim() || null,
      author_role: String(fd.get("author_role") ?? "").trim() || null,
      author_company: String(fd.get("author_company") ?? "").trim() || null,
      rating: fd.get("rating") ? Number(fd.get("rating")) : null,
      tags: String(fd.get("tags") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    start(async () => {
      const res = await updateTestimonial(t.id, fields);
      if (!res.ok) setErr(res.message);
      else onSaved(fields);
    });
  }

  return (
    <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="mt-3 space-y-3 rounded-2xl border border-line bg-card p-4">
      <Field label="Testimonial" htmlFor={`body-${t.id}`}>
        <Textarea id={`body-${t.id}`} name="body" defaultValue={t.body} className="font-serif" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Name" htmlFor={`name-${t.id}`}>
          <Input id={`name-${t.id}`} name="author_name" defaultValue={t.author_name ?? ""} />
        </Field>
        <Field label="Role" htmlFor={`role-${t.id}`}>
          <Input id={`role-${t.id}`} name="author_role" defaultValue={t.author_role ?? ""} />
        </Field>
        <Field label="Company" htmlFor={`company-${t.id}`}>
          <Input id={`company-${t.id}`} name="author_company" defaultValue={t.author_company ?? ""} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
        <Field label="Rating" htmlFor={`rating-${t.id}`}>
          <Select id={`rating-${t.id}`} name="rating" defaultValue={t.rating ?? ""}>
            <option value="">None</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} stars</option>
            ))}
          </Select>
        </Field>
        <Field label="Tags" htmlFor={`tags-${t.id}`} hint="Comma separated. Auto tags are added on approve.">
          <Input id={`tags-${t.id}`} name="tags" defaultValue={(t.tags ?? []).join(", ")} />
        </Field>
      </div>
      {err ? <ErrorNote title={err} /> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
