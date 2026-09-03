import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import { getWorkspaceBySlug } from "@/lib/workspace";
import { publicIdentity, type Form, type Testimonial } from "@/lib/types";
import { appUrl } from "@/lib/utils";
import { BrandFrame } from "@/components/brand-frame";
import { Avatar, Stars, buttonClass } from "@/components/ui";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default async function ThanksPage(props: PageProps<"/f/[ws]/[form]/thanks/[id]">) {
  const { ws, form: formSlug, id } = await props.params;
  const workspace = await getWorkspaceBySlug(ws);
  if (!workspace) notFound();
  const admin = adminClient();
  const [{ data: form }, { data: t }] = await Promise.all([
    admin.from("form").select("*").eq("workspace_id", workspace.id).eq("slug", formSlug).maybeSingle(),
    admin.from("testimonial").select("*").eq("id", id).eq("workspace_id", workspace.id).maybeSingle(),
  ]);
  if (!form || !t) notFound();
  const testimonial = t as Testimonial;
  const identity = publicIdentity(testimonial);

  const wallUrl = appUrl(`/w/${workspace.slug}`);
  const shareText = `“${testimonial.body}” — my experience with ${workspace.name}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(wallUrl)}`;
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(wallUrl)}`;

  return (
    <BrandFrame workspace={workspace}>
      <main className="mx-auto w-full max-w-2xl px-6 py-10">
        <p className="eyebrow">Thank you</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          {(form as Form).thank_you ?? "That means a lot. Here is what you said."}
        </h1>

        <figure className="mt-8 rounded-sm border border-line p-6">
          <Stars rating={testimonial.rating} />
          <blockquote className="mt-3 font-serif text-lg leading-relaxed">{testimonial.body}</blockquote>
          <figcaption className="mt-5 flex items-center gap-3">
            <Avatar src={identity.display_name === "Verified customer" ? null : testimonial.avatar_url} name={identity.display_name} size={36} />
            <div className="text-sm">
              <p className="font-medium">{identity.display_name}</p>
              {identity.display_meta ? <p className="text-ink-2">{identity.display_meta}</p> : null}
            </div>
          </figcaption>
        </figure>

        <p className="mt-4 text-sm text-ink-2">
          {testimonial.source === "interview" ? "Written from your answers, in your words. " : ""}
          {workspace.name} will review it before it appears anywhere.
        </p>

        {(form as Form).incentive ? (
          <p className="mt-6 rounded-sm bg-accent/10 px-3 py-2 text-sm text-accent">{(form as Form).incentive}</p>
        ) : null}

        <div className="mt-8">
          <p className="text-sm font-medium">Share it</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a href={linkedin} target="_blank" rel="noreferrer" className={buttonClass("secondary")}>
              Post on LinkedIn
            </a>
            <a href={x} target="_blank" rel="noreferrer" className={buttonClass("secondary")}>
              Post on X
            </a>
          </div>
        </div>
      </main>
    </BrandFrame>
  );
}
