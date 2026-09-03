import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Small, boring primitives. 2px radius, sentence case, no pills. */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper hover:bg-ink/90",
  secondary: "border border-line bg-paper text-ink hover:bg-paper-2",
  ghost: "text-ink-2 hover:bg-paper-2 hover:text-ink",
  danger: "border border-line text-danger hover:bg-danger/5",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-2.5 text-sm",
  md: "h-9 px-3.5 text-sm",
  lg: "h-11 px-5 text-base",
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
  "w-full rounded-sm border border-line bg-paper px-3 py-2 text-base text-ink placeholder:text-ink-3 focus:border-ink focus:outline-none disabled:opacity-50";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(inputClass, "min-h-28 resize-y leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(inputClass, "appearance-none pr-8 bg-no-repeat bg-[right_0.6rem_center] bg-[length:14px] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%238c8c8c%22><path d=%22M5.5 7.5l4.5 4.5 4.5-4.5%22 stroke=%22%238c8c8c%22 stroke-width=%221.5%22 fill=%22none%22/></svg>')]", className)} {...props}>
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
    accent: "bg-accent/10 text-accent",
    ok: "bg-ok/10 text-ok",
    danger: "bg-danger/10 text-danger",
    outline: "border border-line text-ink-2",
  };
  return (
    <span className={cn("inline-flex h-6 items-center rounded-sm px-2 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-sm border border-line bg-paper", className)} {...props} />;
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-sm border border-dashed border-line p-8">
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
    <div role="alert" className="rounded-sm border border-danger/30 bg-danger/5 p-4 text-sm">
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
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden className={i <= rating ? "text-ink" : "text-line"}>
          <path
            fill="currentColor"
            d="M10 1.8l2.5 5.3 5.7.7-4.2 4 1.1 5.7L10 14.7l-5.1 2.8 1.1-5.7-4.2-4 5.7-.7z"
          />
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
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-paper-2 text-ink-2 font-medium", className)}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
    >
      {letters || "•"}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-line bg-paper-2 px-1 font-sans text-xs text-ink-2">
      {children}
    </kbd>
  );
}
