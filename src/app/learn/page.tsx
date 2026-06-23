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
      className="group flex flex-col gap-2 border-2 border-ink bg-surface p-4 shadow-[var(--shadow-hard)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-hard-amber)]"
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
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-ink">
          Learn: building AI agents
        </h1>
        <p className="max-w-2xl text-[15px] text-ink-2">
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
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink">
              Design patterns
            </h2>
            <span className="h-0.5 flex-1 bg-ink" />
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
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink">
              Operational practices
            </h2>
            <span className="h-0.5 flex-1 bg-ink" />
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

      <KnowledgeAsk />
    </div>
  );
}
