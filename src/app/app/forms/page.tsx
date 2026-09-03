import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import type { Form } from "@/lib/types";
import { appUrl } from "@/lib/utils";
import { createForm } from "./actions";
import { Badge, Button, EmptyState } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";

export const metadata: Metadata = { title: "Forms" };

export default async function FormsPage() {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const [{ data: forms }, { data: counts }] = await Promise.all([
    supabase.from("form").select("*").eq("workspace_id", workspace.id).order("created_at", { ascending: true }),
    supabase.from("testimonial").select("form_id").eq("workspace_id", workspace.id).neq("status", "draft"),
  ]);
  const byForm = new Map<string, number>();
  for (const row of counts ?? []) if (row.form_id) byForm.set(row.form_id, (byForm.get(row.form_id) ?? 0) + 1);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Forms</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Ways to collect</h1>
        </div>
        <form action={createForm}>
          <Button type="submit">New form</Button>
        </form>
      </header>

      {!forms?.length ? (
        <EmptyState
          title="No forms yet"
          body="A form is a link you send customers. Interview mode asks a few questions and drafts the testimonial for them."
          action={
            <form action={createForm}>
              <Button type="submit" variant="secondary">Create your first form</Button>
            </form>
          }
        />
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {(forms as Form[]).map((f) => {
            const url = appUrl(`/f/${workspace.slug}/${f.slug}`);
            return (
              <li key={f.id} className="flex flex-wrap items-center gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/app/forms/${f.id}`} className="font-medium hover:underline">
                    {f.title}
                  </Link>
                  <p className="mt-0.5 truncate text-sm text-ink-2">{url.replace(/^https?:\/\//, "")}</p>
                </div>
                <Badge tone={f.mode === "chat" ? "accent" : "neutral"}>{f.mode === "chat" ? "Interview" : "Classic"}</Badge>
                <span className="text-sm text-ink-3">{byForm.get(f.id) ?? 0} received</span>
                <CopyButton text={url} label="Copy link" />
                <a href={url} target="_blank" rel="noreferrer" className="text-sm text-ink-2 underline underline-offset-2 hover:text-ink">
                  Open
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
