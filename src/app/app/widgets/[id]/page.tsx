import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import { dailySeries, daysAgoIso } from "@/lib/series";
import type { Widget } from "@/lib/types";
import { WidgetBuilder } from "@/components/widget-builder";

export const metadata: Metadata = { title: "Widget builder" };

export default async function WidgetEditPage(props: PageProps<"/app/widgets/[id]">) {
  const { id } = await props.params;
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const [{ data: widget }, { data: views }, { data: tagRows }] = await Promise.all([
    supabase.from("widget").select("*").eq("id", id).eq("workspace_id", workspace.id).maybeSingle(),
    supabase.from("widget_view").select("day, count").eq("widget_id", id).gte("day", daysAgoIso(13)).order("day"),
    supabase.from("testimonial").select("tags").eq("workspace_id", workspace.id).eq("status", "approved"),
  ]);
  if (!widget) notFound();

  const tagCounts = new Map<string, number>();
  for (const r of tagRows ?? []) for (const t of (r.tags as string[]) ?? []) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  const series = dailySeries((views ?? []) as Array<{ day: string; count: number }>);

  return <WidgetBuilder widget={widget as Widget} workspace={workspace} tags={tags} series={series} />;
}
