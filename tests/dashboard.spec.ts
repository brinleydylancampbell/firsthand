import { expect, test, type Page } from "@playwright/test";

/**
 * Signs in through a real magic link using the local mail catcher, then walks
 * the owner path: inbox, approve, wall. Skipped unless MAILPIT_URL is set
 * (local Supabase exposes it; `npx supabase status -o env` prints it).
 */
const mailpit = process.env.MAILPIT_URL ?? process.env.INBUCKET_URL;
const demo = process.env.DEMO_WORKSPACE_SLUG ?? "demo";

async function magicLinkFor(email: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const list = await fetch(`${mailpit}/api/v1/messages?limit=20`).then((r) => r.json() as Promise<{ messages: Array<{ ID: string; To: Array<{ Address: string }> }> }>);
    const msg = list.messages.find((m) => m.To.some((t) => t.Address.toLowerCase() === email));
    if (msg) {
      const full = await fetch(`${mailpit}/api/v1/message/${msg.ID}`).then((r) => r.json() as Promise<{ Text: string; HTML: string }>);
      const m = (full.Text || full.HTML).match(/https?:\/\/[^\s"<>]+verify[^\s"<>]+/);
      if (m) return m[0].replace(/&amp;/g, "&");
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("No magic link arrived");
}

async function signInToDemo(page: Page): Promise<void> {
  await page.goto("/demo");
  await expect(page).toHaveURL(/\/app/);
}

test.describe("dashboard", () => {

  test("one click into the demo, approving publishes to the wall", async ({ page }) => {
    // Submit our own testimonial first so the approve below never touches
    // the seeded ones other tests rely on.
    const marker = `Dashboard test ${Date.now()}`;
    await page.goto(`/f/${demo}/share`);
    await page.getByRole("textbox", { name: "Your name" }).fill("Dashboard Tester");
    await page.getByLabel("What would you tell someone who is on the fence?").fill(`${marker}: approving from the dashboard should publish this to the wall.`);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Send it" }).click();
    await expect(page).toHaveURL(/\/thanks\//);

    await signInToDemo(page);
    await expect(page.getByText("You are in the demo workspace")).toBeVisible();

    // Landed in the demo workspace with the Waiting tab open.
    await expect(page.getByText("Harbour Bookkeeping")).toBeVisible();
    const waitingTab = page.getByRole("tab", { name: /Waiting/ });
    await expect(waitingTab).toHaveAttribute("aria-selected", "true");
    const pending = Number((await waitingTab.textContent())?.match(/(\d+)/)?.[1] ?? 0);
    expect(pending).toBeGreaterThan(0);
    await page.goto(`/w/${demo}`);
    const publicBefore = await page.locator("figure").count();
    await page.goto("/app");

    // Approve ours with the keyboard. Other tests submit in parallel, so find it by text.
    const row = page.locator("li[data-id]", { hasText: marker });
    await expect(row).toBeVisible();
    await row.click();
    await page.keyboard.press("a");
    await expect(page.getByRole("tab", { name: new RegExp(`Waiting\\s*${pending - 1}`) })).toBeVisible();

    // It is now public.
    await page.goto(`/w/${demo}`);
    await expect(page.locator("figure")).toHaveCount(publicBefore + 1);

    // Approved tab: share panel renders with quote card links.
    await page.goto("/app");
    await page.getByRole("tab", { name: /Approved/ }).click();
    await page.getByRole("button", { name: "Share" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("link", { name: /Square/ })).toHaveAttribute("href", /\/api\/og\/testimonial\//);
    await page.keyboard.press("Escape");

    // Widgets: the builder previews and produces a snippet with reserved heights.
    await page.goto("/app/show");
    await page.getByRole("link", { name: "Homepage wall" }).click();
    await expect(page.locator(".fh .fh-card").first()).toBeVisible();
    await expect(page.locator("pre")).toContainText("min-height");
    await expect(page.locator("pre")).toContainText("/embed.js");

    // Asks: draft mode by default, test event lands in the queue.
    await page.goto("/app/asks");
    await expect(page.getByText("Draft mode. Nothing sends.")).toBeVisible();
    await page.getByRole("button", { name: "Send a test event" }).click();
    await expect(page.getByText("Test event received")).toBeVisible();
    await expect(page.getByText("test@example.com").first()).toBeVisible();
  });

  test("a normal sign in gets a fresh workspace", async ({ page }) => {
    test.skip(!mailpit, "needs the local mail catcher");
    const email = `owner-${Date.now()}@example.com`;
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Send me a sign-in link" }).click();
    await expect(page.getByText("Check your inbox")).toBeVisible();
    await page.goto(await magicLinkFor(email));
    await expect(page).toHaveURL(/\/app/);
    await expect(page.getByText("Nothing waiting").first()).toBeVisible();
    await page.goto("/app/collect");
    await expect(page.getByText("Tell us how it went")).toBeVisible();
  });
});
