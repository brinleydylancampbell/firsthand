import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/workspace";
import { listApproved } from "@/lib/public";
import { Wall } from "@/components/wall";

export const revalidate = 60;

export async function generateMetadata(props: PageProps<"/w/[ws]">): Promise<Metadata> {
  const { ws } = await props.params;
  const workspace = await getWorkspaceBySlug(ws);
  if (!workspace) return {};
  return {
    title: `What customers say about ${workspace.name}`,
    description: `Real testimonials, collected with consent, in customers' own words.`,
    openGraph: { images: [`/api/og/wall/${ws}`] },
  };
}

export default async function WallPage(props: PageProps<"/w/[ws]">) {
  const { ws } = await props.params;
  const workspace = await getWorkspaceBySlug(ws);
  if (!workspace) notFound();
  const items = await listApproved(workspace.id);
  return <Wall workspace={workspace} items={items} />;
}
