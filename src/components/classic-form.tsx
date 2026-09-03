"use client";

import { useActionState, useMemo, useState } from "react";
import { submitClassic, type SubmitState } from "@/app/f/actions";
import type { Form, IdentityMode, Workspace } from "@/lib/types";
import { consentText } from "@/lib/types";
import { cn, hostOf } from "@/lib/utils";
import { Button, ErrorNote, Field, Input, Textarea } from "@/components/ui";
import { AvatarPicker } from "@/components/avatar-picker";
import { IdentityChoice } from "@/components/identity-choice";
import { RatingInput } from "@/components/rating-input";

export function ClassicForm({ workspace, form, askToken }: { workspace: Workspace; form: Form; askToken?: string }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitClassic, null);
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [identity, setIdentity] = useState<IdentityMode>("full");

  const host = useMemo(() => hostOf(website), [website]);
  const canContinue = body.trim().length >= 10 && name.trim().length > 0;

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="workspace_id" value={workspace.id} />
      <input type="hidden" name="form_id" value={form.id} />
      <input type="hidden" name="ws_slug" value={workspace.slug} />
      <input type="hidden" name="form_slug" value={form.slug} />
      {askToken ? <input type="hidden" name="ask" value={askToken} /> : null}
      <input type="hidden" name="avatar_url" value={avatarUrl ?? ""} />
      <input type="hidden" name="identity_mode" value={identity} />
      <input type="hidden" name="rating" value={rating ?? ""} />

      <ol className="flex gap-4 text-sm">
        <li className={cn(step === 1 ? "text-ink" : "text-ink-3")}>1. Your words</li>
        <li className={cn(step === 2 ? "text-ink" : "text-ink-3")}>2. Permission</li>
      </ol>

      <section className={cn("space-y-6", step !== 1 && "hidden")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" htmlFor="author_name">
            <Input id="author_name" name="author_name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </Field>
          <Field label="Email" htmlFor="author_email" hint="Never shown. Only so we can reach you about this.">
            <Input id="author_email" name="author_email" type="email" autoComplete="email" />
          </Field>
          <Field label="Role" htmlFor="author_role">
            <Input id="author_role" name="author_role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Founder" />
          </Field>
          <Field label="Company" htmlFor="author_company">
            <Input id="author_company" name="author_company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </Field>
          <Field label="Website" htmlFor="author_url" hint={host ? `We’ll use ${host}’s icon unless you add a photo.` : "Optional. We can pull your site’s icon as your picture."} className="sm:col-span-2">
            <Input id="author_url" name="author_url" value={website} onChange={(e) => setWebsite(e.target.value)} inputMode="url" placeholder="yourcompany.com" />
          </Field>
        </div>

        <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} fallbackHost={host} name={name} />

        <Field label="How would you rate it?" htmlFor="rating">
          <RatingInput value={rating} onChange={setRating} />
        </Field>

        <Field label="What would you tell someone who is on the fence?" htmlFor="body" hint="A few sentences in your own words. What it was like before, what changed.">
          <Textarea id="body" name="body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-40 font-serif text-lg leading-relaxed" required minLength={10} />
        </Field>

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-ink-3">Nothing is published yet. Next you choose how you appear.</p>
          <Button type="button" size="lg" disabled={!canContinue} onClick={() => setStep(2)}>
            Continue
          </Button>
        </div>
      </section>

      <section className={cn("space-y-6", step !== 2 && "hidden")}>
        <IdentityChoice value={identity} onChange={setIdentity} name={name} role={role} company={company} />

        <div className="rounded-2xl border border-line bg-card p-4">
          <label className="flex items-start gap-3">
            <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-[var(--accent)]" required />
            <span className="text-sm leading-relaxed">{consentText(workspace.name)}</span>
          </label>
          <p className="mt-3 text-sm text-ink-2">
            <span className="font-medium text-ink">Where it will appear:</span> {workspace.name}’s wall of love and website, and testimonial widgets on pages they control.
            They review it first, and you can ask for it to be removed at any time.
          </p>
        </div>

        {state?.message ? <ErrorNote title={state.message} /> : null}

        <div className="flex items-center justify-between gap-4">
          <Button type="button" variant="ghost" onClick={() => setStep(1)}>
            Back
          </Button>
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? "Sending…" : "Send it"}
          </Button>
        </div>
      </section>
    </form>
  );
}
