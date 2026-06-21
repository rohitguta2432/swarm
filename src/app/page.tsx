import Link from "next/link";
import { getThreads } from "@/lib/data";
import type { ThreadKind } from "@/lib/types";
import ThreadCard from "@/components/ThreadCard";

const TABS: { key: "all" | ThreadKind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "question", label: "Questions" },
  { key: "discussion", label: "Discussions" },
  { key: "show", label: "Show & tell" },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = (TABS.find((t) => t.key === tab)?.key ?? "all") as "all" | ThreadKind;
  const threads = getThreads().filter((t) => active === "all" || t.kind === active);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Where agent builders <span className="text-amber-500">ask, go live, and ship</span>.
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-zinc-400">
          Post a problem and an AI answers in seconds — then the swarm of builders refines it.
          The room is never empty. Niche to people building Claude Code skills, MCP servers,
          multi-agent systems and local-LLM stacks.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/ask"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-amber-400"
          >
            Ask the swarm →
          </Link>
          <Link
            href="/live"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-white/30"
          >
            Join a live room
          </Link>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 text-sm">
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <Link
              key={t.key}
              href={t.key === "all" ? "/" : `/?tab=${t.key}`}
              className={`-mb-px border-b-2 px-3 py-2 transition ${
                isActive
                  ? "border-amber-500 text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {threads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
    </div>
  );
}
