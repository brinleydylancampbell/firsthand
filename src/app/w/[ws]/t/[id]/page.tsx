import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import { getWorkspaceBySlug } from "@/lib/workspace";
import { publicIdentity, type Testimonial } from "@/lib/types";
import { BrandFrame } from "@/components/brand-frame";
import { Avatar, Stars } from "@/components/ui";

export const metadata: Metadata = { title: "How this was collected" };

const sourceName: Record<string, string> = {
  google: "a Google review",
  trustpilot: "a Trustpilot review",
  x: "a post on X",
  linkedin: "a LinkedIn post",
  email: "an email",
  other: "another source",
};

/**
 * Public provenance. Only for approved, consented testimonials whose owner
 * turned the link on. Shows the real questions and answers, or the import
 * source, plus when consent was given and how the customer chose to appear.
 */
export default async function ProvenancePage(props: PageProps<"/w/[ws]/t/[id]">) {
  const { ws, id } = await props.params;
  const workspace = await getWorkspaceBySlug(ws);
  if (!workspace) notFound();
  const { data } = await adminClient()
    .from("testimonial")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspace.id)
    .eq("status", "approved")
    .eq("consent_public", true)
    .eq("provenance_public", true)
    .maybeSingle();
  if (!data) notFound();
  const t = data as Testimonial;
  const who = publicIdentity(t);
  const consentDate = t.consent_at
    ? new Date(t.consent_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : null;
  const idLabel =
    t.identity_mode === "anonymous" ? "to appear anonymously" : t.identity_mode === "first_role" ? "to be shown by first name and role" : "to be shown by full name";

  return (
    <BrandFrame workspace={workspace}>
      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        <Link href={`/w/${ws}`} className="text-sm text-ink-2 underline underline-offset-2 hover:text-ink">
          ← Back to the wall
        </Link>
        <h1 className="mt-2 text-2xl font-bold">
          {t.source === "import" ? `Imported from ${sourceName[t.provenance?.source_label ?? "other"] ?? "another source"}` : "Submitted by the customer, with consent"}
        </h1>

        <figure className="mt-8 rounded-2xl border border-line bg-card p-5">
          <div className="flex items-center gap-3">
            <Avatar src={who.display_name === "Verified customer" ? null : t.avatar_url} name={who.display_name} size={40} />
            <div>
              <p className="font-medium">{who.display_name}</p>
              {who.display_meta ? <p className="text-sm text-ink-2">{who.display_meta}</p> : null}
            </div>
            <Stars rating={t.rating} className="ml-auto" />
          </div>
          <blockquote className="mt-4 font-serif text-lg leading-relaxed">{t.body}</blockquote>
        </figure>

        {t.source === "import" ? (
          <section className="mt-10 text-sm text-ink-2">
            <h2 className="font-medium text-ink">Source</h2>
            <p className="mt-1">
              Pasted in by {workspace.name} from {sourceName[t.provenance?.source_label ?? "other"] ?? "another source"}
              {t.provenance?.source_url ? (
                <>
                  {" "}
                  at{" "}
                  <a href={t.provenance.source_url} rel="noreferrer nofollow" target="_blank" className="underline underline-offset-2">
                    {new URL(t.provenance.source_url).hostname}
                  </a>
                </>
              ) : null}
              . The text was not edited.
            </p>
          </section>
        ) : null}

        <section className="mt-10 rounded-lg bg-paper-2 p-4 text-sm text-ink-2">
          <h2 className="font-medium text-ink">Consent</h2>
          <p className="mt-1">
            {consentDate ? `On ${consentDate} the customer agreed` : "The customer agreed"} that {workspace.name} may publish this, and chose {idLabel}.
            {t.provenance?.order_ref ? ` The request followed a real order (reference ending ${t.provenance.order_ref.slice(-4)}).` : ""}
          </p>
        </section>
      </main>
    </BrandFrame>
  );
}
