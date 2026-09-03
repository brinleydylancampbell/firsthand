import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Workspace } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

/**
 * Wrapper for every public page. Applies the workspace accent and font, shows
 * the logo or name, and credits the tool quietly at the bottom.
 */
export function BrandFrame({
  workspace,
  children,
  wide = false,
  dark = false,
}: {
  workspace: Workspace;
  children: ReactNode;
  wide?: boolean;
  dark?: boolean;
}) {
  const style = { "--accent": workspace.brand?.accent || undefined } as CSSProperties;
  return (
    <div className={cn("flex min-h-full flex-1 flex-col bg-paper text-ink", dark && "dark", workspace.brand?.font === "serif" && "font-serif")} style={style}>
      <header className={cn("mx-auto w-full px-6 pt-8", wide ? "max-w-6xl" : "max-w-2xl")}>
        <div className="flex items-center gap-3">
          {workspace.brand?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={workspace.brand.logo_url} alt="" className="h-7 w-auto" />
          ) : (
            <span aria-hidden className="inline-block h-2.5 w-2.5 bg-accent" />
          )}
          <span className="font-medium">{workspace.name}</span>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className={cn("mx-auto w-full px-6 py-8 text-xs text-ink-3", wide ? "max-w-6xl" : "max-w-2xl")}>
        <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
          Collected with <Logo size={16} className="text-xs font-medium underline-offset-2 hover:underline" />. Nothing here is published without the customer’s consent.
        </span>
      </footer>
    </div>
  );
}
