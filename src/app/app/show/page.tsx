import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import type { Widget } from "@/lib/types";
import { appUrl } from "@/lib/utils";
import { createWidget } from "@/app/app/widgets/actions";
import { Badge, Button, EmptyState } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";

export const metadata: Metadata = { title: "Show" };

const typeLabel = { wall: "Wall", carousel: "Carousel", single: "Single quote", badge: "Badge" };

/** Where approved testimonials go: your wall, and widgets on your own site. */
export default async function ShowPage() {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const [{ data }, { count }] = await Promise.all([
    supabase.from("widget").select("*").eq("workspace_id", workspace.id).order("created_at", { ascending: true }),
    supabase.from("testimonial").select("id", { count: "exact", head: true }).eq("workspace_id", workspace.id).eq("status", "approved"),
  ]);
  const widgets = (data ?? []) as Widget[];
  const wallUrl = appUrl(`/w/${workspace.slug}`);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Show</h1>
        <p className="mt-1 text-sm text-ink-2">{count ?? 0} approved {count === 1 ? "testimonial is" : "testimonials are"} live. Here is where they appear.</p>
      </header>

      <section>
        <h2 className="text-base font-semibold">Your wall</h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card p-5">
          <div className="min-w-0">
            <p className="truncate font-medium">{wallUrl.replace(/^https?:\/\//, "")}</p>
            <p className="mt-1 text-sm text-ink-2">A public page with filter chips and dark mode. Send it to anyone.</p>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={wallUrl} label="Copy link" />
            <a href={wallUrl} target="_blank" rel="noreferrer" className="text-sm text-ink-2 underline underline-offset-2 hover:text-ink">Open</a>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Widgets on your site</h2>
            <p className="mt-1 text-sm text-ink-2">
              One script tag and a div. No iframe, your font, height reserved so nothing shifts.{" "}
              <Link href="/docs/embed" className="underline underline-offset-2 hover:text-ink">How it works</Link>
            </p>
          </div>
          <form action={createWidget}>
            <Button type="submit" size="sm" variant="secondary">New widget</Button>
          </form>
        </div>

        {!widgets.length ? (
          <div className="mt-3">
            <EmptyState
              title="No widgets yet"
              body="Start with a wall for the homepage or a single quote for the pricing page."
              action={
                <form action={createWidget}>
                  <Button type="submit" variant="secondary">Create a widget</Button>
                </form>
              }
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card">
            {widgets.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center gap-3 px-4 py-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/app/widgets/${w.id}`} className="font-medium hover:underline">{w.name}</Link>
                  <p className="mt-0.5 text-sm text-ink-2">
                    {w.config?.count ?? 6} testimonials
                    {w.config?.filters?.objection ? " · filtered" : ""}
                    {w.config?.filters?.featuredOnly ? " · featured only" : ""}
                  </p>
                </div>
                <Badge>{typeLabel[w.type]}</Badge>
                <span className="text-sm text-ink-3">{w.view_count.toLocaleString()} views</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
