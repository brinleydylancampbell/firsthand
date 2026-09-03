import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

/* Inter Tight (display, quotes) + Inter (body) + IBM Plex Mono (data).
   Self-hosted by next/font. Do not add a Google Fonts @import. */
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const interTight = Inter_Tight({ subsets: ["latin"], display: "swap", variable: "--font-inter-tight" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], display: "swap", weight: ["400", "500"], variable: "--font-plex-mono" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "Firsthand", template: "%s · Firsthand" },
  description: "Testimonials in your customers’ own words. A three-minute conversation instead of a blank box, with consent and proof built in.",
};

/* Direction contract for the landing redesign, kept in the emitted markup so it
   survives the build and can be audited against the render. */
const CONTRACT = `<!--
THESIS: One page, one action, nothing to navigate. Firsthand shows a conversation becoming a testimonial and asks for one thing: sign in to the demo. It refuses the six-problem grid, the research narrative, the stats strip and the nav bar.
OWN-WORLD: Warm off-white ground (#f7f6f3), white cards, two ink bands bookending the page, one purple (#7858d8) used only where you act. Inter Tight display, Inter body, Plex Mono for data. 16px cards, 12px buttons, pill chips. Figures drawn in DOM, never screenshots. Sibling to SubbyFlow.
STORY: Visitor reads one line, watches a customer's answers turn into a quote they approve, understands consent and proof are built in, and signs in to see the owner's side.
FIRST VIEWPORT: Centred headline and lede, an email field with one purple button, then a wide white panel: the interview mid-conversation on the left, the draft assembling on the right, the consent row beneath.
FORM: User-pinned direction (SubbyFlow's discipline); no roll.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} ${plexMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-xl focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:shadow-card"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
