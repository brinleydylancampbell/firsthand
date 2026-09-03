// CI gate: public/embed.js must exist and stay under 5 KB.
import { statSync } from "node:fs";

const LIMIT = 5 * 1024;
let size;
try {
  size = statSync("public/embed.js").size;
} catch {
  console.error("public/embed.js is missing. Run `npm run build:embed`.");
  process.exit(1);
}
if (size > LIMIT) {
  console.error(`embed.js is ${size} bytes, over the ${LIMIT} byte budget.`);
  process.exit(1);
}
console.log(`embed.js: ${size} bytes, within budget.`);
