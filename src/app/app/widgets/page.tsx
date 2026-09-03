import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import type { Widget } from "@/lib/types";
import { createWidget } from "./actions";
import { Badge, Button, EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Widgets" };

const typeLabel = { wall: "Wall", carousel: "Carousel", single: "Single quote", badge: "Badge" };

export default async function WidgetsPage() {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase.from("widget").select("*").eq("workspace_id", workspace.id).order("created_at", { ascending: true });
  const widgets = (data ?? []) as Widget[];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Widgets</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">On your site</h1>
        </div>
        <form action={createWidget}>
          <Button type="submit">New widget</Button>
        </form>
      </header>
      <p className="mb-6 text-sm text-ink-2">
        One script tag and a div. No iframe, inherits your font, height reserved so nothing shifts. Views are counted once per load and rolled up by day; nothing else is tracked.{" "}
        <Link href="/docs/embed" className="underline underline-offset-2 hover:text-ink">How the embed works</Link>
      </p>

      {!widgets.length ? (
        <EmptyState
          title="No widgets yet"
          body="A widget shows approved testimonials on your own site. Start with a wall for the homepage or a single quote for the pricing page."
          action={
            <form action={createWidget}>
              <Button type="submit" variant="secondary">Create a widget</Button>
            </form>
          }
        />
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {widgets.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center gap-3 py-4">
              <div className="min-w-0 flex-1">
                <Link href={`/app/widgets/${w.id}`} className="font-medium hover:underline">{w.name}</Link>
                <p className="mt-0.5 text-sm text-ink-2">
                  {w.config?.count ?? 6} testimonials
                  {w.config?.filters?.objection ? ` · filtered` : ""}
                  {w.config?.filters?.featuredOnly ? ` · featured only` : ""}
                </p>
              </div>
              <Badge>{typeLabel[w.type]}</Badge>
              <span className="text-sm text-ink-3">{w.view_count.toLocaleString()} views</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
