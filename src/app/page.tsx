import Link from "next/link";
import { getAllThreads } from "@/lib/threads";
import { getAllTags } from "@/lib/tags";
import type { Thread, ThreadKind } from "@/lib/types";
import ThreadCard from "@/components/ThreadCard";
import LiveRail from "@/components/LiveRail";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";
import { ROOMS } from "@/app/live/page";

const TABS: { key: "all" | ThreadKind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "question", label: "Questions" },
  { key: "discussion", label: "Discussions" },
  { key: "show", label: "Show & tell" },
];

// Top builders = authors ranked by total upvotes earned across their threads.
// Derived live from the feed (no leaderboard table); "role" is their two most-
// used tags, so it stays honest to what they actually post about.
function deriveTopBuilders(threads: Thread[], limit = 4) {
  const map = new Map<string, { name: string; hue: number; points: number; tags: Map<string, number> }>();
  for (const t of threads) {
    const e = map.get(t.author) ?? { name: t.author, hue: t.avatarHue, points: 0, tags: new Map() };
    e.points += t.upvotes;
    for (const tag of t.tags) e.tags.set(tag, (e.tags.get(tag) ?? 0) + 1);
    map.set(t.author, e);
  }
  return [...map.values()]
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map((e, i) => ({
      rank: i + 1,
      name: e.name,
      hue: e.hue,
      role: [...e.tags.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t).join(" · "),
      points: e.points,
    }));
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active = (TABS.find((t) => t.key === tab)?.key ?? "all") as "all" | ThreadKind;
  const activeLabel = TABS.find((t) => t.key === active)?.label ?? "threads";

  const all = await getAllThreads();
  const threads = all.filter((t) => active === "all" || t.kind === active);
  const trending = (await getAllTags()).slice(0, 9);
  const builders = deriveTopBuilders(all);
  const liveCount = ROOMS.filter((r) => r.status === "live").length;

  return (
    <div className="space-y-12 sm:space-y-14">
      {/* Hero — centered, demonstrates the wedge */}
      <section className="mx-auto max-w-[880px] pt-6 text-center sm:pt-10">
        <h1 className="text-balance text-[40px] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[56px] lg:text-[68px] lg:leading-[1.02]">
          Where builders <span className="text-accent">ask</span>,<br className="hidden sm:block" />{" "}
          <span className="text-accent-ink">go live</span>, and{" "}
          {/* Faithful to the mockup's gradient "ship", but the light stop is pulled
              from #22c55e (~2.3:1, fails AA) to #16a34a (~3.1:1) so every pixel of
              the 68px heading clears WCAG AA-large — matching this project's
              never-ship-low-contrast-text rule. */}
          <span className="bg-gradient-to-b from-[#16a34a] to-[#0f6b34] bg-clip-text text-transparent">ship</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-[620px] text-pretty text-[17px] leading-relaxed text-ink-2 sm:text-[19px]">
          Post a problem and the swarm answers in seconds — then refines it together. Built for people
          shipping Claude Code skills, MCP servers, multi-agent systems, and local-LLM stacks.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/ask"
            className="inline-flex items-center gap-2 rounded-[12px] bg-accent px-6 py-[15px] text-[16px] font-bold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-hover"
          >
            Ask the swarm <Icon name="arrow-right" size={17} />
          </Link>
          <Link
            href="/live"
            className="inline-flex items-center gap-2 rounded-[12px] border border-border bg-surface px-6 py-[15px] text-[16px] font-semibold text-ink transition-colors hover:border-accent/50 hover:bg-surface-muted"
          >
            Join a live room
          </Link>
          {liveCount > 0 && (
            <Link href="/live" className="inline-flex items-center gap-2 pl-1.5 text-[14.5px] font-medium text-ink-2 transition-colors hover:text-ink">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
              <span>
                <b className="font-bold text-ink">{liveCount}</b> live now
              </span>
            </Link>
          )}
        </div>
      </section>

      {/* Live rail */}
      <LiveRail rooms={ROOMS} />

      {/* Content grid — feed + sticky sidebar */}
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_320px]">
        {/* main column */}
        <div className="min-w-0">
          <h2 className="sr-only">Threads</h2>
          {/* Segmented filter — soft pill, green active */}
          <div className="-mx-4 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
            <div className="mb-6 inline-flex gap-1 rounded-[12px] border border-border bg-surface p-1 shadow-[var(--shadow-xs)]">
              {TABS.map((t) => {
                const isActive = t.key === active;
                return (
                  <Link
                    key={t.key}
                    href={t.key === "all" ? "/" : `/?tab=${t.key}`}
                    aria-current={isActive ? "page" : undefined}
                    className={`whitespace-nowrap rounded-[9px] px-4 py-2 text-[14px] transition-colors ${
                      isActive ? "bg-accent font-bold text-white" : "font-medium text-ink-2 hover:bg-black/[0.04] hover:text-ink"
                    }`}
                  >
                    {t.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {threads.length === 0 ? (
              <div className="rounded-[18px] border border-border bg-surface p-8 text-center shadow-[var(--shadow-xs)]">
                <p className="text-[18px] font-bold text-ink">
                  {active === "all" ? "No threads yet" : `No ${activeLabel.toLowerCase()} yet`}
                </p>
                <p className="mx-auto mt-1.5 max-w-sm text-[14px] leading-relaxed text-ink-2">
                  Be the first to post — ask the swarm and an AI answers in seconds, then builders refine it.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/ask"
                    className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-hover"
                  >
                    Ask the swarm <Icon name="arrow-right" size={16} />
                  </Link>
                  {active !== "all" ? (
                    <Link href="/" className="text-sm font-semibold text-accent-ink transition-colors hover:text-accent">
                      View all threads
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : (
              threads.map((thread) => <ThreadCard key={thread.id} thread={thread} />)
            )}
          </div>
        </div>

        {/* sidebar */}
        <aside className="flex flex-col gap-[18px] lg:sticky lg:top-[92px]">
          {/* Trending tags */}
          {trending.length > 0 && (
            <div className="rounded-[18px] border border-border bg-surface p-5 shadow-[var(--shadow-xs)]">
              <div className="mb-3.5 text-[12px] font-bold uppercase tracking-[0.14em] text-ink-3">Trending tags</div>
              <div className="flex flex-wrap gap-2">
                {trending.map((t) => (
                  <Link
                    key={t.tag}
                    href={`/tag/${t.tag}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-accent/25 bg-[rgba(34,197,94,0.1)] px-2.5 py-1.5 text-[13px] font-medium text-accent-ink transition-colors hover:bg-[rgba(34,197,94,0.18)]"
                  >
                    #{t.tag} <span className="text-ink-3">{t.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Top builders */}
          {builders.length > 0 && (
            <div className="rounded-[18px] border border-border bg-surface p-5 shadow-[var(--shadow-xs)]">
              <div className="mb-4 text-[12px] font-bold uppercase tracking-[0.14em] text-ink-3">Top builders this week</div>
              <div className="flex flex-col gap-3.5">
                {builders.map((b) => (
                  <div key={b.name} className="flex items-center gap-3">
                    <span className="w-4 text-[13px] font-bold text-ink-3">{b.rank}</span>
                    <Avatar name={b.name} hue={b.hue} size={30} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold text-ink">{b.name}</div>
                      {b.role && <div className="truncate text-[12px] text-ink-3">{b.role}</div>}
                    </div>
                    <span className="text-[13px] font-bold text-accent">{b.points}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post-a-build prompt */}
          <div className="rounded-[18px] border border-accent/30 bg-gradient-to-br from-[rgba(34,197,94,0.12)] to-[rgba(34,197,94,0.04)] p-5">
            <div className="text-[15px] font-bold text-ink">Got something working?</div>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">
              Share it in Show &amp; Tell — the swarm loves a good build log.
            </p>
            <Link
              href="/ask"
              className="mt-3.5 flex w-full items-center justify-center rounded-[10px] bg-accent px-4 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-accent-hover"
            >
              Post a build
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
