import { expect, test } from "@playwright/test";

const demo = process.env.DEMO_WORKSPACE_SLUG ?? "demo";

test("wall shows approved testimonials with filter chips and dark mode", async ({ page }) => {
  await page.goto(`/w/${demo}`);
  await expect(page.getByRole("heading", { name: "What customers say" })).toBeVisible();
  const cards = page.locator("figure");
  await expect(cards.first()).toBeVisible();
  const total = await cards.count();
  expect(total).toBeGreaterThanOrEqual(9); // 12 seeded, 2 pending, 1 hidden, plus anything approved by other tests

  // Filter by an objection chip.
  await page.getByRole("button", { name: "Worried about price" }).click();
  await expect.poll(() => page.locator("figure").count()).toBeLessThan(total);
  expect(await page.locator("figure").count()).toBeGreaterThan(0);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(cards).toHaveCount(total);

  // Dark mode toggles a class.
  await page.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator(".dark").first()).toBeVisible();

  // Consent enforced: pending text never appears.
  await expect(page.getByText("Payroll used to eat my Friday")).toHaveCount(0);
});

test("provenance page shows consent and identity", async ({ page }) => {
  await page.goto(`/w/${demo}`);
  await page.getByRole("link", { name: "See how this was collected" }).first().click();
  await expect(page.getByRole("heading", { name: /with consent/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Consent", exact: true })).toBeVisible();
});

test("classic form requires consent and lands in pending", async ({ page }) => {
  await page.goto(`/f/${demo}/share`);
  await page.getByRole("textbox", { name: "Your name" }).fill("Playwright Tester");
  await page.getByLabel("Role", { exact: true }).fill("QA");
  await page.getByLabel("Company", { exact: true }).fill("Test Co");
  await page.getByLabel("What would you tell someone who is on the fence?").fill("Automated but heartfelt: the form works and the consent step is clear.");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("How should we show you?")).toBeVisible();
  await page.getByText("First name and role").click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send it" }).click();
  await expect(page).toHaveURL(/\/thanks\//);
  await expect(page.getByText("Playwright")).toBeVisible();
  await expect(page.getByText("QA")).toBeVisible();
  await expect(page.getByText("Test Co")).toHaveCount(0); // first name and role only
});

test("public pages have OG images", async ({ request }) => {
  for (const path of [`/api/og/wall/${demo}`, `/api/og/form/${demo}/share`]) {
    const res = await request.get(path);
    expect(res.ok(), path).toBeTruthy();
    expect(res.headers()["content-type"]).toContain("image/png");
  }
});
