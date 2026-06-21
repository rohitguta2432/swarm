// Durable replies. Uses Supabase (Postgres) when configured; otherwise falls back
// to an in-memory store so the app still builds, deploys, and demos with zero
// secrets (replies just won't survive a server restart until Supabase is wired).
//
// Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (server-only) to enable persistence,
// and create the `swarm_replies` table (SQL in README).

import { createClient } from "@supabase/supabase-js";
import type { Reply } from "./types";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Service-role client is server-only (this module is never imported by client code).
const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

export function persistenceMode(): "supabase" | "memory" {
  return supabase ? "supabase" : "memory";
}

export type NewReply = {
  author: string;
  authorImage: string | null;
  avatarHue: number;
  body: string;
};

type MemReply = NewReply & { id: string; createdAt: string };
const memStore = new Map<string, MemReply[]>();

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
  author: string;
  author_image: string | null;
  avatar_hue: number | null;
  body: string;
  created_at: string;
};

function toReply(r: { id: string; author: string; authorImage: string | null; avatarHue: number; body: string; createdAt: string }): Reply {
  return {
    id: r.id,
    author: r.author,
    avatarHue: r.avatarHue,
    body: r.body,
    createdAt: relativeTime(r.createdAt),
    image: r.authorImage,
  };
}

export async function getStoredReplies(threadId: string): Promise<Reply[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("swarm_replies")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return (data as Row[]).map((row) =>
      toReply({
        id: row.id,
        author: row.author,
        authorImage: row.author_image,
        avatarHue: row.avatar_hue ?? 40,
        body: row.body,
        createdAt: row.created_at,
      }),
    );
  }
  return (memStore.get(threadId) ?? []).map((m) => toReply(m));
}

export async function addReply(threadId: string, reply: NewReply): Promise<void> {
  if (supabase) {
    await supabase.from("swarm_replies").insert({
      thread_id: threadId,
      author: reply.author,
      author_image: reply.authorImage,
      avatar_hue: reply.avatarHue,
      body: reply.body,
    });
    return;
  }
  const list = memStore.get(threadId) ?? [];
  list.push({ ...reply, id: `mem_${threadId}_${list.length}_${Date.now()}`, createdAt: new Date().toISOString() });
  memStore.set(threadId, list);
}
