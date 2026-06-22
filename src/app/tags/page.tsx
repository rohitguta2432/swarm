import Link from "next/link";
import type { Metadata } from "next";
import { getAllTags } from "@/lib/tags";

export const metadata: Metadata = {
  // Bare phrase — root title.template appends " · Swarm".
  title: "Browse by tag",
  description:
    "Every topic on Swarm, by tag — MCP, evals, agents, Claude Code, local LLMs and more. Each tag opens a landing page of the matching threads and curated reads for developers building AI agents.",
  alternates: { canonical: "/tags" },
};

// /tags — a crawl hub + internal-linking booster that lists every tag (from the
// real data via getAllTags) as a link to its /tag/<tag> landing page, with counts.
export default async function TagsPage() {
  const tags = await getAllTags();

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-semibold text-ink-2 transition-colors hover:text-accent-ink">
        ← Back to the swarm
      </Link>

      <div className="space-y-2">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-ink">Browse by tag</h1>
        <p className="max-w-xl text-[15px] text-ink-2">
          Every topic the <span className="font-medium text-accent-ink">swarm</span> is building around.
          Tap a tag to see the threads and curated reads on it.
        </p>
      </div>

      <ul className="flex flex-wrap gap-2.5">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link
              href={`/tag/${tag}`}
              className="inline-flex items-center gap-1.5 border-2 border-ink bg-surface px-3 py-1.5 text-[14px] font-medium text-ink-2 shadow-[var(--shadow-hard)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-accent-ink hover:shadow-[var(--shadow-hard-amber)] before:text-ink-3 before:content-['#']"
            >
              {tag}
              <span className="border-[1.5px] border-ink bg-surface-muted px-1.5 text-[11px] font-bold text-ink-2">
                {count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
