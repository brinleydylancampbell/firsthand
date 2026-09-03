import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  crons: [
    // Send asks that have come due. Only live workspaces send; drafts never do.
    { path: "/api/cron/send-asks", schedule: "*/15 * * * *" },
    // Reseed the demo workspace and purge week-old abandoned interview drafts.
    { path: "/api/cron/reset-demo", schedule: "0 3 * * *" },
  ],
};
