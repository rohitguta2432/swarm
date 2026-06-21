# Swarm Redesign — Bold Editorial Light

**Status:** Approved (via visual mockup, 2026-06-21)
**Reference mockup:** `.superpowers/brainstorm/23013-1782061279/content/bold-light-home.html`

## Goal

Restyle the Swarm UI from the current "safe light" system into a **Bold Editorial Light**
direction — confident, distinctive, unmistakably *designed* — while keeping all existing
functionality, data, routes, copy, and color *meaning* intact. This is a visual restyle, not
a feature change.

## Design principles

The editorial character comes from a few high-impact moves, applied consistently everywhere:

1. **Display typeface on headings only** — Space Grotesk (700) for `h1`/`h2`/`h3` and the logo
   wordmark. Body text stays on the existing Geist Sans (no new body font).
2. **Amber highlight blocks** — solid `--color-accent` swatches behind hero keywords, using
   `box-decoration-break: clone` so multi-word phrases wrap cleanly.
3. **Hard structure** — `2px solid var(--color-ink)` borders and **offset shadows**
   (`4px 4px 0 ink`) instead of soft blur. Cards lift and the shadow turns amber on hover.
4. **Segmented, bordered controls** — the feed tabs become a single hard-bordered group with a
   solid-black active segment.

## Tokens — `src/app/globals.css`

Keep the existing `@theme` palette (canvas, surface, ink scale, the amber fill/ink split, the
kind-pill color pairs, success/info/violet/lime). Add/adjust:

- `--color-canvas: #fbfbf6` (slightly warmer off-white; was `#fbfbfa`).
- Hard-shadow tokens:
  - `--shadow-hard: 4px 4px 0 var(--color-ink)`
  - `--shadow-hard-sm: 3px 3px 0 var(--color-ink)`
  - `--shadow-hard-amber: 6px 6px 0 var(--color-accent)`
- `--font-display` exposed for Space Grotesk (wired in `layout.tsx`).
- Standardize card/control borders to `2px solid var(--color-ink)`.
- Replace the gutter-masked dot grid with a **full-canvas** dot grid at low opacity
  (`rgba(17,17,17,0.05)`, 22px) — reads intentional in this louder style.
- Keep the blue `:focus-visible` ring and the `prefers-reduced-motion` block as-is.

## Typography

- Load Space Grotesk (500/600/700) via `next/font/google` in `layout.tsx`; expose as
  `--font-display`. Keep Geist Sans/Mono for body/code.
- Hero `h1`: `clamp(30px, 6vw, 54px)`, weight 700, letter-spacing `-0.038em`, display font.
- Card titles (`h3`): 16px / 700.

## Components to change

| File | Change |
|------|--------|
| `src/app/globals.css` | tokens, display font var, full-canvas dot grid, hard-shadow utilities |
| `src/app/layout.tsx` | wire Space Grotesk alongside Geist |
| `src/components/Nav.tsx` | 2px bottom border; bordered amber logo square; Feed/Live amber underline-on-active; black "Ask the swarm" button (2px border); bordered avatar |
| `src/components/NavLinks.tsx` | active link = amber underline |
| `src/components/MobileMenu.tsx`, `MobileAskBar.tsx` | mobile parity with nav border/active + amber CTA |
| `src/app/page.tsx` | hero: display font + amber highlight blocks on "ask / go live / ship"; CTA buttons (amber w/ offset shadow + outline); hard-bordered segmented tabs (black active) |
| `src/components/ThreadCard.tsx` | white card, 2px ink border, `--shadow-hard`, hover lift + amber shadow; kind pills become bordered uppercase tags; keep vote gutter, Solved/AI badges, author, tags |
| `src/app/ask/page.tsx` | inputs get 2px ink borders + offset-shadow focus; submit button matches amber CTA |
| `src/app/live/page.tsx` | room list/cards adopt the hard-bordered card style |
| `src/app/t/[id]/page.tsx`, `Composer.tsx` | thread detail + reply composer adopt borders/shadows |
| `src/components/AiAnswer.tsx` | keep amber-subtle tint + amber left rail; add 2px border to match |
| `src/components/Avatar.tsx`, `Logo.tsx` | 1.5–2px ink borders to fit the style |
| `src/components/Icon.tsx`, `Markish.tsx` | unchanged (reused) |

## Scope

- **In scope:** visual restyle of all pages and shared components; new display font; token +
  shadow additions.
- **Out of scope:** no changes to `src/lib/*` (data, types, ai, replies), auth, routes, the AI
  answer pipeline, Supabase, or any copy. **No dark mode** (the chosen direction is light). No
  new features.

## Accessibility

- Hero highlight blocks use dark ink on amber (`#111` on `#f59e0b` ≈ 8:1) — passes.
- Keep the blue `:focus-visible` ring (distinct from amber fills).
- Hover lift uses `transform`, already gated by the existing `prefers-reduced-motion` rule.

## Verification

After implementation, run the dev server and confirm in the browser: hero highlight blocks,
hard-bordered tabs, card hover (lift + amber shadow), nav active underline, and the ask/live/
thread pages match — plus a mobile width check. No TypeScript/lint regressions.
