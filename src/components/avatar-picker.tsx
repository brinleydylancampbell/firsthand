"use client";

import { useRef, useState } from "react";
import { Avatar, Button } from "@/components/ui";

export function AvatarPicker({
  value,
  onChange,
  fallbackHost,
  name,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  fallbackHost?: string | null;
  name?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = value ?? (fallbackHost ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(fallbackHost)}&sz=128` : null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed.");
      onChange(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar src={preview} name={name} size={56} />
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => inputRef.current?.click()}>
            {busy ? "Uploading…" : value ? "Change photo" : "Add a photo"}
          </Button>
          {value ? (
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)}>
              Remove
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-ink-3">{error ?? "Optional. Resized to 128px, stored securely."}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
