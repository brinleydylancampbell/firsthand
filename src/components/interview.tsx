"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { submitInterview, type SubmitState } from "@/app/f/actions";
import type { Form, IdentityMode, InterviewTurn, Workspace } from "@/lib/types";
import { consentText, DEFAULT_QUESTIONS } from "@/lib/types";
import { cn, hostOf, wordCount } from "@/lib/utils";
import { Button, ErrorNote, Field, Input, Textarea } from "@/components/ui";
import { AvatarPicker } from "@/components/avatar-picker";
import { IdentityChoice } from "@/components/identity-choice";
import { RatingInput } from "@/components/rating-input";
import { MicButton } from "@/components/mic-button";

type Stage = "asking" | "review";

async function readStream(res: Response, onChunk: (soFar: string) => void, signal?: AbortSignal): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    if (signal?.aborted) break;
    const { value, done } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onChunk(text);
  }
  return text.trim();
}

export function Interview({ workspace, form, askToken }: { workspace: Workspace; form: Form; askToken?: string }) {
  const total = form.questions?.length ? form.questions.length : DEFAULT_QUESTIONS.length;

  const [id, setId] = useState<string | null>(null);
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState("");
  const [draft, setDraft] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [stage, setStage] = useState<Stage>("asking");
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);
  const draftAbort = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const answered = turns.filter((t) => t.role === "customer").length;

  const ask = useCallback(
    async (history: InterviewTurn[], currentId: string | null) => {
      setAsking(true);
      setQuestion("");
      setError(null);
      try {
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: currentId, ws: workspace.slug, form: form.slug, ask: askToken ?? null, turns: history }),
        });
        if (!res.ok && res.status !== 204) throw new Error("The interview could not continue.");
        const newId = res.headers.get("X-Testimonial-Id");
        if (newId) setId(newId);
        if (res.status === 204) {
          setStage("review");
          return;
        }
        const q = await readStream(res, setQuestion);
        setQuestion(q);
        setTurns([...history, { role: "interviewer", text: q }]);
        setTimeout(() => textareaRef.current?.focus(), 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setAsking(false);
      }
    },
    [workspace.slug, form.slug, askToken],
  );

  const redraft = useCallback(
    async (history: InterviewTurn[]) => {
      draftAbort.current?.abort();
      const ctrl = new AbortController();
      draftAbort.current = ctrl;
      setDrafting(true);
      try {
        const res = await fetch("/api/interview/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ws: workspace.slug, form: form.slug, turns: history }),
          signal: ctrl.signal,
        });
        if (res.status === 204 || !res.ok) return;
        const text = await readStream(res, (t) => setDraft(t), ctrl.signal);
        if (!ctrl.signal.aborted) setDraft(text);
      } catch {
        // Aborted or failed. Keep whatever draft we had.
      } finally {
        if (draftAbort.current === ctrl) setDrafting(false);
      }
    },
    [workspace.slug, form.slug],
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void ask([], null);
  }, [ask]);

  function send() {
    const text = answer.trim();
    if (!text || asking) return;
    const history: InterviewTurn[] = [...turns, { role: "customer", text }];
    setTurns(history);
    setAnswer("");
    void redraft(history);
    void ask(history, id);
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const past = useMemo(() => {
    const pairs: Array<{ q: string; a: string }> = [];
    for (let i = 0; i < turns.length; i++) {
      if (turns[i].role === "interviewer" && turns[i + 1]?.role === "customer") {
        pairs.push({ q: turns[i].text, a: turns[i + 1].text });
        i++;
      }
    }
    return pairs;
  }, [turns]);

  if (stage === "review") {
    return (
      <ReviewStage
        workspace={workspace}
        form={form}
        id={id}
        askToken={askToken}
        draft={draft}
        drafting={drafting}
        transcript={turns}
        onRestart={() => {
          setStage("asking");
          setTurns([]);
          setDraft("");
          setId(null);
          started.current = false;
          void ask([], null);
        }}
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
      <section aria-label="Conversation" className="min-w-0">
        <p className="label-sm">
          Question {Math.min(answered + 1, total)} of {total}
        </p>

        {past.length ? (
          <ol className="mt-5 space-y-5 border-l border-line pl-5">
            {past.map((p, i) => (
              <li key={i}>
                <p className="text-sm text-ink-2">{p.q}</p>
                <p className="mt-1 font-serif text-[1.05rem] leading-relaxed">{p.a}</p>
              </li>
            ))}
          </ol>
        ) : null}

        <div className="mt-8">
          <p className={cn("min-h-14 text-lg font-medium leading-snug transition-opacity", asking && !question && "opacity-50")}>
            {question || (asking ? <span className="skeleton inline-block h-6 w-3/4 align-middle" /> : null)}
          </p>

          <div className="mt-4">
            <Textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={onKey}
              disabled={asking}
              placeholder={asking ? "" : "Type as you’d say it out loud…"}
              className="min-h-32 font-serif text-lg leading-relaxed"
              aria-label="Your answer"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs text-ink-3">Enter to send · Shift+Enter for a new line</p>
              <div className="flex items-center gap-2">
                {form.voice_enabled ? <MicButton onText={(t) => setAnswer((a) => (a ? `${a} ${t}` : t))} disabled={asking} /> : null}
                <Button onClick={send} disabled={asking || !answer.trim()}>
                  {answered + 1 >= total ? "Finish" : "Next"}
                </Button>
              </div>
            </div>
          </div>
          {error ? (
            <div className="mt-4">
              <ErrorNote title={error} body="Your answers so far are kept." action={<Button size="sm" variant="secondary" onClick={() => void ask(turns, id)}>Try again</Button>} />
            </div>
          ) : null}
        </div>
      </section>

      <DraftPanel draft={draft} drafting={drafting} answered={answered} />
    </div>
  );
}

function DraftPanel({ draft, drafting, answered }: { draft: string; drafting: boolean; answered: number }) {
  return (
    <aside aria-label="Your testimonial so far" className="lg:sticky lg:top-8 lg:self-start">
      <div className="rounded-2xl border border-line bg-paper-2/70 p-5">
        <div className="flex items-center justify-between">
          <p className="label-sm">Your testimonial</p>
          {drafting ? <span className="text-xs text-ink-3">Updating…</span> : draft ? <span className="text-xs text-ink-3">{wordCount(draft)} words</span> : null}
        </div>
        {draft ? (
          <p className="mt-3 font-serif text-lg leading-relaxed">{draft}</p>
        ) : (
          <p className="mt-3 text-sm text-ink-3">{answered === 0 ? "It takes shape here as you answer. Nothing is sent until you approve it." : "Drafting…"}</p>
        )}
        <p className="mt-4 text-xs text-ink-3">Written from your answers, in your words. You edit or approve it at the end.</p>
      </div>
    </aside>
  );
}

function ReviewStage({
  workspace,
  form,
  id,
  askToken,
  draft,
  drafting,
  transcript,
  onRestart,
}: {
  workspace: Workspace;
  form: Form;
  id: string | null;
  askToken?: string;
  draft: string;
  drafting: boolean;
  transcript: InterviewTurn[];
  onRestart: () => void;
}) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitInterview, null);
  const [body, setBody] = useState(draft);
  const [touched, setTouched] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [identity, setIdentity] = useState<IdentityMode>("full");
  const host = useMemo(() => hostOf(website), [website]);

  // Keep following the stream until the customer starts editing.
  const shown = touched ? body : draft;

  return (
    <form action={action} className="space-y-10">
      <input type="hidden" name="id" value={id ?? ""} />
      <input type="hidden" name="ws_slug" value={workspace.slug} />
      <input type="hidden" name="form_slug" value={form.slug} />
      {askToken ? <input type="hidden" name="ask" value={askToken} /> : null}
      <input type="hidden" name="avatar_url" value={avatarUrl ?? ""} />
      <input type="hidden" name="identity_mode" value={identity} />
      <input type="hidden" name="rating" value={rating ?? ""} />
      <input type="hidden" name="transcript" value={JSON.stringify(transcript)} />

      <section>
        <h2 className="mt-1 text-lg font-semibold">Does this sound like you?</h2>
        <p className="mt-1 text-sm text-ink-2">Written from your answers, in your words. Change anything you like.</p>
        <Textarea
          name="body"
          value={shown}
          onChange={(e) => {
            setTouched(true);
            setBody(e.target.value);
          }}
          className="mt-4 min-h-40 font-serif text-lg leading-relaxed"
          aria-label="Your testimonial"
          required
          minLength={10}
        />
        <div className="mt-2 flex items-center justify-between text-xs text-ink-3">
          <span>{drafting && !touched ? "Finishing the draft…" : `${wordCount(shown)} words`}</span>
          <button type="button" onClick={onRestart} className="underline underline-offset-2 hover:text-ink">
            Start over
          </button>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-lg font-semibold">About you</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" htmlFor="author_name">
            <Input id="author_name" name="author_name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required={identity !== "anonymous"} />
          </Field>
          <Field label="Email" htmlFor="author_email" hint="Never shown.">
            <Input id="author_email" name="author_email" type="email" autoComplete="email" />
          </Field>
          <Field label="Role" htmlFor="author_role">
            <Input id="author_role" name="author_role" value={role} onChange={(e) => setRole(e.target.value)} />
          </Field>
          <Field label="Company" htmlFor="author_company">
            <Input id="author_company" name="author_company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </Field>
          <Field label="Website" htmlFor="author_url" hint={host ? `We’ll use ${host}’s icon unless you add a photo.` : "Optional."} className="sm:col-span-2">
            <Input id="author_url" name="author_url" value={website} onChange={(e) => setWebsite(e.target.value)} inputMode="url" placeholder="yourcompany.com" />
          </Field>
        </div>
        <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} fallbackHost={host} name={name} />
        <Field label="How would you rate it?" htmlFor="rating">
          <RatingInput value={rating} onChange={setRating} />
        </Field>
      </section>

      <section className="space-y-5">
        <IdentityChoice value={identity} onChange={setIdentity} name={name} role={role} company={company} />
        <div className="rounded-2xl border border-line bg-card p-4">
          <label className="flex items-start gap-3">
            <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-[var(--accent)]" required />
            <span className="text-sm leading-relaxed">{consentText(workspace.name)}</span>
          </label>
          <p className="mt-3 text-sm text-ink-2">
            <span className="font-medium text-ink">Where it will appear:</span> {workspace.name}’s wall of love and website, and testimonial widgets on pages they control.
            They review it first. The conversation above is kept as the record of how it was written.
          </p>
        </div>
        {state?.message ? <ErrorNote title={state.message} /> : null}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={pending || (drafting && !touched)}>
            {pending ? "Sending…" : "Approve and send"}
          </Button>
        </div>
      </section>
    </form>
  );
}
