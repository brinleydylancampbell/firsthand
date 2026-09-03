import Link from "next/link";
import { Arcs } from "./arcs";
import { DemoButton } from "./demo-form";

/** Second ink band, same material as the first, so they read as bookends. */
export function Closing() {
  return (
    <section className="relative overflow-hidden bg-band text-white">
      <Arcs className="pointer-events-none absolute -left-56 top-1/2 h-[640px] w-[640px] -translate-y-1/2 -scale-x-100 text-white/[0.07]" />
      <div className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">See it from the owner’s side.</h2>
          <p className="mt-4 site-lede text-white/65">Any email gets you into the demo workspace. Approve a testimonial, search for one, build a widget. It resets overnight.</p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <DemoButton size="lg" className="h-[52px] px-6">Sign in to the demo</DemoButton>
            <Link href="/f/demo/interview" className="site-body text-white/70 underline underline-offset-4 hover:text-white">
              Or take the three-minute interview first
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
