import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { Hero } from "@/components/site/hero";
import { Outcomes } from "@/components/site/outcomes";
import { Platform } from "@/components/site/platform";
import { EmbedProof } from "@/components/site/embed-proof";
import { Deal } from "@/components/site/deal";
import { Faq } from "@/components/site/faq";
import { Closing } from "@/components/site/closing";
import { SiteFooter } from "@/components/site/site-footer";

const demo = process.env.DEMO_WORKSPACE_SLUG ?? "demo";

export const metadata: Metadata = {
  title: "Firsthand · Testimonials in your customers’ own words",
  description:
    "A three-minute conversation instead of a blank box. Your customer approves every word and chooses how they’re named. Consent, provenance and a 1 KB embed built in.",
  openGraph: { images: [`/api/og/wall/${demo}`] },
};

/** Seven sections, one action. The order is the argument. */
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <Outcomes />
        <Platform />
        <EmbedProof />
        <Deal />
        <Faq />
        <Closing />
      </main>
      <SiteFooter />
    </>
  );
}
