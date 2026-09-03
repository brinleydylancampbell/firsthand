import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Primitives. Rounded grammar, one accent, purple only where you act. */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-transparent font-medium whitespace-nowrap transition-[background-color,color,transform,box-shadow] duration-150 select-none outline-none focus-visible:outline-3 focus-visible:outline-accent-strong focus-visible:outline-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-hover",
  secondary: "border-line bg-card text-ink hover:bg-paper-2",
  ghost: "text-ink-2 hover:bg-paper-2 hover:text-ink",
  danger: "bg-danger-soft text-danger hover:bg-danger/15",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded-lg",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra?: string) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], extra);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export const inputClass =
  "w-full h-11 rounded-xl border border-line-strong/60 bg-card px-3.5 text-base text-ink placeholder:text-ink-3 transition-colors hover:border-line-strong focus:border-accent focus:outline-none focus:ring-3 focus:ring-accent/20 disabled:opacity-50 read-only:bg-paper-2 read-only:text-ink-2";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputClass, "h-auto min-h-28 resize-y py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        inputClass,
        "appearance-none pr-9 bg-no-repeat bg-[right_0.75rem_center] bg-[length:14px] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22><path d=%22M5.5 7.5l4.5 4.5 4.5-4.5%22 stroke=%22%237c786e%22 stroke-width=%221.6%22 fill=%22none%22 stroke-linecap=%22round%22/></svg>')]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("block text-sm font-medium text-ink", className)} {...props} />;
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-sm text-ink-3">{hint}</p> : null}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: "neutral" | "accent" | "ok" | "danger" | "outline";
  className?: string;
  children: ReactNode;
}) {
  const tones = {
    neutral: "bg-paper-2 text-ink-2",
    accent: "bg-accent-soft text-accent-strong",
    ok: "bg-ok-soft text-ok",
    danger: "bg-danger-soft text-danger",
    outline: "border border-line text-ink-2 bg-card",
  };
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-2xl border border-line bg-card shadow-card", className)} {...props} />;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-line-strong/40 bg-card/60 p-8">
      <div>
        <p className="font-medium text-ink">{title}</p>
        <p className="mt-1 text-sm text-ink-2">{body}</p>
      </div>
      {action}
    </div>
  );
}

export function ErrorNote({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div role="alert" className="rounded-xl bg-danger-soft p-4 text-sm">
      <p className="font-medium text-danger">{title}</p>
      {body ? <p className="mt-1 text-ink-2">{body}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton h-4 w-full", className)} />;
}

export function Stars({ rating, size = 14, className }: { rating: number | null; size?: number; className?: string }) {
  if (!rating) return null;
  return (
    <span role="img" className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden className={i <= rating ? "text-accent" : "text-line"}>
          <path fill="currentColor" d="M10 1.8l2.5 5.3 5.7.7-4.2 4 1.1 5.7L10 14.7l-5.1 2.8 1.1-5.7-4.2-4 5.7-.7z" />
        </svg>
      ))}
    </span>
  );
}

export function Avatar({
  src,
  name,
  size = 36,
  className,
}: {
  src: string | null | undefined;
  name: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const letters = (name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className={cn("shrink-0 rounded-full object-cover bg-paper-2", className)}
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-heading font-semibold text-accent-strong", className)}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
    >
      {letters || "•"}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-line bg-card px-1 font-mono text-[11px] text-ink-2">
      {children}
    </kbd>
  );
}
