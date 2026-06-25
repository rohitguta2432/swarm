import Link from "next/link";
import type { Metadata } from "next";
import { getKnowledge } from "@/lib/knowledge";
import type { KnowledgeTopic } from "@/lib/types";
import KnowledgeAsk from "@/components/KnowledgeAsk";

export const metadata: Metadata = {
  // Bare phrase — the root title.template appends " · Swarm" (avoids " · Swarm · Swarm").
  title: "Learn: building AI agents",
  description:
    "The applied how-to of building AI agents — design patterns (prompt chaining, routing, reflection, multi-agent) plus operational practices: evals, guardrails, tool design, reliability, observability, and cost control.",
  alternates: { canonical: "/learn" },
};

// One topic card — shared by both tracks so the markup stays in one place.
function TopicCard({ t }: { t: KnowledgeTopic }) {
  return (
    <Link
      href={`/learn/${t.id}`}
      className="group flex flex-col gap-2 rounded-[16px] border border-border bg-surface p-4 shadow-[var(--shadow-xs)] transition-colors hover:border-accent/40 hover:shadow-[var(--shadow-glow)]"
    >
      <h3 className="font-display text-[17px] font-bold leading-snug tracking-[-0.01em] text-ink group-hover:text-accent-ink">
        {t.title}
      </h3>
      <p className="text-[14px] leading-relaxed text-ink-2">{t.summary}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 text-[12px]">
        {t.tags.map((tag) => (
          <span key={tag} className="font-medium text-ink-2 before:text-ink-3 before:content-['#']">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

// Outside reads, each distilled to one lesson. Deliberately a flat const of
// outbound links — NOT KnowledgeTopics — so they render as an index list here
// and add no /learn/<slug> routes. Add a row when an article earns one.
const READS: { title: string; lesson: string; url: string; source: string }[] = [
  {
    title: "Temporary accounts: let AI agents deploy without a signup",
    lesson:
      "Design auth for agents, not humans — a short-lived token the agent mints itself (claimed to a real account later) beats an OAuth flow no background agent can click through.",
    url: "https://blog.cloudflare.com/temporary-accounts",
    source: "Cloudflare",
  },
  {
    title: "How we built an internal data analytics agent",
    lesson:
      "Curated, layered context — not a bigger model — made GitHub's Qubot both more accurate and ~3x faster. The context is the lever you actually control.",
    url: "https://github.blog/ai-and-ml/github-copilot/how-we-built-an-internal-data-analytics-agent",
    source: "GitHub",
  },
];

// /learn index — a Server Component (no params, no async data) modeled on
// src/app/live/page.tsx. Splits the typed knowledge const into two tracks
// (design patterns vs operational practices) and embeds the interactive
// KnowledgeAsk leaf below the list.
export default function LearnPage() {
  const topics = getKnowledge();
  const patterns = topics.filter((t) => t.track === "patterns");
  // Absent track defaults to operational, so the original 6 topics need no change beyond a tag.
  const operational = topics.filter((t) => t.track !== "patterns");

  return (
    <div className="space-y-8">
      <Link href="/" className="text-sm font-semibold text-ink-2 transition-colors hover:text-accent-ink">
        ← Back to the swarm
      </Link>

      <div className="space-y-2">
        <h1 className="font-display text-[30px] font-extrabold tracking-[-0.025em] text-ink">
          Learn: building AI agents
        </h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-ink-2">
          Two tracks. <span className="font-medium text-accent-ink">Design patterns</span> are how you{" "}
          build an agent — prompt chaining, routing, reflection, multi-agent, and more.{" "}
          <span className="font-medium text-accent-ink">Operational practices</span> are how you run it in
          production — evals, guardrails, reliability, observability, and cost control.
        </p>
      </div>

      {/* Track 1 — Design patterns (how you compose an agent) */}
      {patterns.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.12em] text-ink-2">
              Design patterns
            </h2>
            <span className="h-px flex-1 bg-border" />
            <span className="shrink-0 text-[12px] font-medium text-ink-3">{patterns.length} patterns</span>
          </div>
          <p className="max-w-2xl text-[13px] text-ink-3">
            Adapted from Antonio Gullí&apos;s <span className="font-medium">Agentic Design Patterns</span> —
            how to compose an agent.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {patterns.map((t) => (
              <TopicCard key={t.id} t={t} />
            ))}
          </div>
        </section>
      )}

      {/* Track 2 — Operational practices (how you run an agent in production) */}
      {operational.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.12em] text-ink-2">
              Operational practices
            </h2>
            <span className="h-px flex-1 bg-border" />
            <span className="shrink-0 text-[12px] font-medium text-ink-3">{operational.length} topics</span>
          </div>
          <p className="max-w-2xl text-[13px] text-ink-3">
            What it takes to run an agent in production — the swarm keeps relearning these the hard way.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {operational.map((t) => (
              <TopicCard key={t.id} t={t} />
            ))}
          </div>
        </section>
      )}

      {/* From the field — external reads distilled to one lesson each. Outbound
          links only; intentionally not topics, so they add no /learn routes. */}
      {READS.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.12em] text-ink-2">
              From the field
            </h2>
            <span className="h-px flex-1 bg-border" />
            <span className="shrink-0 text-[12px] font-medium text-ink-3">{READS.length} reads</span>
          </div>
          <p className="max-w-2xl text-[13px] text-ink-3">
            Outside write-ups, each distilled to one lesson. Links open the source.
          </p>
          <ul className="space-y-2">
            {READS.map((r) => (
              <li key={r.url}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-1 rounded-[16px] border border-border bg-surface p-4 shadow-[var(--shadow-xs)] transition-colors hover:border-accent/40 hover:shadow-[var(--shadow-glow)]"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[15px] font-bold leading-snug text-ink group-hover:text-accent-ink">
                      {r.title}
                    </h3>
                    <span className="shrink-0 text-[12px] font-medium text-ink-3">{r.source}</span>
                  </div>
                  <p className="text-[14px] leading-relaxed text-ink-2">{r.lesson}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <KnowledgeAsk />
    </div>
  );
}
