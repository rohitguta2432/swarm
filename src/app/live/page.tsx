import Link from "next/link";
import type { Metadata } from "next";
import Icon from "@/components/Icon";
import RoomPresenceCount from "./[room]/RoomPresenceCount";

export const metadata: Metadata = {
  title: "Live rooms",
  description:
    "Go live with a problem — screen-share a bug, run office hours, or pair-build an AI agent in real time with the Swarm community.",
  alternates: { canonical: "/live" },
};

// Exported so src/app/sitemap.ts can enumerate the live-room slugs from one
// source of truth (no hardcoded duplication of the slug strings).
export const ROOMS = [
  { title: "Live debugging: MCP servers", slug: "mcp-debugging", host: "rohit", when: "Today · 8:00 PM IST", status: "live" as const, tags: ["mcp", "claude-code"] },
  { title: "Office hours: shipping your first eval gate", slug: "eval-gate-office-hours", host: "kevin_w", when: "Tomorrow · 6:30 PM IST", status: "soon" as const, tags: ["evals", "agents"] },
  { title: "Pair-build: a local agent on Ollama", slug: "ollama-pair-build", host: "sana", when: "Sat · 11:00 AM IST", status: "scheduled" as const, tags: ["ollama", "local-llm"] },
];

const STATUS = {
  live: { label: "LIVE", cls: "bg-danger-bg text-danger", dot: "bg-danger" },
  soon: { label: "Starting soon", cls: "bg-accent-subtle text-accent-ink", dot: "bg-accent" },
  scheduled: { label: "Scheduled", cls: "bg-surface-muted text-ink-2", dot: "bg-ink-3" },
};

export default function LivePage() {
  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm font-semibold text-ink-2 transition-colors hover:text-accent-ink">
        ← Back to the swarm
      </Link>

      <div className="space-y-2">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.02em] text-ink">Live rooms</h1>
        <p className="max-w-xl text-[15px] text-ink-2">
          Go live with a problem — screen-share a bug, run weekly office hours, or pair-build an agent
          in real time. Scheduled rooms keep the swarm meeting even before it&apos;s a crowd.
        </p>
        <Link
          href={`/live/${ROOMS[0].slug}`}
          className="mt-1 inline-flex h-11 items-center gap-1.5 border-2 border-ink bg-accent px-4 text-sm font-bold text-ink shadow-[var(--shadow-hard-sm)] transition-all hover:bg-accent-hover hover:shadow-[var(--shadow-hard)]"
        >
          <Icon name="dot" size={14} /> Go live with a problem
        </Link>
      </div>

      <div className="space-y-3">
        {ROOMS.map((r) => {
          const s = STATUS[r.status];
          return (
            <div
              key={r.title}
              className="flex flex-col items-start gap-3 border-2 border-ink bg-surface p-4 shadow-[var(--shadow-hard)] sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[12px]">
                  <span className={`inline-flex items-center gap-1.5 border-[1.5px] border-ink px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${s.cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <span className="text-ink-3">{r.when}</span>
                </div>
                <h3 className="mt-1.5 truncate text-[15px] font-bold text-ink">{r.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-ink-3">
                  <span>hosted by {r.host}</span>
                  <RoomPresenceCount slug={r.slug} />
                  <span className="flex gap-2">
                    {r.tags.map((t) => (
                      <span key={t} className="font-medium text-ink-2 before:text-ink-3 before:content-['#']">
                        {t}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
              <Link
                href={`/live/${r.slug}`}
                className={`inline-flex h-11 w-full shrink-0 items-center justify-center border-2 border-ink px-4 text-sm font-bold transition-colors sm:w-auto ${
                  r.status === "live"
                    ? "bg-accent text-ink hover:bg-accent-hover"
                    : "bg-surface text-ink hover:bg-surface-muted"
                }`}
              >
                {r.status === "live" ? "Join" : "Open room"}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
