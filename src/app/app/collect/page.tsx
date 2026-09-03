import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import type { Ask, Form } from "@/lib/types";
import { appUrl } from "@/lib/utils";
import { createForm } from "@/app/app/forms/actions";
import { Badge, Button, ButtonLink, EmptyState } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";

export const metadata: Metadata = { title: "Collect" };

/** How testimonials arrive: links you share, and asks your system sends. */
export default async function CollectPage() {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const [{ data: forms }, { data: counts }, { data: asks }] = await Promise.all([
    supabase.from("form").select("*").eq("workspace_id", workspace.id).order("created_at", { ascending: true }),
    supabase.from("testimonial").select("form_id").eq("workspace_id", workspace.id).neq("status", "draft"),
    supabase.from("ask").select("status").eq("workspace_id", workspace.id).in("status", ["draft", "scheduled"]),
  ]);
  const byForm = new Map<string, number>();
  for (const row of counts ?? []) if (row.form_id) byForm.set(row.form_id, (byForm.get(row.form_id) ?? 0) + 1);
  const queued = ((asks ?? []) as Pick<Ask, "status">[]).length;
  const live = workspace.ask_mode === "live";

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Collect</h1>
        <p className="mt-1 text-sm text-ink-2">Share a link, or let your order system ask for you.</p>
      </header>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-base font-semibold">Links to share</h2>
          <form action={createForm}>
            <Button type="submit" size="sm" variant="secondary">New form</Button>
          </form>
        </div>
        {!forms?.length ? (
          <div className="mt-3">
            <EmptyState
              title="No forms yet"
              body="A form is a link you send customers. Interview mode asks a few questions and drafts the testimonial for them."
              action={
                <form action={createForm}>
                  <Button type="submit" variant="secondary">Create your first form</Button>
                </form>
              }
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card">
            {(forms as Form[]).map((f) => {
              const url = appUrl(`/f/${workspace.slug}/${f.slug}`);
              return (
                <li key={f.id} className="flex flex-wrap items-center gap-3 px-4 py-4">
                  <div className="min-w-0 flex-1">
                    <Link href={`/app/forms/${f.id}`} className="font-medium hover:underline">
                      {f.title}
                    </Link>
                    <p className="mt-0.5 truncate text-sm text-ink-2">{url.replace(/^https?:\/\//, "")}</p>
                  </div>
                  <Badge tone={f.mode === "chat" ? "accent" : "neutral"}>{f.mode === "chat" ? "Interview" : "Classic"}</Badge>
                  <span className="text-sm text-ink-3">{byForm.get(f.id) ?? 0} received</span>
                  <CopyButton text={url} label="Copy link" />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-base font-semibold">Asks</h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card p-5">
          <div>
            <p className="font-medium">{live ? "Live. Due asks are being sent." : "Draft mode. Nothing sends."}</p>
            <p className="mt-1 text-sm text-ink-2">
              {queued ? `${queued} queued.` : "Nothing queued."} Your order system posts one line when a job is done; Firsthand emails an interview link {workspace.ask_delay_days} {workspace.ask_delay_days === 1 ? "day" : "days"} later.
            </p>
          </div>
          <ButtonLink href="/app/asks" variant="secondary">{live || queued ? "Manage asks" : "Set up asks"}</ButtonLink>
        </div>
      </section>
    </div>
  );
}
