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
- **Ask** (`/ask`) — post a problem and get a live AI answer (`POST /api/ai-answer`).
- **Thread** (`/t/[id]`) — AI answer first, then human replies, then a reply box.
- **Live** (`/live`) — scheduled live rooms / office hours / pair-build sessions.

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

- [ ] Durable threads + replies (Supabase / Postgres) — currently in-memory seed.
- [ ] Auth + real profiles.
- [ ] Posting a question persists it to the feed for human answers.
- [ ] WebRTC / live-room backend for `/live`.
- [ ] Accepted-answer + reputation mechanics.
- [ ] README badge / embed so threads spread.
