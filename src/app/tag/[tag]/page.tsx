import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getThreadsByTag, getLinksByTag, getTopicsByTag, normalizeTag } from "@/lib/tags";
import ThreadCard from "@/components/ThreadCard";
import Icon from "@/components/Icon";
import { jsonLd, tagCollectionLd, breadcrumbLd } from "@/lib/jsonld";

const SITE_URL = "https://swarm.rohitraj.tech";

// Programmatic-SEO tag landing page. Next 16: params is a Promise and MUST be
// awaited in both generateMetadata and the default export — mirrors src/app/t/[id]/page.tsx
// and src/app/learn/[slug]/page.tsx. Docs read:
//   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md
//   node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md
//   node_modules/next/dist/docs/01-app/03-api-reference/04-functions/not-found.md

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag: raw } = await params;
  const tag = normalizeTag(decodeURIComponent(raw));
  const [threads, links] = await Promise.all([getThreadsByTag(tag), getLinksByTag(tag)]);
  const topics = getTopicsByTag(tag);

  // Thin/empty tags are noindex via notFound() in the page; absolute title here keeps the
  // metadata path consistent with the other dynamic routes when there's no content.
  if (threads.length + links.length + topics.length === 0) {
    return { title: { absolute: "Not found · Swarm" } };
  }

  // Bare title — root title.template appends " · Swarm". Canonical + per-tag OG.
  return {
    title: `#${tag} — agent-builder threads & reads`,
    description: `Everything on Swarm tagged #${tag}: ${threads.length} thread${threads.length === 1 ? "" : "s"} and ${links.length} curated read${links.length === 1 ? "" : "s"} for developers building AI agents.`,
    alternates: { canonical: `/tag/${tag}` },
    openGraph: {
      type: "website",
      title: `#${tag} — agent-builder threads & reads`,
      description: `Threads and curated reads tagged #${tag} on Swarm — the community for developers building AI agents.`,
      url: `/tag/${tag}`,
    },
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: raw } = await params;
  const tag = normalizeTag(decodeURIComponent(raw));

  const [threads, links] = await Promise.all([getThreadsByTag(tag), getLinksByTag(tag)]);
  const topics = getTopicsByTag(tag);

  // Don't index empty/thin pages.
  if (threads.length + links.length + topics.length === 0) notFound();

  // ItemList nodes for structured data: on-site thread pages + external read URLs.
  const ldItems = [
    ...threads.map((t) => ({ url: `${SITE_URL}/t/${t.id}`, name: t.title })),
    ...links.map((l) => ({ url: l.url, name: l.title })),
  ];

  return (
    <div className="space-y-6">
      {/* Structured data — the tag page as a CollectionPage of matching items, + breadcrumb. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(tagCollectionLd(tag, ldItems)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbLd([
              { name: "Swarm", path: "/" },
              { name: "Tags", path: "/tags" },
              { name: `#${tag}`, path: `/tag/${tag}` },
            ]),
          ),
        }}
      />

      <Link
        href="/tags"
        className="text-sm font-semibold text-ink-2 transition-colors hover:text-accent-ink"
      >
        ← All tags
      </Link>

      {/* Header */}
      <header className="rounded-[18px] border border-border bg-surface p-5 shadow-[var(--shadow-xs)] sm:p-6">
        <h1 className="font-display text-[30px] font-extrabold leading-tight tracking-[-0.025em] text-ink before:text-ink-3 before:content-['#']">
          {tag}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
          {threads.length} thread{threads.length === 1 ? "" : "s"} and {links.length} curated read
          {links.length === 1 ? "" : "s"} tagged{" "}
          <span className="font-medium text-accent-ink before:text-ink-3 before:content-['#']">{tag}</span>{" "}
          — from the swarm of developers building AI agents.
        </p>
      </header>

      {/* Matching threads — reuse the feed card */}
      {threads.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.12em] text-ink-2">
              Threads
            </h2>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-3">
            {threads.map((t) => (
              <ThreadCard key={t.id} thread={t} />
            ))}
          </div>
        </section>
      )}

      {/* Matching learn topics */}
      {topics.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.12em] text-ink-2">
              Learn
            </h2>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-3">
            {topics.map((t) => (
              <Link
                key={t.id}
                href={`/learn/${t.id}`}
                className="group block rounded-[16px] border border-border bg-surface p-4 shadow-[var(--shadow-xs)] transition-colors hover:border-accent/40 hover:shadow-[var(--shadow-glow)]"
              >
                <h3 className="text-[15px] font-bold leading-snug text-ink group-hover:text-accent-ink">
                  {t.title}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-2">{t.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Matching reads from /news */}
      {links.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.12em] text-ink-2">
              Reads
            </h2>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-3">
            {links.map((link) => (
              <article
                key={link.id}
                className="rounded-[16px] border border-border bg-surface p-4 shadow-[var(--shadow-xs)]"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="rounded-md bg-surface-muted px-2 py-0.5 font-semibold text-ink-2">
                    {link.sourceDomain}
                  </span>
                  <span className="text-ink-3">{link.createdAt}</span>
                </div>
                <h3 className="font-display text-[16px] font-bold leading-snug tracking-[-0.01em] text-ink">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-accent-ink"
                  >
                    {link.title}
                  </a>
                </h3>
                <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-2">
                  {link.summary}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Back-links — internal-linking + crawl path home */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4 text-sm font-semibold text-ink-2">
        <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-accent-ink">
          <Icon name="chevron-up" size={14} /> Back to the swarm
        </Link>
        <Link href="/tags" className="transition-colors hover:text-accent-ink">
          Browse all tags
        </Link>
      </div>
    </div>
  );
}
