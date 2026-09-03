import { ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-24">
      <Logo size={28} className="mb-8 self-start" />
      <h1 className="mt-2 text-2xl font-bold">There is nothing at this address</h1>
      <p className="mt-2 text-ink-2">
        The link may have been typed wrong, or the form, wall or testimonial it pointed to has been removed. Testimonials that were hidden or never approved do not have public pages.
      </p>
      <div className="mt-6 flex gap-2">
        <ButtonLink href="/" variant="secondary">Home</ButtonLink>
        <ButtonLink href="/app" variant="ghost">Dashboard</ButtonLink>
      </div>
    </main>
  );
}
