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
        <h1 className="font-display text-[30px] font-extrabold tracking-[-0.025em] text-ink">Browse by tag</h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-ink-2">
          Every topic the <span className="font-medium text-accent-ink">swarm</span> is building around.
          Tap a tag to see the threads and curated reads on it.
        </p>
      </div>

      <ul className="flex flex-wrap gap-2.5">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link
              href={`/tag/${tag}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-accent/25 bg-[rgba(34,197,94,0.1)] px-3 py-1.5 text-[14px] font-medium text-accent-ink shadow-[var(--shadow-xs)] transition-colors hover:bg-[rgba(34,197,94,0.18)] before:text-accent-ink/55 before:content-['#']"
            >
              {tag}
              <span className="text-[11px] font-bold text-accent-ink/55">
                {count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
