import type { Metadata } from "next";
import { requireWorkspace } from "@/lib/workspace";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { workspace, user } = await requireWorkspace();
  return <SettingsForm workspace={workspace} email={user.email ?? ""} />;
}
