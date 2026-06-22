// robots.txt for Swarm — MetadataRoute.Robots (Next 16).
// Docs read:
//   node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md
// Notes:
//   - Robots object shape (§Robots object, lines 122-142): rules (object | array), sitemap?, host?.
//   - Per-bot rules supported via an array of { userAgent, allow, disallow } (lines 62-104).
//
// Intent: Swarm is a PUBLIC community we WANT cited by AI answer engines, so GPTBot / ClaudeBot /
// PerplexityBot / etc. are explicitly allowed (GEO). Only the API surface is disallowed —
// disallow: '/api/' covers /api/ai-answer, /api/learn-answer, and /api/auth/[...nextauth].
// There is no top-level /auth/ route (auth-actions.ts is a server-action module, not a route).

import type { MetadataRoute } from "next";

const BASE = "https://swarm.rohitraj.tech";

// AI answer-engine crawlers we explicitly welcome (public community → we want to be a cited source).
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      // Same content allowance for AI crawlers, kept explicit so the intent is unambiguous.
      { userAgent: AI_CRAWLERS, allow: "/", disallow: "/api/" },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
