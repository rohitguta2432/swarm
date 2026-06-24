import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Nav from "@/components/Nav";
import MobileAskBar from "@/components/MobileAskBar";
import { jsonLd, organizationLd, webSiteLd } from "@/lib/jsonld";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Root metadata. Docs read:
//   node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md
//   - title.template (lines 241-289): `default` is required; the template appends to CHILD pages only.
//   - alternates.canonical resolves against metadataBase (lines 392-466).
//   - twitter (lines 674-701) and robots (lines 551-579) shapes.
// The root opengraph-image.tsx auto-fills openGraph.images + twitter:image (file-based metadata has
// higher priority than the metadata object, line 114), so we deliberately do NOT hand-set images here.
export const metadata: Metadata = {
  title: {
    default: "Swarm — ask, go live, ship together · for agent builders",
    template: "%s · Swarm",
  },
  description:
    "The community for developers building AI agents. Post a problem and an AI answers in seconds; the swarm of builders refines it. Discuss, go live, share what you ship.",
  metadataBase: new URL("https://swarm.rohitraj.tech"),
  keywords: [
    "AI agents",
    "agent builders",
    "MCP servers",
    "Claude Code",
    "multi-agent systems",
    "local LLM",
    "evals",
    "agent reliability",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Swarm — for agent builders",
    description: "Ask, go live, ship together. AI answers first; the swarm makes it right.",
    url: "https://swarm.rohitraj.tech",
    siteName: "Swarm",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swarm — for agent builders",
    description: "Ask, go live, ship together. AI answers first; the swarm makes it right.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full">
        {/* Sitewide structured data — Organization + WebSite (with SearchAction). */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationLd()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(webSiteLd()) }} />
        <Nav />
        <main className="mx-auto max-w-3xl px-4 pb-24 pt-7 sm:px-6 sm:pb-12 sm:pt-9">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 sm:pb-10">
          <div className="border-t-2 border-ink pt-6 text-[13px] text-ink-3">
            Swarm · a home for agent builders · built by{" "}
            <a
              href="https://rohitraj.tech"
              className="inline-flex min-h-[44px] items-center text-ink-2 hover:text-accent-ink"
            >
              rohitraj.tech
            </a>
          </div>
        </footer>
        <MobileAskBar />
        {/* Vercel Web Analytics — aggregate, anonymous page-view traffic (top pages,
            referrers, devices). Per-user activity is tracked separately in /admin. */}
        <Analytics />
      </body>
    </html>
  );
}
