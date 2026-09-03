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

async function signInToDemo(page: Page): Promise<string> {
  const email = `judge-${Date.now()}@example.com`;
  await page.goto("/demo/login");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send me a demo link" }).click();
  await expect(page.getByText("Check your inbox")).toBeVisible();
  const link = await magicLinkFor(email);
  await page.goto(link);
  await expect(page).toHaveURL(/\/app/);
  return email;
}

test.describe("dashboard", () => {
  test.skip(!mailpit, "needs the local mail catcher");

  test("demo sign in joins the sandbox and approving publishes to the wall", async ({ page }) => {
    await signInToDemo(page);

    // Landed in the demo workspace inbox with the two pending seeds.
    await expect(page.getByText("Harbour Bookkeeping")).toBeVisible();
    const heading = page.getByRole("heading", { name: /waiting for review/ });
    await expect(heading).toBeVisible();
    const pending = Number((await heading.textContent())?.match(/(\d+) waiting/)?.[1] ?? 0);
    expect(pending).toBeGreaterThan(0);
    await page.goto(`/w/${demo}`);
    const publicBefore = await page.locator("figure").count();
    await page.goto("/app");

    // Approve with the keyboard: first row is selected, A approves.
    await page.locator("li[data-id]").first().click();
    await page.keyboard.press("a");
    if (pending > 1) await expect(page.getByRole("heading", { name: new RegExp(`${pending - 1} waiting`) })).toBeVisible();
    else await expect(page.getByRole("heading", { name: "Nothing waiting" })).toBeVisible();

    // It is now public.
    await page.goto(`/w/${demo}`);
    await expect(page.locator("figure")).toHaveCount(publicBefore + 1);

    // Testimonials page: search box, tabs and share panel render.
    await page.goto("/app/testimonials");
    await expect(page.getByRole("tab", { name: /approved/i })).toBeVisible();
    await page.getByRole("button", { name: "Share" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("link", { name: /Square/ })).toHaveAttribute("href", /\/api\/og\/testimonial\//);
    await page.keyboard.press("Escape");

    // Widgets: the builder previews and produces a snippet with reserved heights.
    await page.goto("/app/widgets");
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
    const email = `owner-${Date.now()}@example.com`;
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Send me a sign-in link" }).click();
    await expect(page.getByText("Check your inbox")).toBeVisible();
    await page.goto(await magicLinkFor(email));
    await expect(page).toHaveURL(/\/app/);
    await expect(page.getByText("Nothing waiting")).toBeVisible();
    await page.goto("/app/forms");
    await expect(page.getByText("Tell us how it went")).toBeVisible();
  });
});
