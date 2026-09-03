import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import { getWorkspaceBySlug } from "@/lib/workspace";
import type { Form } from "@/lib/types";
import { BrandFrame } from "@/components/brand-frame";
import { ClassicForm } from "@/components/classic-form";

async function load(ws: string, formSlug: string) {
  const workspace = await getWorkspaceBySlug(ws);
  if (!workspace) return null;
  const { data: form } = await adminClient()
    .from("form")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("slug", formSlug)
    .maybeSingle();
  if (!form) return null;
  return { workspace, form: form as Form };
}

export async function generateMetadata(props: PageProps<"/f/[ws]/[form]">): Promise<Metadata> {
  const { ws, form } = await props.params;
  const data = await load(ws, form);
  if (!data) return {};
  return {
    title: `${data.form.title} · ${data.workspace.name}`,
    description: data.form.intro ?? `Share your experience with ${data.workspace.name}.`,
    openGraph: { images: [`/api/og/form/${ws}/${form}`] },
  };
}

export default async function FormPage(props: PageProps<"/f/[ws]/[form]">) {
  const { ws, form: formSlug } = await props.params;
  const sp = await props.searchParams;
  const data = await load(ws, formSlug);
  if (!data) notFound();
  const { workspace, form } = data;
  const askToken = typeof sp.ask === "string" ? sp.ask : undefined;

  return (
    <BrandFrame workspace={workspace}>
      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        <div className="max-w-2xl">
          <h1 className="text-xl font-semibold tracking-tight">{form.title}</h1>
          {form.intro ? <p className="mt-2 text-ink-2">{form.intro}</p> : null}
          {form.incentive ? (
            <p className="mt-3 inline-block rounded-full bg-accent-soft px-3 py-1 text-sm text-accent-strong">{form.incentive}</p>
          ) : null}
        </div>
        <div className="mt-10">
          <ClassicForm workspace={workspace} form={form} askToken={askToken} />
        </div>
      </main>
    </BrandFrame>
  );
}
