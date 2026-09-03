import { createHash } from "node:crypto";
import { hostOf } from "./utils";

/** Google's favicon service, 128px, for a customer's website. */
export function faviconUrl(website: string | null | undefined): string | null {
  const host = hostOf(website);
  if (!host) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
}

/** Gravatar URL only if the address actually has one. */
export async function gravatarUrl(email: string | null | undefined): Promise<string | null> {
  if (!email) return null;
  const hash = createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  const url = `https://www.gravatar.com/avatar/${hash}?s=128&d=404`;
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(2500) });
    return res.ok ? `https://www.gravatar.com/avatar/${hash}?s=128` : null;
  } catch {
    return null;
  }
}

/** Uploaded avatar wins, then the website favicon, then Gravatar. */
export async function resolveAvatar(opts: {
  uploaded?: string | null;
  website?: string | null;
  email?: string | null;
}): Promise<string | null> {
  if (opts.uploaded) return opts.uploaded;
  const fav = faviconUrl(opts.website);
  if (fav) return fav;
  return gravatarUrl(opts.email);
}
