"use client";

import { useEffect, useState, useTransition } from "react";
import { relabel, updateTestimonial } from "@/app/app/actions";
import { draftLinkedinPost } from "@/app/app/search-actions";
import { publicIdentity, type HighlightMode, type Testimonial, type Workspace } from "@/lib/types";
import { Button, ErrorNote, Select, Textarea } from "@/components/ui";

const sizes = [
  { key: "square", label: "Square", dims: "1080 × 1080", hint: "Instagram, LinkedIn" },
  { key: "portrait", label: "Portrait", dims: "1080 × 1350", hint: "Feed posts" },
  { key: "landscape", label: "Landscape", dims: "1200 × 630", hint: "X, link previews" },
];

/**
 * Share one testimonial: quote cards in three sizes, a LinkedIn draft, and
 * the highlight and provenance settings that affect how it displays.
 */
export function SharePanel({ testimonial: t, workspace, onClose }: { testimonial: Testimonial; workspace: Workspace; onClose: () => void }) {
  const [post, setPost] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const [highlightMode, setHighlightMode] = useState<HighlightMode>(t.highlight_mode);
  const [highlight, setHighlight] = useState(t.highlight ?? "");
  const [provenance, setProvenance] = useState(t.provenance_public);
  const who = publicIdentity(t);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function draft() {
    setError(null);
    start(async () => {
      const res = await draftLinkedinPost(t.id);
      if (res.ok) setPost(res.text);
      else setError(res.message);
    });
  }

  function saveDisplay() {
    setError(null);
    start(async () => {
      const res = await updateTestimonial(t.id, {
        highlight_mode: highlightMode,
        highlight: highlight.trim() && t.body.includes(highlight.trim()) ? highlight.trim() : null,
        provenance_public: provenance,
      });
      if (!res.ok) setError(res.message);
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/30 p-0 sm:items-center sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label="Share testimonial">
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="label-sm">Share</p>
            <p className="mt-1 font-medium">{who.display_name}{who.display_meta ? `, ${who.display_meta}` : ""}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <blockquote className="mt-4 font-serif leading-relaxed text-ink-2">{t.body}</blockquote>

        <section className="mt-6">
          <h3 className="text-sm font-medium">Quote card</h3>
          <p className="mt-1 text-xs text-ink-3">Rendered with {workspace.name}’s branding. Opens as a PNG you can save.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {sizes.map((s) => (
              <a
                key={s.key}
                href={`/api/og/testimonial/${t.id}?size=${s.key}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-line bg-card p-3 text-sm hover:border-ink"
              >
                <span className="block font-medium">{s.label}</span>
                <span className="block text-ink-2">{s.dims}</span>
                <span className="block text-xs text-ink-3">{s.hint}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">LinkedIn post</h3>
            <Button size="sm" variant="secondary" onClick={draft} disabled={pending}>
              {pending && !post ? "Drafting…" : post ? "Draft again" : "Draft a LinkedIn post"}
            </Button>
          </div>
          {post ? (
            <div className="mt-3">
              <Textarea value={post} onChange={(e) => setPost(e.target.value)} className="min-h-40" aria-label="LinkedIn post draft" />
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(post);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
                <a href="https://www.linkedin.com/feed/?shareActive=true" target="_blank" rel="noreferrer" className="inline-flex h-8 items-center px-2 text-sm text-ink-2 underline underline-offset-2">
                  Open LinkedIn
                </a>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-ink-3">Two lines of introduction in your voice, then the quote, credited the way the customer chose.</p>
          )}
        </section>

        <section className="mt-6 space-y-3 rounded-2xl border border-line bg-card p-4">
          <h3 className="text-sm font-medium">How it displays</h3>
          <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
            <Select value={highlightMode} onChange={(e) => setHighlightMode(e.target.value as HighlightMode)} aria-label="Highlight mode">
              <option value="none">Full text</option>
              <option value="bold">Highlight bold, rest muted</option>
              <option value="only">Highlight only</option>
            </Select>
            <div>
              <Textarea
                value={highlight}
                onChange={(e) => setHighlight(e.target.value)}
                className="min-h-16 text-sm"
                placeholder="The strongest sentence, copied exactly from the text"
                aria-label="Highlight sentence"
                disabled={highlightMode === "none"}
              />
              {highlight.trim() && !t.body.includes(highlight.trim()) ? (
                <p className="mt-1 text-xs text-danger">Must match a slice of the testimonial exactly.</p>
              ) : null}
            </div>
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={provenance} onChange={(e) => setProvenance(e.target.checked)} className="mt-0.5 h-4 w-4" />
            <span>
              Show a “see how this was collected” link on this card.
              <span className="block text-xs text-ink-3">
                {t.source === "interview" ? "Opens the real questions and answers." : t.source === "import" ? "Shows the source it came from." : "Shows when and how consent was given."}
              </span>
            </span>
          </label>
          {error ? <ErrorNote title={error} /> : null}
          <div className="flex gap-2">
            <Button size="sm" onClick={saveDisplay} disabled={pending}>Save</Button>
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(async () => { const r = await relabel(t.id); if (!r.ok) setError(r.message); })}>
              Re-run labels
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
