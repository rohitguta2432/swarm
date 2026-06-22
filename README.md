# Swarm 🐝

**The community for developers building AI agents.** Ask a problem and an AI answers
in seconds — then the swarm of builders refines it. Discuss, go live, share what you ship.

Live: **[swarm.rohitraj.tech](https://swarm.rohitraj.tech)** · built by [rohitraj.tech](https://rohitraj.tech)

---

## Why Swarm

A normal dev forum is dead until hundreds of strangers show up daily — a fatal problem
for a solo founder. Swarm fixes the empty room two ways:

1. **AI answers first.** The moment you post, an AI triage agent replies — so the room
   has value from your very first visit, even when no human is online.
2. **Niche, not horizontal.** Only people building Claude Code skills, MCP servers,
   multi-agent systems, and local-LLM stacks. ~50 active builders feels busy; you don't
   need 5,000.

Then humans pile on top of the AI's first pass, and accepted answers mark a thread solved.

## What's in the MVP

- **Feed** (`/`) — questions, discussions, and show-&-tell, filterable by tab. Seeded with
  real agent-builder threads so it launches non-empty.
- **Ask** (`/ask`) — post a problem, get a live AI answer (`POST /api/ai-answer`), then post it as a durable thread to the feed.
- **Thread** (`/t/[id]`) — AI answer first, then human replies, then a reply box.
- **Live** (`/live`) — real-time rooms (Supabase Realtime presence + broadcast) with a zero-secrets offline fallback.
- **Learn** (`/learn`) — agent-building knowledge (evals, guardrails, reliability…) with an "ask the knowledge base" helper.
- **Auth** — Google SSO via Auth.js v5 (JWT sessions). Signed-in users can post threads + replies.

## Sign-in (Google SSO) + durable replies

Auth is **Auth.js v5** with the Google provider (JWT session — no DB needed for auth).
Replies persist to **Supabase** when configured, else an ephemeral in-memory store.

**1. Google OAuth** — in Google Cloud Console → APIs & Services → Credentials → create an
OAuth 2.0 Client ID (Web application). Authorized redirect URIs:

```
http://localhost:3000/api/auth/callback/google
https://swarm.rohitraj.tech/api/auth/callback/google
```

Then set `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET` (`npx auth secret`).

**2. Supabase** — create a project, run the SQL in [`supabase/schema.sql`](supabase/schema.sql)
(the source of truth — it defines **both** `swarm_replies` and `swarm_threads`, each with RLS
on and no public policies), then set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-only).

Writes go through a server-only service-role client and are gated on a valid Auth.js
session, so the service-role key is never exposed and only signed-in users can post.

**3. Live rooms (optional)** — to make `/live` real-time, also set the **public**
`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.example`). Without
them, rooms still render and run in a local-only offline demo mode.

## The "AI answers first" engine

`src/lib/ai.ts` is a tiered backend (mirrors [Loopr](https://github.com/rohitguta2432/loopr)):
**Ollama → OpenAI → Anthropic**, with a deterministic offline triage fallback so the app
**always** returns an answer with zero secrets configured (and builds clean on Vercel).

Wire a real provider by setting one of:

| Provider  | Env |
|-----------|-----|
| Ollama    | `OLLAMA_URL` (default `http://127.0.0.1:11434`), `OLLAMA_MODEL` |
| OpenAI    | `OPENAI_API_KEY`, `OPENAI_MODEL` |
| Anthropic | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · deployed on Vercel.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Roadmap (post-MVP)

- [x] Google SSO (Auth.js v5).
- [x] Durable **replies** (Supabase) with in-memory fallback.
- [x] Durable **threads** (Supabase `swarm_threads`) with in-memory fallback.
- [x] Posting a question persists it to the feed for human answers.
- [x] Live rooms — real-time presence + chat (Supabase Realtime, ephemeral) for `/live`.
- [x] Knowledge layer (`/learn`) — evals / guardrails guides + an AI helper.
- [ ] Accepted-answer + reputation mechanics (let the asker accept a reply).
- [ ] Durable live-room history (persist messages) + send-side authz.
- [ ] README badge / embed so threads spread.
