// Tag helpers for programmatic-SEO landing pages. Aggregates the tags already
// stored on threads (getAllThreads), news links (getAllLinks), and learn topics
// (TOPICS) — no new seed data, no env, no network. Server-safe: it only re-uses
// the existing async/sync data accessors.
//
// Tag storage convention: tags are authored lowercase-kebab (e.g. "claude-code",
// "local-llm"), which is already URL-safe. We therefore treat the slug and the
// stored value as the same string; normalizeTag() lowercases/trims defensively so
// a stray-cased persisted tag still matches its landing page.

import type { Thread } from "./types";
import { getAllThreads } from "./threads";
import { getAllLinks, type NewsLink } from "./news";
import { TOPICS } from "./knowledge";

// Lowercase + trim. Tags are already kebab in the seed data; this guards against
// any future / persisted tag that arrives with stray casing or whitespace so it
// still resolves to the same landing page.
export function normalizeTag(t: string): string {
  return t.trim().toLowerCase();
}

export type TagCount = {
  tag: string; // normalized slug (also the display value, rendered with a leading #)
  count: number; // number of distinct items (threads + links + topics) using it
};

// Deduped, sorted list of every tag across threads, news links, and learn topics,
// with a per-tag item count. Sorted by count desc, then alphabetically — so the
// hub leads with the densest, most-linkable tags.
export async function getAllTags(): Promise<TagCount[]> {
  const [threads, links] = await Promise.all([getAllThreads(), getAllLinks()]);

  const counts = new Map<string, number>();
  const bump = (raw: string) => {
    const tag = normalizeTag(raw);
    if (!tag) return;
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  };

  for (const t of threads) for (const tag of t.tags) bump(tag);
  for (const l of links) for (const tag of l.tags) bump(tag);
  for (const topic of TOPICS) for (const tag of topic.tags) bump(tag);

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

// Threads carrying the given tag (normalized match), in feed order.
export async function getThreadsByTag(tag: string): Promise<Thread[]> {
  const want = normalizeTag(tag);
  const threads = await getAllThreads();
  return threads.filter((t) => t.tags.some((x) => normalizeTag(x) === want));
}

// News links carrying the given tag (normalized match), in feed order.
export async function getLinksByTag(tag: string): Promise<NewsLink[]> {
  const want = normalizeTag(tag);
  const links = await getAllLinks();
  return links.filter((l) => l.tags.some((x) => normalizeTag(x) === want));
}

// Learn topics carrying the given tag (normalized match).
export function getTopicsByTag(tag: string): typeof TOPICS {
  const want = normalizeTag(tag);
  return TOPICS.filter((t) => t.tags.some((x) => normalizeTag(x) === want));
}
