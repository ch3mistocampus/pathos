# Pathos Frontend — Handoff

This directory contains the Pathos web frontend. It runs end-to-end against
mock data today; flipping a single flag in `lib/api.ts` and setting one env var
moves it to the Modal backend.

## Project context

Pathos is a continuous benchmark tournament where five Claude agents with
distinct ACMG/AMP variant-interpretation strategies compete to classify real
ClinVar variants. The backend is Modal + Anthropic (in active development by
other agents — do not modify it from here); this frontend is the demo face.

Full backend build plan lives at `../` (the parent repo). See the root
`README.md` and the user's design doc.

## Stack

- **Next.js 16.2** (App Router, no `src/`, Turbopack on)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** + `tw-animate-css`
- **shadcn/ui** primitives — `button`, `card`, `table`, `badge`, `tabs`,
  `separator`, `scroll-area`, `chart` already installed (CSS variables preset,
  slate base)
- **recharts** for the EMA chart
- **lucide-react** for icons

> **Read `AGENTS.md` before writing Next.js code.** This is Next 16 — read the
> guide in `node_modules/next/dist/docs/` rather than relying on older App
> Router conventions. In particular: `error.tsx` accepts an `unstable_retry`
> prop in v16.2 alongside the legacy `reset`; we use `reset` for now.

## Current file map

```
frontend/
├── app/
│   ├── layout.tsx                 — root layout, fonts, ThemeProvider, SiteNav
│   ├── globals.css                — Tailwind + shadcn CSS vars + .dark overrides
│   ├── page.tsx                   — renders <HeroSection />
│   ├── opengraph-image.tsx        — edge-rendered OG image (also reused for Twitter)
│   ├── twitter-image.tsx          — re-exports opengraph-image
│   ├── loading.tsx                — root suspense fallback (subtle inline)
│   ├── error.tsx                  — root error boundary (Client Component, reset)
│   ├── not-found.tsx              — root 404 (catches unmatched URLs app-wide)
│   ├── leaderboard/page.tsx       — async server page: getLeaderboard + getRecentRounds
│   ├── strategies/page.tsx        — async server page: STRATEGY_DEFINITIONS + history
│   └── round/[id]/
│       ├── page.tsx               — async server page: getRound(id)
│       ├── loading.tsx            — round-specific skeleton (header + evidence + 5 trace cards)
│       └── not-found.tsx          — round 404 with link back to /leaderboard
├── components/
│   ├── ui/                        — shadcn primitives (do not edit by hand)
│   ├── site-nav.tsx               — Client Component; active-link styling via usePathname
│   ├── hero-section.tsx           — tagline + pitch + CTAs + 3 pillars + 4-step "how a round
│   │                                works" + inline architecture SVG diagram
│   ├── leaderboard-dashboard.tsx  — Client shell that owns sort + chart-isolation state
│   ├── leaderboard-table.tsx      — sortable header buttons, leader ring, mobile card stack,
│   │                                agent name = toggle for EMA chart isolation
│   ├── ema-chart.tsx              — recharts via shadcn chart container, tabs for
│   │                                Last 10 / Last 50 / All rounds, focused-agent isolation
│   ├── trace-card.tsx             — one agent's verdict + criteria chips + scrollable reasoning
│   │                                + score breakdown + self-reported confidence
│   ├── strategy-card.tsx          — tagline + philosophy + procedure steps + per-agent
│   │                                confusion matrix from history
│   ├── confusion-matrix.tsx       — 5x5 heat grid; primary tint on diagonal, destructive off
│   ├── animated-number.tsx        — rAF tween for numeric values (respects reduced-motion)
│   ├── auto-refresh.tsx           — Client Component that calls router.refresh() every 30s
│   ├── theme-provider.tsx         — light/dark context + pre-hydration IIFE script
│   └── theme-toggle.tsx           — sun/moon button in the nav
└── lib/
    ├── types.ts                   — TS types matching backend Modal Dict + scores.json shapes
    ├── mock-data.ts               — synthesized leaderboard + 60-round histories + STRATEGY_DEFINITIONS
    ├── api.ts                     — MOCK_MODE flag; getLeaderboard / getRecentRounds / getRound
    └── utils.ts                   — shadcn `cn()` helper
```

## What is actually done

### Landing `/`
- Tagline badge (`Claude Code Hackathon · May 2026`), decisive H1.
- 3-sentence pitch tying ClinVar rotations to five prompting strategies + 90 s cadence.
- Two CTAs: `View the leaderboard` → `/leaderboard`, `See the five strategies` → `/strategies`.
- Three pillar cards: `Continuous benchmark`, `Strategy comparison`, `Reasoning is first-class`.
- Four-step "How a round works" band (`01–04`).
- Inline SVG architecture diagram: ClinVar → Orchestrator → Five Claude strategies → Scorer → UI.

### Leaderboard `/leaderboard`
- Async server page fetches `getLeaderboard()` + `getRecentRounds(10)` in parallel.
- Renders `<LeaderboardDashboard>` (Client) which lifts sort + agent-isolation state.
- `LeaderboardTable`: sortable headers (Agent / EMA / Rounds) with ascending/descending
  glyphs, leader row ring-highlighted regardless of sort column, agent name is a button
  that isolates that agent in the EMA chart and dims the other rows.
- `LeaderboardTable` also has a mobile card-stack rendering for narrow viewports
  with a chip-row sort selector.
- `EmaChart` (recharts via shadcn chart container): legend, hover tooltips, EMA smoothing
  applied per-round (`alpha = 0.1`), tabs for `Last 10 / Last 50 / All rounds`, line
  bolds when an agent is focused.
- `<AutoRefresh>` hits `router.refresh()` every 30 s.
- "Recent rounds" grid (sm:2 / lg:3 columns) of clickable round summaries linking to
  `/round/[id]`.

### Round inspector `/round/[id]`
- Async server page fetches `getRound(id)`; calls `notFound()` if missing.
- Header: round ID (mono), variant ID, gene/consequence/difficulty/truth badges.
- Evidence pack `Card`: HGVS + chromosome coords, then 3-column gnomAD / In-silico / Functional
  panel with mono numerics.
- Side-by-side reasoning grid: `xl:grid-cols-5` (md:2, stacks on mobile) of `<TraceCard>`s.
- `TraceCard`: verdict badge (`default` / `destructive` based on truth match), `truth` badge,
  match-vs-delta ribbon, applied criteria chips, scrollable reasoning prose (`ScrollArea`,
  ~180 px), score breakdown box (composite/accuracy/criterion_match), self-reported confidence.
- `<AutoRefresh>` mirrors the leaderboard's 30 s tick.

### Strategies `/strategies`
- Async server page reads `STRATEGY_DEFINITIONS` (in `lib/mock-data.ts`) and per-agent history
  from `getLeaderboard()`.
- Renders 5 `<StrategyCard>` in a `md:grid-cols-2` grid.
- `StrategyCard`: agent slug (mono) → label → tagline (`CardDescription`) → philosophy paragraph
  → `Procedure` enumerated list (mirrored from `functions/agents/prompts.py`) → per-agent
  `ConfusionMatrix` (5x5 heat grid from `entry.history`).
- Footnote references the shared `ACMG_REFERENCE` block in the Python prompts.

### Cross-cutting
- `SiteNav` is a Client Component with active-link styling via `usePathname`. Active links
  use `text-foreground`, inactive use `text-foreground/60 hover:text-foreground`,
  `aria-current="page"` set on the active link.
- Light/dark theme is fully wired: `ThemeProvider` + `THEME_INIT_SCRIPT` IIFE in the
  `<head>` prevents FOUC; toggle lives in `SiteNav` (`ThemeToggle`). Persisted to
  `localStorage` (`pathos-theme`).
- `AnimatedNumber` tweens leaderboard EMA + rounds counts on refresh.
- `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`, `app/round/[id]/loading.tsx`,
  `app/round/[id]/not-found.tsx` provide route-level streaming + error + 404 UX.
- `opengraph-image.tsx` ships a 1200x630 PNG; `twitter-image.tsx` re-exports it for the
  `summary_large_image` card.

## Real remaining punch list

The "must-haves" from earlier sessions have largely landed. What's left:

- [ ] **Aria + screen-reader announces for sort + isolation modes** — pass on the
  leaderboard table for keyboard-only and SR users (sort buttons exist; double-check
  `aria-sort` + the polite live region copy).
- [ ] **Failure UX in the data layer** — toast or inline alert when `fetchJson` 5xx's or
  the response shape drifts; consider a Zod parser at the `lib/api.ts` boundary to fail
  loudly and fall back to last-known-good cache in product mode.
- [ ] **Contract tests** — runtime validation between backend payloads and `lib/types.ts`
  (sibling to the Zod parsers above). Pin to backend orchestrator + score_round outputs.
- [ ] **Strategies procedure block parity** — Codex is pulling content from
  `functions/agents/prompts.py` into `STRATEGY_DEFINITIONS.procedure`. Keep an eye on
  drift when prompts change.
- [ ] **Hero polish** — optional: curated screenshot/still beside the architecture
  diagram for visceral realism.
- [ ] **Live-update animation** — `AnimatedNumber` exists; the leaderboard could also
  flash the row whose EMA changed on refresh (subtle background pulse).
- [ ] **Round inspector deep-link to ACMG criterion glossary** — clicking a criterion
  chip could pop a tooltip with the ACMG/AMP rule definition.
- [ ] **Keyboard shortcut for chart isolation reset** — `Esc` to clear `focusedAgent`.
- [ ] **Empty states** — zero rounds yet (cold start) should not render an empty
  chart frame; render a "no rounds yet" placeholder.

The earlier "Nice-to-have polish" list mostly landed: confusion matrix per strategy,
mobile leaderboard, theme toggle with persistence, animated counters, OG/Twitter card,
auto-refresh. The architecture diagram is rendered in `HeroSection` via an inline SVG.

## Integration with the Modal backend

- `lib/types.ts` is the contract. The shapes mirror the backend Modal Dict
  (`functions/orchestrator.py`), `scores.json` (`functions/score_round.py`), and agent
  `run_agent` output (`functions/agents/base.py`). **Do not change shapes without
  coordinating with the backend agent.**
- To flip from mock to live:
  1. Set `NEXT_PUBLIC_PATHOS_API_URL` in `.env.local` (template is `.env.local.example`).
  2. Change `MOCK_MODE = true` to `MOCK_MODE = false` in `lib/api.ts`.
  3. The fetchers (`getLeaderboard`, `getRecentRounds`, `getRound`) will hit
     `/leaderboard`, `/rounds?limit=N`, and `/rounds/:id` respectively on that base URL.
- The backend exposes a Round-shaped JSON object via the orchestrator
  (work in progress on the Modal side). Endpoint URL TBD — coordinate with the
  backend agent before flipping `MOCK_MODE`.

## New scaffold pieces (this pass)

- `app/loading.tsx` — root suspense fallback. Small pulsing dot + `loading` label.
- `app/error.tsx` — root error boundary (Client Component, `"use client"`). Owns the
  failure copy ("Something went wrong.") and exposes a `Try again` button calling
  the `reset` prop. (`unstable_retry` is also available in Next 16.2; we use `reset`
  for now to match the existing button.)
- `app/not-found.tsx` — root 404. Two CTAs: home + leaderboard.
- `app/round/[id]/loading.tsx` — skeletonized version of the round inspector layout
  (header strip + evidence card + 5 trace card placeholders).
- `app/round/[id]/not-found.tsx` — round-specific 404 with link back to `/leaderboard`.
- `.env.local.example` — documents `NEXT_PUBLIC_PATHOS_API_URL`.
- `components/site-nav.tsx` — converted to a Client Component to apply active-link
  styling via `usePathname()` from `next/navigation`.

## Running it

```bash
cd frontend
npm run dev
# http://localhost:3000
```

That's it — no backend needed for any frontend dev work right now.

## Demo flow (target)

1. Open `/` — hero hooks the audience in 10 seconds.
2. Click "leaderboard" → `/leaderboard` shows EMA chart with visible strategy separation, table sorted by EMA.
3. Click a recent round → `/round/[id]` reveals 5 reasoning traces side-by-side. Read one out loud — Claude's thinking is visible.
4. Optionally `/strategies` to explain the prompt strategies.

## Constraints to honor

- Hackathon timeline. Don't over-engineer — clean and demo-friendly beats clever.
- Match the existing aesthetic in the user's other projects (Flat6 Search, Hormone Research): minimal, technical, slightly editorial.
- Don't change `lib/types.ts` shapes without updating the backend in lockstep.
- Don't add emojis unless the user explicitly asks.
- Read `AGENTS.md` before writing Next.js code — Next 16 has breaking changes from older App Router conventions.

## Open questions to confirm with the user

1. Brand color — currently using shadcn `slate` defaults. Want a custom accent (e.g. a deep purple or a clinical green)?
2. Streamlit dashboard (originally planned in `../dashboard/`) — keep it as a backup or remove now that we have this Next.js frontend?
3. Demo audience — is the demo to genomics specialists or generalist judges? Affects how much ACMG jargon to leave un-explained.
