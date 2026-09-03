"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Four places. Testimonials is where the work is; Collect is how they arrive
 * (forms, asks); Show is where they go (wall, widgets); Settings is the rest.
 */
const items = [
  { href: "/app", label: "Testimonials", match: (p: string) => p === "/app" || p.startsWith("/app/testimonials") },
  { href: "/app/collect", label: "Collect", match: (p: string) => p.startsWith("/app/collect") || p.startsWith("/app/forms") || p.startsWith("/app/asks") },
  { href: "/app/show", label: "Show", match: (p: string) => p.startsWith("/app/show") || p.startsWith("/app/widgets") },
  { href: "/app/settings", label: "Settings", match: (p: string) => p.startsWith("/app/settings") },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0" aria-label="Dashboard">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm transition-colors",
              active ? "bg-card font-medium text-ink shadow-card" : "text-ink-2 hover:bg-paper-2 hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
