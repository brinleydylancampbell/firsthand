"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/app", label: "Inbox", exact: true },
  { href: "/app/testimonials", label: "Testimonials" },
  { href: "/app/forms", label: "Forms" },
  { href: "/app/widgets", label: "Widgets" },
  { href: "/app/asks", label: "Asks" },
  { href: "/app/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0" aria-label="Dashboard">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-sm px-2 py-1.5 text-sm",
              active ? "bg-paper-2 font-medium text-ink" : "text-ink-2 hover:bg-paper-2 hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
