import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import type { Form } from "@/lib/types";
import { FormEditor } from "@/components/form-editor";

export const metadata: Metadata = { title: "Edit form" };

export default async function FormEditPage(props: PageProps<"/app/forms/[id]">) {
  const { id } = await props.params;
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase.from("form").select("*").eq("id", id).eq("workspace_id", workspace.id).maybeSingle();
  if (!data) notFound();
  return <FormEditor form={data as Form} workspace={workspace} />;
}
