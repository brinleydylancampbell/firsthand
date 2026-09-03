import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import type { Testimonial } from "@/lib/types";
import { TestimonialsView } from "@/components/testimonials-view";

export const metadata: Metadata = { title: "Testimonials" };

/** The one list. Waiting first, because approving is the daily job. */
export default async function TestimonialsPage() {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonial")
    .select("*")
    .eq("workspace_id", workspace.id)
    .neq("status", "draft")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return <TestimonialsView workspace={workspace} items={(data ?? []) as Testimonial[]} />;
}
