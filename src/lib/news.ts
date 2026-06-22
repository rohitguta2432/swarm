// Durable news links. Uses Supabase (Postgres) when configured; otherwise falls
// back to an in-memory store so the app still builds, deploys, and demos with
// zero secrets (submitted links just won't survive a server restart until
// Supabase is wired). Mirrors src/lib/threads.ts exactly.
//
// The SEED links below are ALWAYS merged in, so /news is never empty. Persisted
// links (submitted from /news) surface on top, newest-first.
//
// Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (server-only) to enable persistence,
// and create the `swarm_links` table (SQL in supabase/schema.sql).

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Service-role client is server-only (this module is never imported by client code).
const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

export function persistenceMode(): "supabase" | "memory" {
  return supabase ? "supabase" : "memory";
}

export type NewsLink = {
  id: string;
  url: string;
  title: string;
  summary: string;
  sourceDomain: string;
  author: string;
  authorImage: string | null;
  avatarHue: number;
  tags: string[];
  upvotes: number;
  createdAt: string; // pre-rendered relative label, e.g. "3h ago"
};

// Caller supplies the curated fields; the module assigns id/upvotes/createdAt.
export type NewNewsLink = Omit<NewsLink, "id" | "upvotes" | "createdAt">;

// In-memory fallback. Keyed by id; also tracks insertion order via createdAtMs so we
// can serve newest-first without Postgres.
type MemLink = NewsLink & { createdAtMs: number };
const memStore = new Map<string, MemLink>();

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type Row = {
  id: string;
  url: string;
  title: string;
  summary: string | null;
  source_domain: string | null;
  author: string;
  author_image: string | null;
  avatar_hue: number | null;
  tags: string[] | null;
  upvotes: number | null;
  created_at: string;
};

function toLink(row: Row): NewsLink {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    summary: row.summary ?? "",
    sourceDomain: row.source_domain ?? "",
    author: row.author,
    authorImage: row.author_image ?? null,
    avatarHue: row.avatar_hue ?? 40,
    tags: row.tags ?? [],
    upvotes: row.upvotes ?? 0,
    createdAt: relativeTime(row.created_at),
  };
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "link"
  );
}

// Deterministic hue from a seed string (stable per-source/author color).
function hueFrom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

// Seed feed: real, well-known agent-building reads so /news launches non-empty
// even with zero env. Stable ids, real URLs, curated 1–2 sentence summaries.
export const SEED_LINKS: NewsLink[] = [
  {
    id: "seed-anthropic-building-effective-agents",
    url: "https://www.anthropic.com/engineering/building-effective-agents",
    title: "Building effective agents",
    summary:
      "Anthropic's field guide to agent patterns: start with the simplest composable building blocks (prompt chaining, routing, parallelization) and only reach for an autonomous agent loop when the task genuinely needs it. The recurring lesson — add complexity only when it measurably improves outcomes.",
    sourceDomain: "anthropic.com",
    author: "Anthropic Engineering",
    authorImage: null,
    avatarHue: hueFrom("anthropic.com"),
    tags: ["agents", "patterns", "anthropic"],
    upvotes: 42,
    createdAt: "3d ago",
  },
  {
    id: "seed-anthropic-claude-agent-sdk",
    url: "https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk",
    title: "Building agents with the Claude Agent SDK",
    summary:
      "How Anthropic frames the agent loop — gather context, take action, verify work — and the harness primitives (tools, subagents, file access, permissions) the Claude Agent SDK ships to make that loop reliable in production.",
    sourceDomain: "anthropic.com",
    author: "Anthropic Engineering",
    authorImage: null,
    avatarHue: hueFrom("anthropic.com"),
    tags: ["claude-code", "agents", "sdk"],
    upvotes: 31,
    createdAt: "4d ago",
  },
  {
    id: "seed-mcp-introduction",
    url: "https://modelcontextprotocol.io/introduction",
    title: "Model Context Protocol — Introduction",
    summary:
      "The canonical intro to MCP: an open protocol that standardizes how applications expose context, tools, and prompts to LLMs. Think of it as a USB-C port for AI — one client/server contract instead of a bespoke integration per tool.",
    sourceDomain: "modelcontextprotocol.io",
    author: "MCP",
    authorImage: null,
    avatarHue: hueFrom("modelcontextprotocol.io"),
    tags: ["mcp", "protocol", "tools"],
    upvotes: 27,
    createdAt: "5d ago",
  },
  {
    id: "seed-openai-practices-governing-agentic",
    url: "https://openai.com/index/practices-for-governing-agentic-ai-systems/",
    title: "Practices for governing agentic AI systems",
    summary:
      "OpenAI's set of practices for keeping increasingly autonomous agents safe and accountable — evaluating task suitability, constraining the action space, requiring human oversight for high-impact actions, and maintaining auditability of what an agent did and why.",
    sourceDomain: "openai.com",
    author: "OpenAI",
    authorImage: null,
    avatarHue: hueFrom("openai.com"),
    tags: ["agents", "safety", "governance"],
    upvotes: 18,
    createdAt: "6d ago",
  },
  {
    id: "seed-simonwillison-agents-definition",
    url: "https://simonwillison.net/2025/Sep/18/agents/",
    title: "I think \"agent\" may finally have a widely-enough agreed definition",
    summary:
      "Simon Willison lands on a crisp, practical definition: an LLM agent runs tools in a loop to achieve a goal. A clear-eyed look at why the term stayed muddy for so long and why this framing is the one worth using when you build.",
    sourceDomain: "simonwillison.net",
    author: "Simon Willison",
    authorImage: null,
    avatarHue: hueFrom("simonwillison.net"),
    tags: ["agents", "definition", "llm"],
    upvotes: 23,
    createdAt: "1w ago",
  },
];

// Returns persisted links (Supabase or memory), newest-first.
async function getPersisted(): Promise<NewsLink[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("swarm_links")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as Row[]).map(toLink);
  }
  return [...memStore.values()]
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .map((m) => {
      // Strip the internal createdAtMs field.
      const { createdAtMs: _omit, ...link } = m;
      void _omit;
      return link;
    });
}

// Full feed: persisted links (newest-first) on top, seed links always after.
export async function getAllLinks(): Promise<NewsLink[]> {
  const persisted = await getPersisted();
  return [...persisted, ...SEED_LINKS];
}

export async function getLinkById(id: string): Promise<NewsLink | undefined> {
  if (supabase) {
    const { data, error } = await supabase
      .from("swarm_links")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!error && data) return toLink(data as Row);
  } else {
    const mem = memStore.get(id);
    if (mem) {
      const { createdAtMs: _omit, ...link } = mem;
      void _omit;
      return link;
    }
  }
  // Fall back to seed so seed-link ids keep resolving.
  return SEED_LINKS.find((l) => l.id === id);
}

// Collision-safe id from the title: slug + short base36 suffix, re-rolled if it
// would clash with a seed id or a previously-persisted memory id.
function makeId(title: string): string {
  const base = slugify(title);
  const seedIds = new Set(SEED_LINKS.map((l) => l.id));
  for (let i = 0; i < 5; i++) {
    const suffix = (Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).slice(-6);
    const id = `${base}-${suffix}`;
    if (!seedIds.has(id) && !memStore.has(id)) return id;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function addLink(l: NewNewsLink): Promise<string> {
  const id = makeId(l.title);
  if (supabase) {
    await supabase.from("swarm_links").insert({
      id,
      url: l.url,
      title: l.title,
      summary: l.summary,
      source_domain: l.sourceDomain,
      author: l.author,
      author_image: l.authorImage,
      avatar_hue: l.avatarHue,
      tags: l.tags,
      upvotes: 0,
    });
    return id;
  }
  const now = Date.now();
  memStore.set(id, {
    id,
    url: l.url,
    title: l.title,
    summary: l.summary,
    sourceDomain: l.sourceDomain,
    author: l.author,
    authorImage: l.authorImage,
    avatarHue: l.avatarHue,
    tags: l.tags,
    upvotes: 0,
    createdAt: relativeTime(new Date(now).toISOString()),
    createdAtMs: now,
  });
  return id;
}
