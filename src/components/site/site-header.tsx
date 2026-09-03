"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";
import { DemoButton } from "./demo-form";
import { cn } from "@/lib/utils";

/**
 * The mark and the one thing we want clicked. No menu: a single-screen page
 * has no navigation problem to solve, and links only offer a way to skip the
 * argument. Full width over the hero, condensing to a floating pill once the
 * page has moved.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-2">
      <div
        className={cn(
          "mx-auto mt-2 transition-all duration-300 motion-reduce:transition-none",
          scrolled ? "max-w-3xl rounded-2xl border border-line bg-paper/80 px-4 shadow-card backdrop-blur-lg sm:px-5" : "max-w-6xl border border-transparent px-5 sm:px-8",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-6">
          <Logo size={30} priority className="min-h-11" />
          <DemoButton className="h-11 px-5 site-meta font-medium">Sign in to the demo</DemoButton>
        </div>
      </div>
    </header>
  );
}
