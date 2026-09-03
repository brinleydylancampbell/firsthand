import { Resend } from "resend";
import { render } from "@react-email/components";
import { AskEmail } from "@/emails/ask";
import type { Ask, Workspace } from "./types";
import { appUrl } from "./utils";

export const DEFAULT_ASK_SUBJECT = "How did it go?";
export const DEFAULT_ASK_BODY =
  "Hi {{name}},\n\nWould you spare two minutes to tell us how it went? A few sentences is plenty, and you choose how you are named before anything is published.\n\n{{link}}\n\nThank you.";

export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k: string) => vars[k] ?? "");
}

export function askLink(workspace: Workspace, formSlug: string, token: string): string {
  return appUrl(`/f/${workspace.slug}/${formSlug}?ask=${token}`);
}

/** The exact email a recipient gets. Used for both the preview and the send. */
export async function renderAsk(workspace: Workspace, ask: Pick<Ask, "name" | "email" | "token">, formSlug: string) {
  const link = askLink(workspace, formSlug, ask.token);
  const firstName = (ask.name ?? "").trim().split(/\s+/)[0] || "there";
  const vars = { name: firstName, link, workspace: workspace.name };
  const subject = fillTemplate(workspace.ask_subject || DEFAULT_ASK_SUBJECT, vars);
  const body = fillTemplate(workspace.ask_body || DEFAULT_ASK_BODY, vars);
  const element = AskEmail({ body, link, workspaceName: workspace.name, accent: workspace.brand?.accent ?? "#7858d8" });
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);
  return { subject, html, text, link };
}

let resend: Resend | null = null;
function client(): Resend {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set.");
  resend ??= new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export async function sendAsk(workspace: Workspace, ask: Pick<Ask, "name" | "email" | "token">, formSlug: string): Promise<void> {
  const { subject, html, text } = await renderAsk(workspace, ask, formSlug);
  const from = process.env.RESEND_FROM ?? "Firsthand <onboarding@resend.dev>";
  const { error } = await client().emails.send({
    from,
    to: ask.email,
    subject,
    html,
    text,
    headers: { "X-Entity-Ref-ID": ask.token },
  });
  if (error) throw new Error(error.message);
}
