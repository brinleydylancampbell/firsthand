"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { sendMagicLink, type LoginState } from "@/app/login/actions";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * The one action on the page: an email, one button, a magic link into the
 * shared demo workspace. Used inline in the hero and inside the dialog that
 * every other "Sign in to the demo" button opens, so it is the same two fields
 * wherever the visitor decides.
 */
export function DemoForm({ size = "lg", autoFocus = false, className }: { size?: "md" | "lg"; autoFocus?: boolean; className?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, null);
  const id = useId();

  if (state?.ok) {
    return (
      <div className={cn("rounded-2xl border border-line bg-card p-5 text-left shadow-card", className)} role="status">
        <p className="font-heading text-lg font-semibold">Check your inbox</p>
        <p className="mt-1 site-body text-ink-2">
          A sign-in link is on its way to <span className="text-ink">{state.email}</span>. Open it in this browser and you land in the demo dashboard.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className={cn("w-full", className)}>
      <input type="hidden" name="join" value="demo" />
      <input type="hidden" name="next" value="/app" />
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-stretch", size === "lg" ? "sm:gap-2" : "")}>
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus={autoFocus}
          placeholder="you@company.com"
          className={cn(
            "min-w-0 flex-1 rounded-xl border border-line-strong/60 bg-card px-4 text-ink placeholder:text-ink-3 transition-colors hover:border-line-strong focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/20",
            size === "lg" ? "h-[52px] text-base" : "h-11 text-sm",
          )}
        />
        <Button type="submit" size={size === "lg" ? "lg" : "md"} disabled={pending} className={cn(size === "lg" && "h-[52px] px-6")}>
          {pending ? "Sending…" : "Sign in to the demo"}
        </Button>
      </div>
      <p className={cn("mt-2.5 site-meta text-ink-3", state && !state.ok && "text-danger")}>
        {state && !state.ok ? state.message : "Any email works. It is a real workspace with twelve testimonials waiting, and it resets overnight."}
      </p>
    </form>
  );
}

/** A button that opens the same form in a native dialog. */
export function DemoButton({ children = "Sign in to the demo", className, size = "md" }: { children?: React.ReactNode; className?: string; size?: "md" | "lg" }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      if (e.target === el) el.close();
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <Button type="button" size={size} className={className} onClick={() => ref.current?.showModal()}>
        {children}
      </Button>
      <dialog
        ref={ref}
        className="m-auto w-[min(92vw,30rem)] rounded-3xl border border-line bg-card p-0 text-ink shadow-card backdrop:bg-ink/40 backdrop:backdrop-blur-sm open:animate-[site-rise_320ms_var(--ease-out-expo)_both]"
        aria-labelledby="demo-dialog-title"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="demo-dialog-title" className="text-xl font-semibold">
                Sign in to the demo
              </h2>
              <p className="mt-1 site-body text-ink-2">A shared workspace, Harbour Bookkeeping. Approve, search, build a widget. No password.</p>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close"
              className="-mr-2 -mt-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2 hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="mt-6">
            <DemoForm size="md" autoFocus />
          </div>
        </div>
      </dialog>
    </>
  );
}
