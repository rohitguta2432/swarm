import Link from "next/link";

const ROOMS = [
  {
    title: "Live debugging: MCP servers",
    host: "rohit",
    when: "Today · 8:00 PM IST",
    status: "live" as const,
    here: 12,
    tags: ["mcp", "claude-code"],
  },
  {
    title: "Office hours: shipping your first eval gate",
    host: "kevin_w",
    when: "Tomorrow · 6:30 PM IST",
    status: "soon" as const,
    here: 0,
    tags: ["evals", "agents"],
  },
  {
    title: "Pair-build: a local agent on Ollama",
    host: "sana",
    when: "Sat · 11:00 AM IST",
    status: "scheduled" as const,
    here: 0,
    tags: ["ollama", "local-llm"],
  },
];

const STATUS = {
  live: { label: "● LIVE", cls: "text-red-400 bg-red-500/10 border-red-500/30" },
  soon: { label: "Starting soon", cls: "text-amber-300 bg-amber-500/10 border-amber-500/25" },
  scheduled: { label: "Scheduled", cls: "text-zinc-300 bg-white/5 border-white/15" },
};

export default function LivePage() {
  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-zinc-500 hover:text-amber-400">
        ← Back to the swarm
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Live rooms</h1>
        <p className="max-w-xl text-[15px] text-zinc-400">
          Go live with a problem — screen-share a bug, run weekly office hours, or pair-build an
          agent in real time. Scheduled rooms keep the swarm meeting even before it&apos;s a crowd.
        </p>
        <button className="mt-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-amber-400">
          + Go live with a problem
        </button>
      </div>

      <div className="space-y-3">
        {ROOMS.map((r) => {
          const s = STATUS[r.status];
          return (
            <div
              key={r.title}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`rounded-full border px-2 py-0.5 font-medium ${s.cls}`}>{s.label}</span>
                  <span className="text-zinc-500">{r.when}</span>
                </div>
                <h3 className="mt-1.5 truncate text-[15px] font-semibold text-zinc-100">{r.title}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                  <span>hosted by {r.host}</span>
                  {r.status === "live" && <span className="text-zinc-400">· {r.here} here now</span>}
                  <span className="flex gap-1.5">
                    {r.tags.map((t) => (
                      <span key={t} className="rounded bg-white/5 px-1.5 py-0.5 text-zinc-400">
                        {t}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
              <button
                className={`shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                  r.status === "live"
                    ? "bg-amber-500 text-black hover:bg-amber-400"
                    : "border border-white/15 text-zinc-200 hover:border-white/30"
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
