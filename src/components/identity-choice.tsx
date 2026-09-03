"use client";

import type { IdentityMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export function IdentityChoice({
  value,
  onChange,
  name,
  role,
  company,
}: {
  value: IdentityMode;
  onChange: (m: IdentityMode) => void;
  name: string;
  role: string;
  company: string;
}) {
  const first = name.trim().split(/\s+/)[0] || "You";
  const full = name.trim() || "Your name";
  const options: Array<{ mode: IdentityMode; label: string; preview: string }> = [
    {
      mode: "full",
      label: "Full name and company",
      preview: [full, [role, company].filter(Boolean).join(", ")].filter(Boolean).join(" · "),
    },
    {
      mode: "first_role",
      label: "First name and role",
      preview: [first, role].filter(Boolean).join(" · "),
    },
    { mode: "anonymous", label: "Anonymous", preview: "Verified customer" },
  ];

  return (
    <fieldset>
      <legend className="text-sm font-medium">How should we show you?</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <label
            key={o.mode}
            className={cn(
              "cursor-pointer rounded-2xl border p-3 transition-colors",
              value === o.mode ? "border-accent bg-accent-soft" : "border-line hover:border-line-strong",
            )}
          >
            <input
              type="radio"
              name="identity_choice"
              className="sr-only"
              checked={value === o.mode}
              onChange={() => onChange(o.mode)}
            />
            <span className="block text-sm font-medium">{o.label}</span>
            <span className="mt-1 block truncate text-sm text-ink-2">{o.preview}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
