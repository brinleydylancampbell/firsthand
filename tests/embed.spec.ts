import { expect, test } from "@playwright/test";

/**
 * The embed's promise: it renders inside very different host pages, inherits
 * the host font, and nothing on the page moves while it loads.
 */
for (const host of ["serif", "sans", "dark"] as const) {
  test(`embed renders in the ${host} host without layout shift`, async ({ page }) => {
    // Collect layout shift entries from the moment the page starts loading.
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput: boolean; value: number }>) {
          if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    await page.goto(`/embed-test/${host}`);
    const anchor = page.getByTestId("below");
    const before = await anchor.boundingBox();

    // Both widgets get their content.
    const cards = page.locator(".fh .fh-card");
    await expect(cards.first()).toBeVisible();
    await expect(page.locator(".fh-single")).toBeVisible();

    // Font is inherited from the host, not injected.
    const hostFont = await page.evaluate(() => getComputedStyle(document.body.firstElementChild as Element).fontFamily);
    const cardFont = await cards.first().evaluate((el) => getComputedStyle(el).fontFamily);
    expect(cardFont).toBe(hostFont);

    // The anchor below the widgets has not moved, and CLS is effectively zero.
    await page.waitForTimeout(500);
    const after = await anchor.boundingBox();
    expect(Math.abs((after?.y ?? 0) - (before?.y ?? 0))).toBeLessThan(2);
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls).toBeLessThan(0.02);
  });
}

test("embed.js stays under 5 KB and is served with CORS", async ({ request }) => {
  const res = await request.get("/embed.js");
  expect(res.ok()).toBeTruthy();
  expect(res.headers()["access-control-allow-origin"]).toBe("*");
  const body = await res.body();
  expect(body.byteLength).toBeLessThan(5 * 1024);
});

test("widget fragment is cacheable and only contains approved testimonials", async ({ request }) => {
  const res = await request.get("/api/widget/11111111-1111-4111-8111-111111111111");
  expect(res.ok()).toBeTruthy();
  expect(res.headers()["cache-control"]).toContain("s-maxage");
  const html = await res.text();
  expect(html).toContain("fh-card");
  // The pending and hidden seed testimonials never appear.
  expect(html).not.toContain("Payroll used to eat my Friday");
  expect(html).not.toContain("Onboarding took a bit longer");
});
