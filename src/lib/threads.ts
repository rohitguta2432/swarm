// Durable threads. Uses Supabase (Postgres) when configured; otherwise falls back
// to an in-memory store so the app still builds, deploys, and demos with zero
// secrets (new threads just won't survive a server restart until Supabase is wired).
//
// The five seed threads in ./data are ALWAYS merged in, so the feed is never empty.
// Persisted threads (from /ask) surface on top.
//
// Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (server-only) to enable persistence,
// and create the `swarm_threads` table (SQL in supabase/schema.sql).

import { createClient } from "@supabase/supabase-js";
import type { AiAnswer, Thread, ThreadKind } from "./types";
import { THREADS, getThread as getSeedThread } from "./data";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Service-role client is server-only (this module is never imported by client code).
const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

export function persistenceMode(): "supabase" | "memory" {
  return supabase ? "supabase" : "memory";
}

export type NewThread = {
  kind: ThreadKind;
  title: string;
  body: string;
  author: string;
  authorImage: string | null;
  avatarHue: number;
  tags: string[];
  aiAnswer: AiAnswer | null;
};

// In-memory fallback. Keyed by id; also tracks insertion order via createdAtMs so we
// can serve newest-first without Postgres.
type MemThread = Thread & { createdAtMs: number };
const memStore = new Map<string, MemThread>();

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
  kind: string;
  title: string;
  body: string;
  author: string;
  author_image: string | null;
  avatar_hue: number | null;
  tags: string[] | null;
  upvotes: number | null;
  ai_answer: AiAnswer | null;
  created_at: string;
};

function toThread(row: Row): Thread {
  return {
    id: row.id,
    kind: (row.kind as ThreadKind) ?? "question",
    title: row.title,
    body: row.body,
    author: row.author,
    avatarHue: row.avatar_hue ?? 40,
    tags: row.tags ?? [],
    createdAt: relativeTime(row.created_at),
    upvotes: row.upvotes ?? 0,
    aiAnswer: (row.ai_answer as AiAnswer | null) ?? null,
    // Replies live in swarm_replies and are merged on the thread PAGE, not here.
    replies: [],
  };
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "thread"
  );
}

// Returns persisted threads (Supabase or memory), newest-first.
async function getPersisted(): Promise<Thread[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("swarm_threads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as Row[]).map(toThread);
  }
  return [...memStore.values()].sort((a, b) => b.createdAtMs - a.createdAtMs).map((m) => {
    // Strip the internal createdAtMs field.
    const { createdAtMs: _omit, ...thread } = m;
    void _omit;
    return thread;
  });
}

// Full feed: persisted threads (newest-first) on top, seed threads always after.
export async function getAllThreads(): Promise<Thread[]> {
  const persisted = await getPersisted();
  return [...persisted, ...THREADS];
}

export async function getThreadById(id: string): Promise<Thread | undefined> {
  if (supabase) {
    const { data, error } = await supabase
      .from("swarm_threads")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!error && data) return toThread(data as Row);
  } else {
    const mem = memStore.get(id);
    if (mem) {
      const { createdAtMs: _omit, ...thread } = mem;
      void _omit;
      return thread;
    }
  }
  // Fall back to seed so existing seed-thread URLs keep working.
  return getSeedThread(id);
}

// Collision-safe id from the title: slug + short base36 suffix, re-rolled if it
// would clash with a seed id or a previously-persisted memory id.
function makeId(title: string): string {
  const base = slugify(title);
  const seedIds = new Set(THREADS.map((t) => t.id));
  for (let i = 0; i < 5; i++) {
    const suffix = (Date.now().toString(36) + Math.random().toString(36).slice(2, 6)).slice(-6);
    const id = `${base}-${suffix}`;
    if (!seedIds.has(id) && !memStore.has(id)) return id;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function addThread(t: NewThread): Promise<string> {
  const id = makeId(t.title);
  if (supabase) {
    await supabase.from("swarm_threads").insert({
      id,
      kind: t.kind,
      title: t.title,
      body: t.body,
      author: t.author,
      author_image: t.authorImage,
      avatar_hue: t.avatarHue,
      tags: t.tags,
      upvotes: 0,
      ai_answer: t.aiAnswer,
    });
    return id;
  }
  const now = Date.now();
  memStore.set(id, {
    id,
    kind: t.kind,
    title: t.title,
    body: t.body,
    author: t.author,
    avatarHue: t.avatarHue,
    tags: t.tags,
    createdAt: relativeTime(new Date(now).toISOString()),
    upvotes: 0,
    aiAnswer: t.aiAnswer,
    replies: [],
    createdAtMs: now,
  });
  return id;
}
