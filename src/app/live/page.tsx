import Link from "next/link";
import Icon from "@/components/Icon";

const ROOMS = [
  { title: "Live debugging: MCP servers", host: "rohit", when: "Today · 8:00 PM IST", status: "live" as const, here: 12, tags: ["mcp", "claude-code"] },
  { title: "Office hours: shipping your first eval gate", host: "kevin_w", when: "Tomorrow · 6:30 PM IST", status: "soon" as const, here: 0, tags: ["evals", "agents"] },
  { title: "Pair-build: a local agent on Ollama", host: "sana", when: "Sat · 11:00 AM IST", status: "scheduled" as const, here: 0, tags: ["ollama", "local-llm"] },
];

const STATUS = {
  live: { label: "LIVE", cls: "bg-danger-bg text-danger", dot: "bg-danger" },
  soon: { label: "Starting soon", cls: "bg-accent-subtle text-accent-ink", dot: "bg-accent" },
  scheduled: { label: "Scheduled", cls: "bg-surface-muted text-ink-2", dot: "bg-ink-3" },
};

export default function LivePage() {
  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-ink-3 transition-colors hover:text-accent-ink">
        ← Back to the swarm
      </Link>

      <div className="space-y-2">
        <h1 className="text-[24px] font-semibold tracking-[-0.01em] text-ink">Live rooms</h1>
        <p className="max-w-xl text-[15px] text-ink-2">
          Go live with a problem — screen-share a bug, run weekly office hours, or pair-build an agent
          in real time. Scheduled rooms keep the swarm meeting even before it&apos;s a crowd.
        </p>
        <button className="mt-1 inline-flex h-11 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-semibold text-ink transition-colors hover:bg-accent-hover">
          <Icon name="dot" size={14} /> Go live with a problem
        </button>
      </div>

      <div className="space-y-3">
        {ROOMS.map((r) => {
          const s = STATUS[r.status];
          return (
            <div
              key={r.title}
              className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-xs)] sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[12px]">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium ${s.cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <span className="text-ink-3">{r.when}</span>
                </div>
                <h3 className="mt-1.5 truncate text-[15px] font-medium text-ink">{r.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-ink-3">
                  <span>hosted by {r.host}</span>
                  {r.status === "live" && <span className="text-ink-2">· {r.here} here now</span>}
                  <span className="flex gap-1.5">
                    {r.tags.map((t) => (
                      <span key={t} className="rounded-md bg-surface-muted px-1.5 py-0.5 text-ink-2">
                        {t}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
              <button
                className={`h-11 w-full shrink-0 rounded-lg px-4 text-sm font-semibold transition-colors sm:w-auto ${
                  r.status === "live"
                    ? "bg-accent text-ink hover:bg-accent-hover"
                    : "border border-border text-ink hover:bg-surface-muted"
                }`}
              >
                {r.status === "live" ? "Join" : "Remind me"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
