// Bundles src/lib/seed.ts with esbuild and runs it. Usage:
//   node --env-file=.env.local scripts/seed.mjs
import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";

mkdirSync(".next", { recursive: true });
await build({
  entryPoints: ["src/lib/seed.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  outfile: ".next/seed.mjs",
  packages: "external",
  logLevel: "silent",
});

const mod = await import(pathToFileURL(new URL("../.next/seed.mjs", import.meta.url).pathname).href);
await mod.seedFromEnv();
