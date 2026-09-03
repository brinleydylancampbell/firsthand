import { expect, test } from "@playwright/test";

const demo = process.env.DEMO_WORKSPACE_SLUG ?? "demo";

test("webhook rejects a missing secret", async ({ request }) => {
  const res = await request.post(`/api/hooks/${demo}`, { data: { email: "a@b.co" } });
  expect(res.status()).toBe(401);
});

test("webhook rejects a bad payload with a helpful error", async ({ request }) => {
  const res = await request.post(`/api/hooks/${demo}`, {
    headers: { Authorization: "Bearer not-the-secret" },
    data: { email: "a@b.co" },
  });
  expect(res.status()).toBe(401);
});
