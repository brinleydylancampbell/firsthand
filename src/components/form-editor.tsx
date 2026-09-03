"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteForm, saveForm } from "@/app/app/forms/actions";
import type { Form, Workspace } from "@/lib/types";
import { appUrl, slugify } from "@/lib/utils";
import { Button, ErrorNote, Field, Input, Textarea } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";

export function FormEditor({ form, workspace }: { form: Form; workspace: Workspace }) {
  const [title, setTitle] = useState(form.title);
  const [slug, setSlug] = useState(form.slug);
  const [intro, setIntro] = useState(form.intro ?? "");
  const [incentive, setIncentive] = useState(form.incentive ?? "");
  const [thankYou, setThankYou] = useState(form.thank_you ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const url = appUrl(`/f/${workspace.slug}/${slugify(slug) || "form"}`);

  function save() {
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await saveForm(form.id, { title, slug, intro, incentive, thank_you: thankYou });
      if (!res.ok) setError(res.message);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link href="/app/collect" className="text-sm text-ink-2 hover:text-ink">← Collect</Link>
      <header className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold">{title || "Untitled form"}</h1>
        <div className="flex items-center gap-2">
          <CopyButton text={url} label="Copy link" />
          <a href={url} target="_blank" rel="noreferrer" className="text-sm text-ink-2 underline underline-offset-2 hover:text-ink">Preview</a>
        </div>
      </header>

      <div className="space-y-8">
        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="title">
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Link" htmlFor="slug" hint={url.replace(/^https?:\/\//, "")}>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} onBlur={() => setSlug(slugify(slug))} />
          </Field>
          <Field label="Intro" htmlFor="intro" hint="One or two lines above the form." className="sm:col-span-2">
            <Textarea id="intro" value={intro} onChange={(e) => setIntro(e.target.value)} className="min-h-20" />
          </Field>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Incentive line" htmlFor="incentive" hint="Optional. Shown on the form and the thank-you page.">
            <Input id="incentive" value={incentive} onChange={(e) => setIncentive(e.target.value)} placeholder="Leave a review, get 10% off your next order" />
          </Field>
          <Field label="Thank-you heading" htmlFor="thanks" hint="Optional.">
            <Input id="thanks" value={thankYou} onChange={(e) => setThankYou(e.target.value)} placeholder="That means a lot. Here is what you said." />
          </Field>
        </section>

        <p className="text-sm text-ink-2">
          Every form asks for a name, a rating and a few sentences, then ends with the consent and identity step: full name, first name and role, or anonymous. That part is fixed so nothing without consent can ever be approved.
        </p>

        {error ? <ErrorNote title={error} /> : null}

        <div className="flex items-center justify-between border-t border-line pt-6">
          <form
            action={() => {
              if (confirm("Delete this form? Testimonials already collected are kept.")) return deleteForm(form.id);
            }}
          >
            <Button type="submit" variant="danger" size="sm">Delete form</Button>
          </form>
          <div className="flex items-center gap-3">
            {saved ? <span className="text-sm text-ok">Saved</span> : null}
            <Button onClick={save} disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
