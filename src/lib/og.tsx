import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactElement } from "react";

/**
 * Shared pieces for the image routes: fonts, sizes and the quote card.
 * ImageResponse supports flexbox and a CSS subset; no grid, no CSS variables.
 */

export const SIZES = {
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  landscape: { width: 1200, height: 630 },
} as const;
export type SizeKey = keyof typeof SIZES;

let fontsPromise: Promise<Array<{ name: string; data: ArrayBuffer; weight: 400 | 600; style: "normal" | "italic" }>> | null = null;

export function loadFonts() {
  fontsPromise ??= (async () => {
    const dir = join(process.cwd(), "src", "assets", "fonts");
    const read = async (file: string) => {
      const buf = await readFile(join(dir, file));
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    };
    const [sansR, sansB, serifR, serifI] = await Promise.all([
      read("InstrumentSans-Regular.woff"),
      read("InstrumentSans-SemiBold.woff"),
      read("SourceSerif4-Regular.woff"),
      read("SourceSerif4-Italic.woff"),
    ]);
    return [
      { name: "Instrument Sans", data: sansR, weight: 400 as const, style: "normal" as const },
      { name: "Instrument Sans", data: sansB, weight: 600 as const, style: "normal" as const },
      { name: "Source Serif 4", data: serifR, weight: 400 as const, style: "normal" as const },
      { name: "Source Serif 4", data: serifI, weight: 400 as const, style: "italic" as const },
    ];
  })();
  return fontsPromise;
}

export function Stars({ rating, size, color }: { rating: number | null; size: number; color: string }) {
  if (!rating) return null;
  return (
    <div style={{ display: "flex", gap: size * 0.15 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20">
          <path fill={i <= rating ? color : "#d9d9d9"} d="M10 1.8l2.5 5.3 5.7.7-4.2 4 1.1 5.7L10 14.7l-5.1 2.8 1.1-5.7-4.2-4 5.7-.7z" />
        </svg>
      ))}
    </div>
  );
}

export function Frame({ width, height, children, accent }: { width: number; height: number; children: React.ReactNode; accent: string }): ReactElement {
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        color: "#141414",
        fontFamily: "Instrument Sans",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width, height: Math.round(height * 0.012), background: accent, display: "flex" }} />
      {children}
    </div>
  );
}

export function Brand({ name, logo, size }: { name: string; logo: string | null | undefined; size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.5 }}>
      {logo ? (
        <img src={logo} alt="" height={size * 1.4} style={{ height: size * 1.4, objectFit: "contain" }} />
      ) : null}
      <span style={{ fontSize: size, fontWeight: 600, letterSpacing: "0.02em" }}>{name}</span>
    </div>
  );
}

export function QuoteCard({
  size,
  body,
  displayName,
  displayMeta,
  avatar,
  rating,
  accent,
  workspaceName,
  logo,
}: {
  size: SizeKey;
  body: string;
  displayName: string;
  displayMeta: string | null;
  avatar: string | null;
  rating: number | null;
  accent: string;
  workspaceName: string;
  logo?: string | null;
}) {
  const { width, height } = SIZES[size];
  const pad = Math.round(width * 0.08);
  const long = body.length > 260;
  const quoteSize = size === "landscape" ? (long ? 34 : 42) : long ? 40 : 50;
  const clipped = body.length > 420 ? body.slice(0, 417).replace(/\s+\S*$/, "") + "…" : body;

  return (
    <Frame width={width} height={height} accent={accent}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: pad }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <Stars rating={rating} size={size === "landscape" ? 26 : 30} color={accent} />
          <div style={{ fontFamily: "Source Serif 4", fontSize: quoteSize, lineHeight: 1.3, letterSpacing: "-0.01em", display: "flex" }}>
            <span>“{clipped}”</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {avatar ? (
              <img src={avatar} alt="" width={72} height={72} style={{ width: 72, height: 72, borderRadius: 999, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: 999, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 600, color: "#8c8c8c" }}>
                {displayName.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("")}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 30, fontWeight: 600 }}>{displayName}</span>
              {displayMeta ? <span style={{ fontSize: 24, color: "#5a5a5a" }}>{displayMeta}</span> : null}
            </div>
          </div>
          <Brand name={workspaceName} logo={logo} size={22} />
        </div>
      </div>
    </Frame>
  );
}
