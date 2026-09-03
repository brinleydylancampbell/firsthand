import Link from "next/link";
import { requireWorkspace } from "@/lib/workspace";
import { signOut } from "@/app/login/actions";
import { AppNav } from "@/components/app-nav";
import { Logo } from "@/components/logo";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const { workspace, user } = await requireWorkspace();

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-line md:w-56 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <Logo size={24} href="/app" />
          <p className="truncate text-sm text-ink-2 md:mt-1" title={workspace.name}>
            {workspace.name}
            {workspace.is_demo ? <span className="ml-2 text-xs text-ink-3">demo</span> : null}
          </p>
        </div>
        <AppNav />
        <div className="mt-auto hidden flex-col gap-1 border-t border-line px-3 py-3 text-sm md:flex">
          <a
            href={`/w/${workspace.slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg px-2.5 py-1.5 text-ink-2 hover:bg-paper-2 hover:text-ink"
          >
            Open your wall ↗
          </a>
          <form action={signOut}>
            <button className="w-full rounded-lg px-2.5 py-1.5 text-left text-ink-2 hover:bg-paper-2 hover:text-ink" title={user.email ?? ""}>
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
