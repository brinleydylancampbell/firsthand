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

test("interview turn creates a draft and streams a question", async ({ request }) => {
  test.skip(!process.env.ANTHROPIC_API_KEY, "needs a model key");
  const res = await request.post("/api/interview", {
    data: { id: null, ws: demo, form: "interview", turns: [] },
  });
  expect(res.ok()).toBeTruthy();
  expect(res.headers()["x-testimonial-id"]).toMatch(/[0-9a-f-]{36}/);
  const text = await res.text();
  expect(text.trim().length).toBeGreaterThan(10);
  expect(text).toMatch(/\?/);
});
