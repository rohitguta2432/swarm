# Free hosted LLM tier (OpenAI-compatible)

**Date:** 2026-06-23
**Status:** Approved (brainstorm) → implementing

## Goal

Give production (swarm.rohitraj.tech) real LLM answers for free. Today the live
site falls to the deterministic offline scaffold because the only configured
free backend (Ollama) is localhost-only and unreachable from Vercel.

## Decision (from brainstorm)

- **Production only** — local dev keeps using Ollama (already wired).
- **Generic, env-driven OpenAI-compatible tier** — one code path that works with
  Gemini, Groq, or OpenRouter (all expose `/chat/completions`), switchable by
  env var, no code change to swap providers.
- **First key: Google Gemini** free tier (most daily + token headroom; ~1,500
  req/day, no credit card). Not unlimited, but generous for community scale; the
  fallback chain degrades to the offline scaffold if a cap is hit (never a 500).

## Implementation

### `src/lib/ai.ts` — new tier
Add `tryOpenAICompatible(prompt)`:
- Reads `LLM_BASE_URL` + `LLM_API_KEY` + `LLM_MODEL`. If any is missing → return
  `null` (tier skipped), exactly like `tryOpenAI`.
- `POST ${LLM_BASE_URL}/chat/completions` (trailing slash on base stripped) with
  `Authorization: Bearer <key>`, body `{ model, messages:[{role:"user",content:prompt}], max_tokens: 700 }`,
  20s timeout.
- Parse `choices[0].message.content`; on any error → `null` (falls through).

### Fallback order (both `generateAnswer` and `summarizeArticle`)
`Ollama → tryOpenAICompatible (new) → OpenAI → Anthropic → offline`.
- Ollama stays first so local dev prefers the local model; in prod the Ollama
  probe fails instantly (connection refused), so the new tier is effectively
  primary.
- Returned `model` label = `LLM_MODEL`.

### `.env.example`
Document a new "Free hosted LLM (OpenAI-compatible)" block: the three
**server-only** vars (no `NEXT_PUBLIC_` — the key must never reach the browser),
with copy-paste base URL + model examples for Gemini / Groq / OpenRouter and the
key-signup URLs.

## Config values (Gemini)

- `LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai`
- `LLM_MODEL=gemini-2.0-flash` (confirm current free model in AI Studio at wire-time)
- `LLM_API_KEY=<free key from https://aistudio.google.com/apikey>`

Set in Vercel Production (and Preview/Development) via CLI, then redeploy.

## Error handling

Unchanged contract: every tier swallows errors → `null` → next tier → offline
scaffold. A bad key, rate-limit, or provider outage degrades gracefully to the
canned triage answer; the route never 500s and the build never needs secrets.

## Verification

- `npx tsc --noEmit` + `npm run build` (no behavior change without the env vars).
- Live: set the 3 vars in Vercel Production, redeploy, then `POST /api/ai-answer`
  on prod and confirm the response `model` is the LLM model (not
  `swarm-triage (offline)`) and the text is a real, non-scaffold answer.

## Out of scope (YAGNI)

Streaming, the Vercel AI SDK / AI Gateway rewrite, per-route model selection,
OpenRouter ranking headers, retry/backoff (the fallback chain is the safety net).
