"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { cancelAsk, rotateSecret, saveAskSettings, sendTestEvent, setAskMode } from "@/app/app/asks/actions";
import { DEFAULT_ASK_BODY, DEFAULT_ASK_SUBJECT } from "@/lib/email";
import type { Ask, Workspace } from "@/lib/types";
import { appUrl, cn, relativeDate } from "@/lib/utils";
import { Badge, Button, ErrorNote, Field, Input, Textarea } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";

const statusTone = { draft: "neutral", scheduled: "accent", sent: "ok", completed: "ok", cancelled: "outline" } as const;

export function AsksView({
  workspace,
  asks,
  preview,
  formSlug,
}: {
  workspace: Workspace;
  asks: Ask[];
  preview: { subject: string; html: string };
  formSlug: string;
}) {
  const [delay, setDelay] = useState(workspace.ask_delay_days);
  const [subject, setSubject] = useState(workspace.ask_subject ?? DEFAULT_ASK_SUBJECT);
  const [body, setBody] = useState(workspace.ask_body ?? DEFAULT_ASK_BODY);
  const [showSecret, setShowSecret] = useState(false);
  const [confirmLive, setConfirmLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const live = workspace.ask_mode === "live";
  const hookUrl = appUrl(`/api/hooks/${workspace.slug}`);
  const queued = asks.filter((a) => a.status === "draft" || a.status === "scheduled");
  const curl = `curl -X POST ${hookUrl} \\
  -H "Authorization: Bearer ${showSecret ? workspace.webhook_secret : "YOUR_SECRET"}" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"jane@example.com","name":"Jane Doe","order_ref":"INV-1042","delivered_at":"2026-09-01T10:00:00Z"}'`;

  function run(fn: () => Promise<{ ok: boolean; message?: string }>, okNotice?: string) {
    setError(null);
    setNotice(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) setError(res.message ?? "Something went wrong.");
      else if (okNotice) setNotice(okNotice);
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link href="/app/collect" className="text-sm text-ink-2 hover:text-ink">← Collect</Link>
      <header className="mt-4 mb-6">
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Ask at the right moment</h1>
        <p className="mt-2 text-sm text-ink-2">
          Your order or job system posts one line of JSON when something is delivered. Firsthand waits the delay you set, then emails a link to your form. Same-day asks get answered; asks a month later mostly don’t.
        </p>
      </header>

      {/* Mode */}
      <section className={cn("rounded-2xl border p-5", live ? "border-ok/40 bg-ok/5" : "border-line bg-paper-2/50")}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-medium">{live ? "Live. Due asks are being sent." : "Draft mode. Nothing sends."}</p>
            <p className="mt-1 text-sm text-ink-2">
              {live
                ? `${queued.length} scheduled. Switch back to draft at any time and they pause.`
                : queued.length
                  ? `${queued.length} waiting. Check the email below and the first recipients, then go live.`
                  : "Connect your system and asks collect here. You review the exact email before anything goes out."}
            </p>
          </div>
          {live ? (
            <Button variant="secondary" disabled={pending} onClick={() => run(() => setAskMode("draft"), "Paused. Nothing will send.")}>Pause sending</Button>
          ) : confirmLive ? (
            <div className="flex items-center gap-2">
              <Button disabled={pending} onClick={() => { setConfirmLive(false); run(() => setAskMode("live"), "Live. Due asks send within 15 minutes."); }}>Yes, go live</Button>
              <Button variant="ghost" onClick={() => setConfirmLive(false)}>Cancel</Button>
            </div>
          ) : (
            <Button disabled={pending} onClick={() => setConfirmLive(true)}>Go live</Button>
          )}
        </div>
        {confirmLive ? (
          <p className="mt-3 text-sm text-ink-2">
            Going live sends the email below to {queued.length ? `${queued.length} queued ${queued.length === 1 ? "person" : "people"} as they come due` : "each person as they come due"}, and to everyone your system posts from now on. You can pause at any time.
          </p>
        ) : null}
      </section>

      {error ? <div className="mt-4"><ErrorNote title={error} /></div> : null}
      {notice ? <p className="mt-4 text-sm text-ok">{notice}</p> : null}

      {/* Preview */}
      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          <p className="text-sm font-medium">The email, exactly as it sends</p>
          <div className="mt-2 overflow-hidden rounded-lg border border-line">
            <p className="border-b border-line bg-paper-2 px-4 py-2 text-sm"><span className="text-ink-3">Subject:</span> {preview.subject}</p>
            <iframe title="Email preview" srcDoc={preview.html} className="h-[420px] w-full bg-white" sandbox="" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">First recipients</p>
          {queued.length ? (
            <ul className="mt-2 divide-y divide-line rounded-2xl border border-line text-sm">
              {queued.slice(0, 5).map((a) => (
                <li key={a.id} className="px-3 py-2">
                  <p className="truncate font-medium">{a.name || a.email}</p>
                  <p className="truncate text-xs text-ink-3">{a.email}{a.order_ref ? ` · ${a.order_ref}` : ""}</p>
                  <p className="text-xs text-ink-3" suppressHydrationWarning>Sends {new Date(a.send_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-ink-3">Nobody queued yet. Send a test event to see one appear.</p>
          )}
          <Button variant="secondary" size="sm" className="mt-3" disabled={pending} onClick={() => run(sendTestEvent, "Test event received. It is in the queue below.")}>
            Send a test event
          </Button>
        </div>
      </section>

      {/* Settings */}
      <section className="mt-10 space-y-4">
        <p className="text-sm font-medium">Timing and copy</p>
        <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
          <Field label="Days after delivery" htmlFor="delay" hint="0 sends at the next run.">
            <Input id="delay" type="number" min={0} max={60} value={delay} onChange={(e) => setDelay(Number(e.target.value))} />
          </Field>
          <Field label="Subject" htmlFor="subject">
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
        </div>
        <Field label="Email body" htmlFor="body" hint="Placeholders: {{name}} is their first name, {{link}} becomes the button, {{workspace}} is your name.">
          <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-44" />
        </Field>
        <Button disabled={pending} onClick={() => run(() => saveAskSettings({ ask_delay_days: delay, ask_subject: subject, ask_body: body }), "Saved. The preview above updates.")}>
          Save
        </Button>
      </section>

      {/* Webhook */}
      <section className="mt-10 space-y-3">
        <p className="text-sm font-medium">Connect your system</p>
        <p className="text-sm text-ink-2">
          POST JSON to this address with your secret as a bearer token. Works from any order system, Zapier, Make or a shell script.{" "}
          <Link href="/docs/webhook" className="underline underline-offset-2 hover:text-ink">Full docs</Link>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded-2xl border border-line bg-paper-2 px-2 py-1 text-xs">{hookUrl}</code>
          <CopyButton text={hookUrl} label="Copy URL" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded-2xl border border-line bg-paper-2 px-2 py-1 text-xs">{showSecret ? workspace.webhook_secret : "•".repeat(24)}</code>
          <Button size="sm" variant="ghost" onClick={() => setShowSecret((s) => !s)}>{showSecret ? "Hide" : "Reveal"}</Button>
          <CopyButton text={workspace.webhook_secret} label="Copy secret" />
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => { if (confirm("Rotate the secret? Anything using the old one stops working.")) run(rotateSecret, "Secret rotated."); }}>Rotate</Button>
        </div>
        <pre className="overflow-x-auto rounded-2xl border border-line bg-paper-2 p-4 text-xs leading-relaxed"><code>{curl}</code></pre>
        <p className="text-xs text-ink-3">Links point to your <span className="text-ink">{formSlug}</span> form. The order reference is stored with the testimonial as provenance.</p>
      </section>

      {/* Queue */}
      <section className="mt-10">
        <p className="text-sm font-medium">Recent asks</p>
        {asks.length === 0 ? (
          <p className="mt-2 text-sm text-ink-3">None yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line rounded-2xl border border-line bg-card text-sm">
            {asks.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.name || a.email}</p>
                  <p className="truncate text-xs text-ink-3" suppressHydrationWarning>{a.email}{a.order_ref ? ` · ${a.order_ref}` : ""} · created {relativeDate(a.created_at)}</p>
                </div>
                <span className="text-xs text-ink-3" suppressHydrationWarning>{a.status === "sent" && a.sent_at ? `sent ${relativeDate(a.sent_at)}` : `due ${new Date(a.send_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}</span>
                <Badge tone={statusTone[a.status]}>{a.status}</Badge>
                {a.status === "draft" || a.status === "scheduled" ? (
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => cancelAsk(a.id))}>Cancel</Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
