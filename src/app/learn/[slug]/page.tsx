import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTopic } from "@/lib/knowledge";
import { getThread } from "@/lib/data";
import Markish from "@/components/Markish";
import { jsonLd, learnArticleLd, breadcrumbLd } from "@/lib/jsonld";

// Dynamic detail page for a knowledge topic. Mirrors src/app/t/[id]/page.tsx for
// Next 16: params is a Promise and MUST be awaited in both generateMetadata and
// the default export (synchronous params access is gone).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  // absolute bypasses the root template so it stays "Not found · Swarm" (no doubling).
  if (!topic) return { title: { absolute: "Not found · Swarm" } };
  // Bare title — root title.template appends " · Swarm". Canonical + per-topic OG.
  return {
    title: topic.title,
    description: topic.summary,
    alternates: { canonical: `/learn/${slug}` },
    openGraph: {
      type: "article",
      title: topic.title,
      description: topic.summary,
      url: `/learn/${slug}`,
    },
  };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  // Resolve cross-linked threads to real seed titles; guard undefined ids.
  const related = topic.relatedThreadIds
    .map((id) => getThread(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <article className="space-y-6">
      {/* Structured data — the topic as a TechArticle, plus a breadcrumb trail. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(learnArticleLd({ id: topic.id, title: topic.title, summary: topic.summary })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbLd([
              { name: "Swarm", path: "/" },
              { name: "Learn", path: "/learn" },
              { name: topic.title, path: `/learn/${topic.id}` },
            ]),
          ),
        }}
      />
      <Link
        href="/learn"
        className="text-sm font-semibold text-ink-2 transition-colors hover:text-accent-ink"
      >
        ← All topics
      </Link>

      {/* Header */}
      <header className="border-2 border-ink bg-surface p-4 shadow-[var(--shadow-hard)] sm:p-5">
        <div className="mb-2 flex items-center gap-2 text-[12px]">
          <span className="border-[1.5px] border-ink bg-surface-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-2">
            Knowledge
          </span>
        </div>
        <h1 className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-ink">
          {topic.title}
        </h1>
        <p className="mt-2 text-[16px] leading-relaxed text-ink-2">{topic.summary}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
          {topic.tags.map((tag) => (
            <span key={tag} className="font-medium text-ink-2 before:text-ink-3 before:content-['#']">
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Sections */}
      <section className="space-y-3">
        {topic.sections.map((s, i) => (
          <div key={i} className="border-2 border-ink bg-surface p-4 shadow-[var(--shadow-hard)] sm:p-5">
            <h2 className="font-display text-[18px] font-bold leading-snug tracking-[-0.01em] text-ink">
              {s.heading}
            </h2>
            <Markish text={s.body} className="mt-2 text-[15px] leading-relaxed text-ink-2" />
          </div>
        ))}
      </section>

      {/* Related threads from the feed */}
      {related.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink">
              Related threads
            </h2>
            <span className="h-0.5 flex-1 bg-ink" />
          </div>
          <div className="space-y-3">
            {related.map((t) => (
              <Link
                key={t.id}
                href={`/t/${t.id}`}
                className="group block border-2 border-ink bg-surface p-4 shadow-[var(--shadow-hard)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-hard-amber)]"
              >
                <h3 className="text-[15px] font-bold leading-snug text-ink group-hover:text-accent-ink">
                  {t.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-ink-3">
                  {t.tags.map((tag) => (
                    <span key={tag} className="font-medium text-ink-2 before:text-ink-3 before:content-['#']">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
