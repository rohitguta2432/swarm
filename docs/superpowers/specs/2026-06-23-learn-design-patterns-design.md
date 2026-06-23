# /learn — Agentic Design Patterns track

**Date:** 2026-06-23
**Status:** Approved (brainstorm) → implementing
**Source anchor:** Antonio Gulli, *Agentic Design Patterns: A Hands-On Guide to Building Intelligent Systems* (Springer, 2025) — 21 patterns.

## Goal

Turn the existing `/learn` section into a two-track learning surface:

- **Design patterns** (new) — how you *build* an agent (composition/architecture).
- **Operational practices** (existing 6 topics) — how you *run* it in production.

Mirror the book's full 21-pattern taxonomy. The book's chapter rhythm
(overview → when to use → hands-on example → key takeaways) maps 1:1 onto the
existing `KnowledgeTopic.sections[]` model, so no structural rework is needed —
this is mostly typed-data authoring plus three small code edits.

## Decisions (from brainstorm)

1. **Structure:** two tracks inside `/learn` (one destination, one nav link).
2. **Depth/voice:** mirror the book — simple plain-English overview on top, a
   small concrete example + takeaways below.
3. **Scope:** all 21 patterns represented. 15 new pattern pages + the 6 existing
   operational topics (reached via cross-links), = full parity with no
   duplicate pages and no URL churn.

## The 21 → pages mapping

**15 NEW pattern pages (`track: "patterns"`):**
Prompt Chaining, Routing, Parallelization, Reflection, Planning,
Multi-Agent Collaboration, Memory Management, Learning & Adaptation,
Model Context Protocol (MCP), Goal Setting & Monitoring,
Knowledge Retrieval (RAG), Inter-Agent Communication (A2A),
Reasoning Techniques, Prioritization, Exploration & Discovery.

**6 book patterns → existing topics (`track: "operational"`, cross-linked, not rebuilt):**

| Book pattern | Existing topic |
|---|---|
| Tool Use | `tool-design` |
| Guardrails / Safety + Human-in-the-Loop | `guardrails` |
| Evaluation & Monitoring | `evals` + `observability` |
| Resource Optimization | `cost-control` |
| Exception Handling | `reliability` |

15 new + 6 existing = all 21 patterns represented.

## Data-model change (`src/lib/types.ts`)

Add optional fields to `KnowledgeTopic` (backward-compatible — existing entries
need only a `track` added):

- `track?: "patterns" | "operational"` — which track the topic belongs to.
- `relatedTopicIds?: string[]` — structured cross-links to other topics,
  rendered as a "Related patterns" card block (mirrors `relatedThreadIds`).
- `group?: string` — optional book-section label (Core / State & Learning /
  Reliability / Advanced) for future sub-grouping; not rendered in v1.

## Code changes

1. **`src/components/Markish.tsx`** — add `[[slug]]` → `<Link href="/learn/slug">`
   inline rendering. Surgical addition to the `inline()` split regex. Also fixes
   the existing latent bug where `[[evals]]` etc. render as literal text.
2. **`src/app/learn/page.tsx`** — group `getKnowledge()` by `track` into two
   titled sections ("Design patterns" / "Operational practices"), each a card
   grid. Stays a Server Component. Add a one-line book credit on the Design track.
3. **`src/app/learn/[slug]/page.tsx`** — add a "Related patterns" card block
   sourced from `relatedTopicIds` (clone of the existing "Related threads" block).
4. **`src/lib/knowledge.ts`** — tag the existing 6 topics with
   `track: "operational"`; add the 15 new pattern topics with `track: "patterns"`,
   each following the book's 4-beat section rhythm and cross-linked via
   `relatedTopicIds` (to sibling patterns and to the operational counterpart).

## Content shape (each new pattern page)

Sections, in order:
1. **What it is** — plain-English overview (beginner-graspable).
2. **When to use it** — concrete applications / use cases.
3. **How it works** — a tiny Markish example (code fence-ish via `` `code` `` +
   bullets describing the flow).
4. **Watch out for** — failure modes + key takeaways.

Voice matches the existing topics (concrete, opinionated, Markish-only:
`**bold**`, `` `code` ``, `- bullets`, `[[wikilinks]]`).

## SEO / discovery

- `src/app/sitemap.ts` and `src/lib/tags.ts` already iterate `TOPICS` → new
  patterns auto-appear in the sitemap and auto-generate tag landing pages.
- `public/llms.txt` is hand-maintained → manually add the new pattern URLs.
- JSON-LD (`learnArticleLd` + breadcrumb) already applies generically per topic.

## Verification

No test runner exists in the repo (only `eslint`). Verification:
- `npx tsc --noEmit` — types guarantee the `KnowledgeTopic[]` shape and catch
  bad `relatedTopicIds`/`track` values.
- `npm run build` — full Next build of all new static routes.
- `npm run lint`.
- Render check of `/learn` (two tracks) and a few `/learn/<pattern>` pages,
  confirming cross-links resolve and Markish wikilinks render as links.
- Data-integrity sanity: unique topic ids; every `relatedTopicIds` /
  `relatedThreadIds` resolves to a real id.

## Out of scope (YAGNI)

- Icons per pattern (the `icon` field is not rendered on `/learn` today).
- 4-section sub-grouping UI (the `group` field is stored but not rendered in v1).
- Progress tracking / ordered lessons / prerequisites (a future curriculum step).
