import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui";

/** The mark and the one thing we want clicked. No menu. */
export function SiteHeader() {
  return (
    <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
      <Logo size={30} priority className="min-h-11" />
      <ButtonLink href="/demo" className="h-11 px-5">
        Open the demo
      </ButtonLink>
    </header>
  );
}
