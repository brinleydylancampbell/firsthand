"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function RatingInput({ value, onChange }: { value: number | null; onChange: (n: number | null) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(value === n ? null : n)}
          className="p-0.5"
        >
          <svg width={28} height={28} viewBox="0 0 20 20" aria-hidden className={cn("transition-colors", n <= shown ? "text-ink" : "text-line")}>
            <path fill="currentColor" d="M10 1.8l2.5 5.3 5.7.7-4.2 4 1.1 5.7L10 14.7l-5.1 2.8 1.1-5.7-4.2-4 5.7-.7z" />
          </svg>
        </button>
      ))}
      <span className="ml-2 text-sm text-ink-3">{value ? `${value} of 5` : "Optional"}</span>
    </div>
  );
}
