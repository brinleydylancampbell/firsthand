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
  description: "Testimonials in your customers’ own words. Collected with consent, found in seconds, shown anywhere with a 1 KB embed.",
};

/* Direction contract, kept in the emitted markup so it can be audited against the render. */
const CONTRACT = `<!--
THESIS: The product is the pitch. One line, one button, and the live demo widget on the landing page; everything else is the dashboard itself. No sections that tell what the inside could show.
OWN-WORLD: Warm off-white ground (#f7f6f3), white cards, one purple (#7858d8) used only where you act. Inter Tight display, Inter body, Plex Mono for data. 16px cards, 12px buttons, pill chips. Sibling to SubbyFlow.
STORY: Visitor reads one line, sees real testimonials rendering in the real embed, opens the demo with one click and is inside the owner's dashboard.
FIRST VIEWPORT: Left-aligned headline and one-line lede, "Open the demo" button, then the demo wall widget in a white panel.
FORM: User-pinned direction (SubbyFlow's discipline; show, don't tell). No roll.
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
