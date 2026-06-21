import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Swarm — ask, go live, ship together · for agent builders",
  description:
    "The community for developers building AI agents. Post a problem and an AI answers in seconds; the swarm of builders refines it. Discuss, go live, share what you ship.",
  metadataBase: new URL("https://swarm.rohitraj.tech"),
  openGraph: {
    title: "Swarm — for agent builders",
    description: "Ask, go live, ship together. AI answers first; the swarm makes it right.",
    url: "https://swarm.rohitraj.tech",
    siteName: "Swarm",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Nav />
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 py-10 text-xs text-zinc-600">
          <div className="border-t border-white/10 pt-6">
            Swarm · a home for agent builders · built by{" "}
            <a href="https://rohitraj.tech" className="text-zinc-400 hover:text-amber-400">
              rohitraj.tech
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
