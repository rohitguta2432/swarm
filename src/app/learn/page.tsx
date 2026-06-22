import Link from "next/link";
import type { Metadata } from "next";
import { getKnowledge } from "@/lib/knowledge";
import KnowledgeAsk from "@/components/KnowledgeAsk";

export const metadata: Metadata = {
  title: "Learn: building AI agents · Swarm",
  description:
    "The applied how-to of building AI agents — evals, guardrails, tool design, reliability, observability, and cost control.",
};

// /learn index — a Server Component (no params, no async data) modeled on
// src/app/live/page.tsx. Renders the typed knowledge const into cards and embeds
// the interactive KnowledgeAsk leaf below the list.
export default function LearnPage() {
  const topics = getKnowledge();

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-semibold text-ink-2 transition-colors hover:text-accent-ink">
        ← Back to the swarm
      </Link>

      <div className="space-y-2">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-ink">
          Learn: building AI agents
        </h1>
        <p className="max-w-xl text-[15px] text-ink-2">
          What actually goes into a shippable agent — the{" "}
          <span className="font-medium text-accent-ink">evals, guardrails, tool design, reliability,
          observability, and cost control</span>{" "}
          the swarm keeps relearning the hard way. Each topic is grounded in real threads from the feed.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {topics.map((t) => (
          <Link
            key={t.id}
            href={`/learn/${t.id}`}
            className="group flex flex-col gap-2 border-2 border-ink bg-surface p-4 shadow-[var(--shadow-hard)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-hard-amber)]"
          >
            <h2 className="font-display text-[17px] font-bold leading-snug tracking-[-0.01em] text-ink group-hover:text-accent-ink">
              {t.title}
            </h2>
            <p className="text-[14px] leading-relaxed text-ink-2">{t.summary}</p>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 text-[12px]">
              {t.tags.map((tag) => (
                <span key={tag} className="font-medium text-ink-2 before:text-ink-3 before:content-['#']">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <KnowledgeAsk />
    </div>
  );
}
