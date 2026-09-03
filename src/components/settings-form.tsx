"use client";

import { useRef, useState, useTransition } from "react";
import { saveSettings } from "@/app/app/settings/actions";
import type { Workspace } from "@/lib/types";
import { appUrl, cn } from "@/lib/utils";
import { Button, ErrorNote, Field, Input } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";

export function SettingsForm({ workspace, email }: { workspace: Workspace; email: string }) {
  const [name, setName] = useState(workspace.name);
  const [accent, setAccent] = useState(workspace.brand?.accent ?? "#7858d8");
  const [font, setFont] = useState<"sans" | "serif">(workspace.brand?.font === "serif" ? "serif" : "sans");
  const [logo, setLogo] = useState<string | null>(workspace.brand?.logo_url ?? null);
  const [provenance, setProvenance] = useState(workspace.provenance_default);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const wallUrl = appUrl(`/w/${workspace.slug}`);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed.");
      setLogo(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function save() {
    setError(null);
    start(async () => {
      const res = await saveSettings({ name, brand: { accent, font, logo_url: logo }, provenance_default: provenance });
      if (!res.ok) setError(res.message);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <header className="mb-8">
        <p className="eyebrow">Settings</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Workspace</h1>
      </header>

      <div className="space-y-10">
        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" hint="Shown on forms, the wall and in consent text.">
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Wall of love" htmlFor="wall">
            <div className="flex gap-2">
              <Input id="wall" value={wallUrl} readOnly className="text-ink-2" />
              <CopyButton text={wallUrl} size="md" />
            </div>
          </Field>
        </section>

        <section className="space-y-4">
          <p className="text-sm font-medium">Brand</p>
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
            <Field label="Accent colour" htmlFor="accent" hint="Stars, links and the consent checkbox on public pages.">
              <div className="flex gap-2">
                <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(accent) ? accent : "#7858d8"} onChange={(e) => setAccent(e.target.value)} aria-label="Pick accent colour" className="h-10 w-12 cursor-pointer rounded-sm border border-line bg-paper p-1" />
                <Input id="accent" value={accent} onChange={(e) => setAccent(e.target.value)} className="font-mono" />
              </div>
            </Field>
            <Field label="Type on public pages" htmlFor="font">
              <div className="grid grid-cols-2 gap-2">
                {(["sans", "serif"] as const).map((f) => (
                  <label key={f} className={cn("cursor-pointer rounded-sm border p-3 text-center", font === f ? "border-ink bg-paper-2/60" : "border-line hover:border-ink-3", f === "serif" && "font-serif")}>
                    <input type="radio" className="sr-only" name="font" checked={font === f} onChange={() => setFont(f)} />
                    {f === "sans" ? "Sans" : "Serif"}
                  </label>
                ))}
              </div>
            </Field>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 min-w-14 items-center justify-center rounded-sm border border-line bg-paper-2 px-3">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="max-h-10 w-auto" />
              ) : (
                <span className="text-xs text-ink-3">No logo</span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" disabled={uploading} onClick={() => fileRef.current?.click()}>{uploading ? "Uploading…" : logo ? "Change logo" : "Upload logo"}</Button>
                {logo ? <Button type="button" size="sm" variant="ghost" onClick={() => setLogo(null)}>Remove</Button> : null}
              </div>
              <p className="text-xs text-ink-3">PNG or SVG with a transparent background works best. Scaled to 112px tall.</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }} />
          </div>
        </section>

        <section>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-0.5 h-4 w-4" checked={provenance} onChange={(e) => setProvenance(e.target.checked)} />
            <span>
              Show “see how this was collected” on new testimonials by default
              <span className="block text-xs text-ink-3">Each testimonial can still be switched individually from the share panel. The link opens the real interview or the import source.</span>
            </span>
          </label>
        </section>

        <section className="rounded-sm border border-line p-4 text-sm text-ink-2">
          <p><span className="font-medium text-ink">Signed in as</span> {email}</p>
          <p className="mt-1">Workspace slug <code className="rounded-sm bg-paper-2 px-1">{workspace.slug}</code>. It is part of your public links, so it stays fixed.</p>
        </section>

        {error ? <ErrorNote title={error} /> : null}
        <div className="flex items-center justify-end gap-3 border-t border-line pt-6">
          {saved ? <span className="text-sm text-ok">Saved</span> : null}
          <Button onClick={save} disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
        </div>
      </div>
    </div>
  );
}
