"use client";

import { useEffect, useState, useTransition } from "react";
import { importTestimonial } from "@/app/app/search-actions";
import { Button, ErrorNote, Field, Input, Textarea } from "@/components/ui";

export function ImportPanel({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await importTestimonial({ text, sourceUrl: url || undefined, confirmed });
      if (res.ok) setDone(true);
      else setError(res.message);
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label="Import a review">
      <form onSubmit={submit} className="w-full max-w-xl space-y-5 rounded-sm border border-line bg-paper p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Import</p>
            <h2 className="mt-1 text-lg font-semibold">Paste a review from anywhere</h2>
            <p className="mt-1 text-sm text-ink-2">A Google review, a post on X, an email. We split out the name and the text; you approve it from the inbox.</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        {done ? (
          <div className="rounded-sm border border-ok/30 bg-ok/5 p-4 text-sm">
            <p className="font-medium text-ok">Imported. It is waiting in your inbox.</p>
            <div className="mt-3 flex gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => { setDone(false); setText(""); setUrl(""); setConfirmed(false); }}>Import another</Button>
              <Button type="button" size="sm" variant="ghost" onClick={onClose}>Done</Button>
            </div>
          </div>
        ) : (
          <>
            <Field label="Pasted text" htmlFor="import-text">
              <Textarea id="import-text" value={text} onChange={(e) => setText(e.target.value)} className="min-h-40" placeholder={"Jane Doe · ★★★★★ · 2 weeks ago\nAbsolutely brilliant service, they…"} required />
            </Field>
            <Field label="Where it came from" htmlFor="import-url" hint="Optional. Stored for provenance, never fetched.">
              <Input id="import-url" value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" placeholder="https://g.page/…" />
            </Field>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} required />
              <span>This review is already public at its source and I have the right to reuse it. This is recorded in place of the customer’s consent.</span>
            </label>
            {error ? <ErrorNote title={error} /> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={pending || !text.trim() || !confirmed}>{pending ? "Reading…" : "Import"}</Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
