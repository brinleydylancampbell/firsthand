import type { Metadata } from "next";
import Link from "next/link";
import { appUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Webhook docs", description: "Ask for a testimonial at the right moment. One POST from your order or job system." };

export default function WebhookDocs() {
  const origin = appUrl();
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <Link href="/" className="eyebrow">Firsthand</Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Ask at the right moment</h1>
      <p className="mt-3 text-lg text-ink-2">
        Asking the same day gets answers. Asking a month later does not. Post one line of JSON when a job or order is done and Firsthand sends the interview link after the delay you set.
      </p>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">Nothing sends until you say so</h2>
        <p className="text-ink-2">
          Every workspace starts in draft mode. Asks collect in your dashboard, you see the exact email and the first five recipients, and you flip it live when you are happy. You can pause at any time. Connecting a system never triggers an email on its own.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">The request</h2>
        <pre className="overflow-x-auto rounded-sm border border-line bg-paper-2 p-4 text-xs leading-relaxed"><code>{`POST ${origin}/api/hooks/YOUR_WORKSPACE
Authorization: Bearer YOUR_SECRET
Content-Type: application/json

{
  "email": "jane@example.com",
  "name": "Jane Doe",
  "order_ref": "INV-1042",
  "delivered_at": "2026-09-01T10:00:00Z"
}`}</code></pre>
        <table className="w-full text-sm">
          <tbody className="text-ink-2">
            {[
              ["email", "Required. Who to ask."],
              ["name", "Optional. Used for the greeting."],
              ["order_ref", "Optional. Stored with the testimonial as provenance, shown on the public “how this was collected” page with the last four characters."],
              ["delivered_at", "Optional ISO 8601 timestamp. Defaults to now. The ask sends this many days later, per your settings."],
            ].map(([k, d]) => (
              <tr key={k} className="border-b border-line-2">
                <td className="py-2 pr-4 align-top"><code className="text-xs">{k}</code></td>
                <td className="py-2">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-ink-2">The response is <code>201</code> with the ask id, when it will send, and whether it is waiting in draft mode. Your address and secret are on the Asks page.</p>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">curl</h2>
        <pre className="overflow-x-auto rounded-sm border border-line bg-paper-2 p-4 text-xs leading-relaxed"><code>{`curl -X POST ${origin}/api/hooks/YOUR_WORKSPACE \\
  -H "Authorization: Bearer YOUR_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"jane@example.com","name":"Jane Doe","order_ref":"INV-1042"}'`}</code></pre>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">Zapier</h2>
        <ol className="list-decimal space-y-2 pl-5 text-ink-2">
          <li>Trigger: whatever means “done” in your system. An order marked fulfilled, an invoice paid, a job closed.</li>
          <li>Action: <strong>Webhooks by Zapier</strong>, event <strong>Custom Request</strong>.</li>
          <li>Method POST, URL from your Asks page, Data Pass-Through off, Data as the JSON above with fields mapped from the trigger.</li>
          <li>Headers: <code>Authorization: Bearer YOUR_SECRET</code> and <code>Content-Type: application/json</code>.</li>
        </ol>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">Make</h2>
        <ol className="list-decimal space-y-2 pl-5 text-ink-2">
          <li>Add an <strong>HTTP</strong> module, <strong>Make a request</strong>.</li>
          <li>URL from your Asks page, method POST, body type Raw, content type JSON.</li>
          <li>Request content: the JSON above with mapped fields. Add the Authorization header with your secret.</li>
        </ol>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">Anything else</h2>
        <p className="text-ink-2">If it can make an HTTP request, it can call this. There is no SDK to install and no vendor-specific handler. The <Link href="/app/asks" className="underline underline-offset-2">Asks page</Link> has a “send a test event” button so you can watch one arrive before wiring anything up.</p>
      </section>
    </main>
  );
}
