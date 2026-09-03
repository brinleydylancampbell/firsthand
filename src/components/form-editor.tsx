"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteForm, saveForm } from "@/app/app/forms/actions";
import { DEFAULT_QUESTIONS, type Form, type FormMode, type Workspace } from "@/lib/types";
import { appUrl, cn, slugify } from "@/lib/utils";
import { Button, ErrorNote, Field, Input, Textarea } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";

export function FormEditor({ form, workspace }: { form: Form; workspace: Workspace }) {
  const [title, setTitle] = useState(form.title);
  const [slug, setSlug] = useState(form.slug);
  const [intro, setIntro] = useState(form.intro ?? "");
  const [mode, setMode] = useState<FormMode>(form.mode);
  const [questions, setQuestions] = useState<string[]>(form.questions?.length ? form.questions : DEFAULT_QUESTIONS);
  const [incentive, setIncentive] = useState(form.incentive ?? "");
  const [thankYou, setThankYou] = useState(form.thank_you ?? "");
  const [voice, setVoice] = useState(form.voice_enabled);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const url = appUrl(`/f/${workspace.slug}/${slugify(slug) || "form"}`);

  function save() {
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await saveForm(form.id, { title, slug, intro, questions, incentive, thank_you: thankYou, mode, voice_enabled: voice });
      if (!res.ok) setError(res.message);
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  function setQ(i: number, v: string) {
    setQuestions((qs) => qs.map((q, j) => (j === i ? v : q)));
  }
  function move(i: number, d: -1 | 1) {
    setQuestions((qs) => {
      const j = i + d;
      if (j < 0 || j >= qs.length) return qs;
      const next = [...qs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link href="/app/collect" className="text-sm text-ink-2 hover:text-ink">← Collect</Link>
      <header className="mt-4 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">{title || "Untitled"}</h1>
        </div>
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
          <Field label="Intro" htmlFor="intro" className="sm:col-span-2">
            <Textarea id="intro" value={intro} onChange={(e) => setIntro(e.target.value)} className="min-h-20" />
          </Field>
        </section>

        <section>
          <p className="text-sm font-medium">Mode</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(
              [
                ["chat", "Interview", "A short conversation. Each question follows from the last answer, and the testimonial is drafted from their words for them to approve."],
                ["classic", "Classic form", "Name, rating, a text box. Fast and familiar. Still ends with the consent and identity step."],
              ] as Array<[FormMode, string, string]>
            ).map(([m, label, desc]) => (
              <label key={m} className={cn("cursor-pointer rounded-2xl border p-4", mode === m ? "border-accent bg-accent-soft" : "border-line hover:border-line-strong")}>
                <input type="radio" className="sr-only" checked={mode === m} onChange={() => setMode(m)} name="mode" />
                <span className="block font-medium">{label}</span>
                <span className="mt-1 block text-sm text-ink-2">{desc}</span>
              </label>
            ))}
          </div>
        </section>

        {mode === "chat" ? (
          <section>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">Interview script</p>
              <p className="text-xs text-ink-3">{questions.length} of 8 · the order matters</p>
            </div>
            <p className="mt-1 text-sm text-ink-2">These are the topics, in order. The interviewer rephrases each one so it follows from what the customer just said.</p>
            <ol className="mt-3 space-y-2">
              {questions.map((q, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-5 text-right text-sm text-ink-3">{i + 1}</span>
                  <Input value={q} onChange={(e) => setQ(i, e.target.value)} aria-label={`Question ${i + 1}`} />
                  <Button type="button" size="sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => move(i, 1)} disabled={i === questions.length - 1} aria-label="Move down">↓</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))} disabled={questions.length <= 2} aria-label="Remove">×</Button>
                </li>
              ))}
            </ol>
            <div className="mt-3 flex gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => setQuestions((qs) => [...qs, ""])} disabled={questions.length >= 8}>Add a question</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setQuestions(DEFAULT_QUESTIONS)}>Reset to default</Button>
            </div>
            <label className="mt-4 flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4" checked={voice} onChange={(e) => setVoice(e.target.checked)} />
              <span>
                Offer voice input
                <span className="block text-xs text-ink-3">A speak button appears where the browser supports it. Typing always stays available.</span>
              </span>
            </label>
          </section>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Incentive line" htmlFor="incentive" hint="Optional. Shown on the form and the thank-you page.">
            <Input id="incentive" value={incentive} onChange={(e) => setIncentive(e.target.value)} placeholder="Leave a review, get 10% off your next order" />
          </Field>
          <Field label="Thank-you heading" htmlFor="thanks" hint="Optional.">
            <Input id="thanks" value={thankYou} onChange={(e) => setThankYou(e.target.value)} placeholder="That means a lot. Here is what you said." />
          </Field>
        </section>

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
