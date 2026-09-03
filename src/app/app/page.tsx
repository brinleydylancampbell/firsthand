import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspace } from "@/lib/workspace";
import type { Testimonial } from "@/lib/types";
import { InboxList } from "@/components/inbox-list";
import { ButtonLink, EmptyState, Kbd } from "@/components/ui";

export const metadata: Metadata = { title: "Inbox" };

export default async function InboxPage() {
  const { workspace } = await requireWorkspace();
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonial")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  const items = (data ?? []) as Testimonial[];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Inbox</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            {items.length === 0 ? "Nothing waiting" : `${items.length} waiting for review`}
          </h1>
        </div>
        <p className="hidden items-center gap-1.5 text-sm text-ink-3 sm:flex">
          <Kbd>J</Kbd>
          <Kbd>K</Kbd> move <Kbd>A</Kbd> approve <Kbd>H</Kbd> hide <Kbd>F</Kbd> feature <Kbd>?</Kbd> more
        </p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="No testimonials waiting"
          body="New submissions land here. Nothing goes public until you approve it."
          action={<ButtonLink href="/app/forms" variant="secondary">Share a form link</ButtonLink>}
        />
      ) : (
        <InboxList initial={items} removeOnStatusChange />
      )}
    </div>
  );
}
