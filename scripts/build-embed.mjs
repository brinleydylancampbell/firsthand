// Minifies src/embed/embed.js into public/embed.js and enforces the size budget.
import { build } from "esbuild";
import { statSync } from "node:fs";

const LIMIT = 5 * 1024;

await build({
  entryPoints: ["src/embed/embed.js"],
  outfile: "public/embed.js",
  bundle: false,
  minify: true,
  target: ["es2017"],
  legalComments: "none",
  logLevel: "silent",
});

const size = statSync("public/embed.js").size;
if (size > LIMIT) {
  console.error(`embed.js is ${size} bytes, over the ${LIMIT} byte budget.`);
  process.exit(1);
}
console.log(`embed.js: ${size} bytes (budget ${LIMIT})`);
