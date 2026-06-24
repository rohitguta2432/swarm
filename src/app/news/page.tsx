import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getAllLinks } from "@/lib/news";
import Avatar from "@/components/Avatar";
import Markish from "@/components/Markish";
import Icon from "@/components/Icon";
import { jsonLd, newsItemListLd } from "@/lib/jsonld";
import NewsSubmit from "./NewsSubmit";
import TagLink from "@/components/TagLink";

export const metadata: Metadata = {
  // Bare phrase — root title.template appends " · Swarm".
  title: "News: agent-building reads",
  description:
    "A community-curated feed of the best tech/AI articles for agent builders — every link auto-summarized by Swarm's AI so the feed stays scannable.",
  alternates: { canonical: "/news" },
};

// /news — a Server Component (modeled on src/app/learn/page.tsx + ask/page.tsx).
// Reads auth() for gating and getAllLinks() for the feed. The submit area is
// session-gated via the NewsSubmit client island: signed-in users get the form,
// signed-out users get a Continue with Google button (never a throwing form).
export default async function NewsPage() {
  const session = await auth();
  const links = await getAllLinks();

  return (
    <div className="space-y-6">
      {/* Structured data — the curated link feed as an ItemList. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(newsItemListLd(links.map((l) => ({ url: l.url, title: l.title })))),
        }}
      />
      <Link href="/" className="text-sm font-semibold text-ink-2 transition-colors hover:text-accent-ink">
        ← Back to the swarm
      </Link>

      <div className="space-y-2">
        <h1 className="font-display text-[30px] font-extrabold tracking-[-0.025em] text-ink">News</h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-ink-2">
          The best <span className="font-medium text-accent-ink">agent-building reads</span>, shared by
          the swarm. Drop a link and Swarm&apos;s AI writes the summary first — so the feed is useful at a
          glance, not just a wall of URLs.
        </p>
      </div>

      <NewsSubmit signedIn={!!session?.user} />

      <div className="space-y-3">
        {links.map((link) => (
          <article
            key={link.id}
            className="space-y-3 rounded-[18px] border border-border bg-surface p-5 shadow-[var(--shadow-xs)] sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              <span className="rounded-md bg-surface-muted px-2 py-0.5 font-semibold text-ink-2">
                {link.sourceDomain}
              </span>
              <span className="text-ink-3">{link.createdAt}</span>
            </div>

            <h2 className="font-display text-[18px] font-bold leading-snug tracking-[-0.01em] text-ink">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-accent-ink"
              >
                {link.title}
              </a>
            </h2>

            <div className="rounded-[12px] border border-border border-l-[5px] border-l-accent bg-accent-subtle p-3">
              <div className="mb-2 flex items-center gap-1.5 text-[11px]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                  <Icon name="spark" size={12} />
                </span>
                <span className="font-bold uppercase tracking-wide text-accent-ink">Swarm AI summary</span>
              </div>
              <Markish text={link.summary} className="text-[14px] leading-relaxed text-ink-2" />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-ink-2">
              <span className="flex items-center gap-1.5">
                <Avatar name={link.author} hue={link.avatarHue} size={22} image={link.authorImage} />
                <span className="font-medium text-ink">{link.author}</span>
              </span>
              {link.tags.length > 0 && (
                <span className="flex flex-wrap items-center gap-2">
                  {link.tags.map((tag) => (
                    <TagLink key={tag} tag={tag} />
                  ))}
                </span>
              )}
              <span className="ml-auto flex items-center gap-1 font-semibold text-ink-2">
                <Icon name="chevron-up" size={14} />
                {link.upvotes}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
