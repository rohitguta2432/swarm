// Sitemap for Swarm — MetadataRoute.Sitemap (Next 16).
// Docs read:
//   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md
// Notes from that doc:
//   - Return shape (§Returns, lines 396-417): Array<{ url; lastModified?; changeFrequency?; priority? }>.
//   - v16.0.0 changed the `generateSitemaps` `id` prop to a Promise<string> (lines 421-424). We have
//     well under 50k URLs, so we use a SINGLE sitemap.ts and do NOT use generateSitemaps — this avoids
//     the Promise-id change entirely.
//   - sitemap.ts is a Route Handler; we make it async and await the seed/persisted data accessors.
//     With zero env the data layer returns the guaranteed seed set; persisted (Supabase) entries are
//     best-effort and merge in automatically when secrets are wired.
//
// Excluded by design: /api/* (ai-answer, learn-answer, auth/[...nextauth]) — disallowed in robots.ts.
// /news has no per-link detail route, so SEED_LINKS (external URLs) are NOT emitted as page URLs.

import type { MetadataRoute } from "next";
import { getAllThreads } from "@/lib/threads";
import { TOPICS } from "@/lib/knowledge";
import { ROOMS } from "@/app/live/page";

const BASE = "https://swarm.rohitraj.tech";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/ask`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/live`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/learn`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/news`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];

  // Threads — seed set is guaranteed zero-env; persisted threads merge in when Supabase is wired.
  const threads = await getAllThreads();
  const threadRoutes: MetadataRoute.Sitemap = threads.map((t) => ({
    url: `${BASE}/t/${t.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const learnRoutes: MetadataRoute.Sitemap = TOPICS.map((t) => ({
    url: `${BASE}/learn/${t.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const liveRoutes: MetadataRoute.Sitemap = ROOMS.map((r) => ({
    url: `${BASE}/live/${r.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...threadRoutes, ...learnRoutes, ...liveRoutes];
}
