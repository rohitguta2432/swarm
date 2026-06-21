import Link from "next/link";
import { getThreads } from "@/lib/data";
import type { ThreadKind } from "@/lib/types";
import ThreadCard from "@/components/ThreadCard";
import Icon from "@/components/Icon";

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
    <div className="space-y-7 sm:space-y-9">
      {/* Hero — demonstrates the wedge, doesn't just describe it */}
      <section className="space-y-3">
        <h1 className="font-display text-[34px] font-bold leading-[1.12] tracking-[-0.035em] text-ink sm:text-[52px] sm:leading-[1.05]">
          Where agent builders{" "}
          <span className="box-decoration-clone bg-accent px-1.5 text-ink">ask</span>,{" "}
          <span className="box-decoration-clone bg-accent px-1.5 text-ink">go&nbsp;live</span>, and{" "}
          <span className="box-decoration-clone bg-accent px-1.5 text-ink">ship</span>.
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-ink-2">
          Post a problem and an AI answers in seconds — then the swarm of builders refines it.
          Niche to people building Claude Code skills, MCP servers, multi-agent systems and
          local-LLM stacks.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            href="/ask"
            className="inline-flex items-center gap-1.5 border-2 border-ink bg-accent px-4 py-2.5 text-sm font-bold text-ink shadow-[var(--shadow-hard-sm)] transition-all hover:bg-accent-hover hover:shadow-[var(--shadow-hard)]"
          >
            Ask the swarm <Icon name="arrow-right" size={16} />
          </Link>
          <Link
            href="/live"
            className="border-2 border-ink bg-surface px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-surface-muted"
          >
            Join a live room
          </Link>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            128 builders here now
          </span>
        </div>
      </section>

      {/* Segmented tab control — hard-bordered, solid-black active */}
      <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
        <div className="inline-flex border-2 border-ink bg-surface shadow-[var(--shadow-hard-sm)]">
          {TABS.map((t, i) => {
            const isActive = t.key === active;
            return (
              <Link
                key={t.key}
                href={t.key === "all" ? "/" : `/?tab=${t.key}`}
                aria-current={isActive ? "page" : undefined}
                className={`whitespace-nowrap px-4 py-2 text-[13px] font-bold transition-colors ${
                  i > 0 ? "border-l-2 border-ink" : ""
                } ${
                  isActive
                    ? "bg-ink text-surface"
                    : "text-ink-2 hover:bg-surface-muted hover:text-ink"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-3.5">
        {threads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
    </div>
  );
}
