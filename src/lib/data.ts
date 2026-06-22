// Seed content for the MVP. Swarm launches NON-empty: it's pre-filled with real
// agent-builder threads so the very first visitor lands in an active room.
//
// Persistence note: these seed threads are always shown. Durable threads now exist
// via src/lib/threads.ts, which merges persisted threads (Supabase, or an in-memory
// fallback when no secrets are set) on top of this seed array. THREADS and getThread
// are consumed by src/lib/threads.ts for that merge + seed-id fallback.

import type { Thread } from "./types";

export const THREADS: Thread[] = [
  {
    id: "mcp-tool-not-showing",
    kind: "question",
    title: "My MCP server starts fine but Claude never lists the tool — what am I missing?",
    body: "stdio transport, server boots and I see my startup log. The tool just never appears in the client. No error anywhere. Node 22, @modelcontextprotocol/sdk latest.",
    author: "devang_b",
    avatarHue: 28,
    tags: ["mcp", "claude-code", "stdio"],
    createdAt: "2h ago",
    upvotes: 14,
    aiAnswer: {
      text: "**Quick triage.** 9/10 this is a stdout pollution issue. On stdio transport the JSON-RPC stream *is* stdout — any `console.log` (even your startup banner) injects non-protocol bytes and the client silently drops the connection's tool list.\n\n- Move every log to **stderr**: `console.error(...)` not `console.log(...)`.\n- Confirm your `tools/list` handler actually returns the array (a thrown error there fails quietly).\n\n**Confirm it:** run the server bare and pipe stdin a `{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}` — if you see your banner mixed into the response, that's the bug.",
      model: "swarm-triage (offline)",
      tookMs: 1840,
    },
    replies: [
      {
        id: "r1",
        author: "maya.k",
        avatarHue: 200,
        body: "This was exactly it for me — one stray console.log in my db init. Switched to stderr and the tool showed up instantly.",
        createdAt: "1h ago",
        isAccepted: true,
      },
      {
        id: "r2",
        author: "devang_b",
        avatarHue: 28,
        body: "Confirmed 🙌 it was a logger writing to stdout. Thank you both.",
        createdAt: "44m ago",
      },
    ],
  },
  {
    id: "evals-vs-vibes",
    kind: "discussion",
    title: "How do you actually eval a judgment-heavy agent without it being pure vibes?",
    body: "Deterministic checks are easy for extraction tasks. But for an agent that decides 'should this be escalated to a human?' every test feels subjective. How are you gating these?",
    author: "rohit",
    avatarHue: 38,
    tags: ["evals", "agents", "testing"],
    createdAt: "5h ago",
    upvotes: 41,
    aiAnswer: {
      text: "**Triage.** Split the metric from the judgment. For escalation-style agents, the trick is to grade **recall on a labeled set of must-escalate cases**, not overall 'quality'.\n\n- Build a fixed set of ~30 cases you *know* should escalate. Measure: how many did the agent catch? That's deterministic.\n- Treat false-negatives (missed escalations) as the only failure that gates a release; false-positives are a tuning dial, not a gate.\n- Use an LLM judge only for tone/phrasing, pinned at temperature 0, and never let it move the release gate.",
      model: "swarm-triage (offline)",
      tookMs: 2110,
    },
    replies: [
      {
        id: "r1",
        author: "kevin_w",
        avatarHue: 280,
        body: "+1 on recall-on-must-escalate. We label ~50 golden cases and block deploy if recall drops below 0.95. Everything else is a dashboard, not a gate.",
        createdAt: "3h ago",
      },
    ],
  },
  {
    id: "show-local-agent-stack",
    kind: "show",
    title: "Show & tell: my fully-local agent stack runs on Ollama with zero API cost",
    body: "Built a research agent that runs qwen3:14b locally + DuckDuckGo search. No keys, no per-token cost, runs offline on an M-series Mac. Sharing the architecture — feedback welcome.",
    author: "rohit",
    avatarHue: 38,
    tags: ["ollama", "local-llm", "show"],
    createdAt: "1d ago",
    upvotes: 67,
    aiAnswer: {
      text: "**Nice.** Two things the room usually asks about local stacks like this:\n\n- **Concurrency**: a single Ollama instance serializes requests — if your agent fans out sub-tasks, you'll bottleneck. Worth measuring before claiming parallel speedup.\n- **Determinism for evals**: pin `temperature: 0` and a fixed seed if you want reproducible runs to gate on.\n\nWhat's the cold-start latency on the 14B at first token?",
      model: "swarm-triage (offline)",
      tookMs: 1670,
    },
    replies: [
      {
        id: "r1",
        author: "sana",
        avatarHue: 150,
        body: "Love this. How are you handling tool-call parsing — native function calling or regex on the output?",
        createdAt: "20h ago",
      },
    ],
  },
  {
    id: "subagent-not-triggering",
    kind: "question",
    title: "Claude Code subagent never gets selected for the task I built it for",
    body: "Wrote a custom subagent for DB migrations. When I ask Claude to do a migration it just does it inline instead of dispatching to my agent. Description seems fine?",
    author: "tomas",
    avatarHue: 12,
    tags: ["claude-code", "subagents"],
    createdAt: "8h ago",
    upvotes: 9,
    aiAnswer: {
      text: "**Triage.** Selection is driven almost entirely by the agent's **description**, not its name. If Claude is doing the work inline, the description didn't match the request strongly enough.\n\n- Rewrite the description to lead with concrete trigger phrases: *'Use when running database migrations, altering schemas, writing migration files…'*\n- Add 2–3 example scenarios — those measurably improve routing.\n- Log the dispatch: if you never see a Task/Agent tool-use block, it's a selection miss, not a logic bug.",
      model: "swarm-triage (offline)",
      tookMs: 1490,
    },
    replies: [],
  },
  {
    id: "rate-limit-backoff",
    kind: "question",
    title: "Best pattern for handling provider rate limits in a multi-agent loop?",
    body: "Running ~8 agents in parallel, hitting 429s from the API. Naive retry makes it worse. What backoff pattern actually works at this fan-out?",
    author: "priya",
    avatarHue: 320,
    tags: ["agents", "rate-limits", "reliability"],
    createdAt: "11h ago",
    upvotes: 23,
    aiAnswer: {
      text: "**Triage.** Don't retry per-call in isolation — that's why naive retry worsens it (thundering herd). Centralize.\n\n- Put a single **concurrency limiter** (e.g. cap at min(cores, 8)) in front of all agents so excess calls queue instead of firing.\n- On a 429, read the `retry-after` header and back off the *whole pool*, not just the failed call.\n- Add jitter to the backoff so retries don't resync.",
      model: "swarm-triage (offline)",
      tookMs: 1920,
    },
    replies: [
      {
        id: "r1",
        author: "lee",
        avatarHue: 95,
        body: "Token-bucket in front of the pool fixed this for us. Per-call retry was the trap.",
        createdAt: "9h ago",
        isAccepted: true,
      },
    ],
  },
];

export function getThreads(): Thread[] {
  return THREADS;
}

export function getThread(id: string): Thread | undefined {
  return THREADS.find((t) => t.id === id);
}
