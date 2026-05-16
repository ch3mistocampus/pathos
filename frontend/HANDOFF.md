# Pathos Frontend — Handoff

This directory contains the Pathos web frontend. It runs end-to-end against mock data today; flipping one flag in `lib/api.ts` and setting two env vars moves it to the Modal + Convex backends.

## Project context

Pathos is a continuous benchmark tournament where five Claude agents with distinct ACMG/AMP variant-interpretation strategies compete on real ClinVar BRCA1/2 variants. The backend (Modal + Anthropic) is deployed and the 90 s scheduler is running. A second backend (Convex) handles user-submitted variants from `/try`. This frontend is the demo face for both.

Top-level project doc + architecture diagram lives at the repo root `README.md`.

## Stack

- **Next.js 16.2** (App Router, no `src/`, Turbopack on)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** + `tw-animate-css`
- **shadcn/ui** primitives (button, card, table, badge, tabs, separator, scroll-area, chart — slate base, CSS variables preset)
- **recharts** for the EMA chart
- **lucide-react** for icons
- **@base-ui/react** for headless primitives

> **Read `AGENTS.md` before writing Next.js code.** This is Next 16 — read the guide in `node_modules/next/dist/docs/` rather than relying on older App Router conventions. `error.tsx` accepts an `unstable_retry` prop in v16.2 alongside the legacy `reset`; we use `reset` for now.

## Current file map

```
frontend/
├── app/
│   ├── layout.tsx                — root layout, fonts, ThemeProvider, SiteNav
│   ├── globals.css               — Tailwind + shadcn CSS vars + .dark overrides
│   ├── page.tsx                  — landing: hero + tournament arena pedestal + live leaderboard
│   ├── opengraph-image.tsx       — edge-rendered OG image (1200×630, reused for Twitter)
│   ├── twitter-image.tsx         — re-exports opengraph-image
│   ├── _shared-og.tsx            — OG image helpers
│   ├── loading.tsx               — root suspense fallback
│   ├── error.tsx                 — root error boundary (Client Component, reset prop)
│   ├── not-found.tsx             — root 404
│   ├── leaderboard/page.tsx      — async server page: getLeaderboard + getRecentRounds
│   ├── strategies/page.tsx       — async server page: STRATEGY_DEFINITIONS + history
│   ├── round/[id]/
│   │   ├── page.tsx              — async server page: getRound(id) → 5 trace cards
│   │   ├── loading.tsx           — round-specific skeleton
│   │   └── not-found.tsx         — round 404 with link back to /leaderboard
│   ├── try/page.tsx              — renders <PromptLab /> (Convex wiring TODO)
│   └── login/page.tsx            — renders <LoginForm /> (auth provider TODO)
│
├── components/
│   ├── ui/                       — shadcn primitives (do not edit by hand)
│   ├── arena/                    — pedestal + sparkline / bar-spark / live-dot icons used by /
│   ├── auth/                     — auth-provider, login-form (UI only — not yet wired)
│   ├── prompt-lab/               — /try page's variant submission UI (Convex hook TODO)
│   ├── site-nav.tsx              — Client Component; active-link via usePathname
│   ├── live-countdown.tsx        — 90 s scheduler countdown banner
│   ├── auto-refresh.tsx          — router.refresh() every 30 s
│   ├── leaderboard-dashboard.tsx — Client shell owning sort + chart-isolation state
│   ├── leaderboard-table.tsx     — sortable headers, leader ring, mobile card stack
│   ├── ema-chart.tsx             — recharts/shadcn chart; tabs for Last 10 / 50 / All
│   ├── trace-card.tsx            — verdict badge + criteria chips + reasoning + score
│   ├── strategy-card.tsx         — tagline + philosophy + procedure + confusion matrix
│   ├── confusion-matrix.tsx      — 5×5 heat grid; primary on diagonal, destructive off
│   ├── animated-number.tsx       — rAF tween (honors reduced-motion)
│   ├── theme-provider.tsx        — light/dark context + pre-hydration IIFE
│   └── theme-toggle.tsx          — sun/moon button in SiteNav
│
└── lib/
    ├── types.ts                  — TS contract: LeaderboardEntry, Round, RoundSummary, etc.
    ├── mock-data.ts              — synthesized leaderboard + ~60-round histories + STRATEGY_DEFINITIONS
    ├── api.ts                    — MOCK_MODE flag; getLeaderboard / getRecentRounds / getRound
    ├── parsers.ts                — runtime validators (parsers between api responses and types)
    └── utils.ts                  — shadcn `cn()` helper
```

## What is actually done

### Landing `/`
- Custom hero composition (no separate `hero-section.tsx` — inline in `page.tsx`):
  - Headline + 3-sentence pitch + two CTAs (`/leaderboard`, `/strategies`).
  - **ArenaPedestal** centerpiece with five orbiting agent cards (verdict + sparkline + confidence) layered around it; live consensus card at the bottom.
  - Live leaderboard panel in the right column.
  - "Evidence at a glance" panel summarizing population / in-silico / functional / splice signals from the current variant.
- TrustStrip with the evidence stack names (ClinVar, gnomAD v4, MaveDB, AlphaMissense + REVEL + CADD, SpliceAI).
- "Standard section" with 4 feature cards.
- `ReasoningPanel` showing leader's applied criteria + reasoning trace inline.
- `ReportPreview` dark-section closing with leader EMA / rounds / strategies count tiles.

### Leaderboard `/leaderboard`
- Async server page; parallel `getLeaderboard()` + `getRecentRounds(10)`.
- `LeaderboardDashboard` (Client) lifts sort + agent-isolation state.
- `LeaderboardTable`: sortable headers, leader ring-highlighted, agent name toggles EMA chart isolation. Mobile card stack on narrow viewports.
- `EmaChart`: recharts via shadcn chart container; legend, tooltips, EMA smoothing (α = 0.1), tabs for Last 10 / 50 / All rounds, focused-agent line bold.
- `<AutoRefresh>` hits `router.refresh()` every 30 s.
- Recent rounds grid linking to `/round/[id]`.

### Round inspector `/round/[id]`
- Async server page; `notFound()` if missing.
- Header: round id (mono), variant id, gene / consequence / difficulty / truth badges.
- Evidence pack card with HGVS + chromosome coords + gnomAD / in-silico / functional rows.
- Side-by-side reasoning grid (`xl:grid-cols-5`, `md:2`, stacks on mobile) of `<TraceCard>`s with verdict badges, criteria chips, scrollable reasoning, score breakdown, self-reported confidence.
- `<AutoRefresh>` 30 s tick.

### Strategies `/strategies`
- 5× `<StrategyCard>` in a `md:grid-cols-2` grid.
- Each card: agent slug → label → tagline → philosophy → numbered procedure (mirrored from `functions/agents/prompts.py`) → per-agent `<ConfusionMatrix>` 5×5 heat grid from history.

### Try `/try` (UI stub — Convex wiring TODO)
- `<PromptLab />` UI: variant entry form + per-strategy preset toggles.
- Currently does **not** call Convex. Submit handler is a placeholder.

### Login `/login` (UI stub — auth wiring TODO)
- `<LoginForm />` UI for the beta-access path.
- Currently does **not** authenticate; just a styled form.

### Cross-cutting
- `SiteNav`: Client Component, active-link styling via `usePathname` + `aria-current="page"`.
- Theme: `ThemeProvider` + pre-hydration IIFE prevents FOUC; `ThemeToggle` in nav; persisted to `localStorage` as `pathos-theme`.
- `AnimatedNumber` tweens numeric values on refresh (respects `prefers-reduced-motion`).
- `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`, `app/round/[id]/loading.tsx`, `app/round/[id]/not-found.tsx` give every route streaming + error + 404 UX.
- `opengraph-image.tsx` ships a 1200×630 PNG; `twitter-image.tsx` re-exports it for `summary_large_image`.

## Convex integration — TODO

The Convex backend (in `../convex/`) is **provisioned and deployed** but the frontend client isn't imported yet. To wire it:

1. `npm install convex` (from `frontend/`).
2. Add `NEXT_PUBLIC_CONVEX_URL=<value from repo-root .env.local CONVEX_URL>` to `frontend/.env.local`.
3. In `app/layout.tsx`, wrap the body in `<ConvexProvider client={new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)}>`.
4. In `components/prompt-lab/prompt-lab.tsx`, replace the stub submit handler with:
   ```ts
   import { useMutation, useQuery } from "convex/react";
   import { api } from "@/convex/_generated/api"; // or via a path alias to ../convex/_generated

   const submit = useMutation(api.submissions.submitVariant);
   const submissionId = await submit({ variant });
   const submission = useQuery(api.submissions.getSubmission, { id: submissionId });
   // submission.status auto-updates; render predictions when status === "done"
   ```
5. When ready for real auth: install `@convex-dev/auth`, configure a provider (password or OAuth), and replace `LoginForm`'s stub with the provider's `useAuthActions`. The Convex backend already reads `ctx.auth.getUserIdentity()` so it just starts honoring identities.

Path alias note: the `convex/` directory is at the repo root (`../convex/` from here), not inside `frontend/`. Either add a `paths` entry in `frontend/tsconfig.json` (`"@/convex/*": ["../convex/*"]`) or import via a relative path.

## Going live on the read path

The 3 GET endpoints (`/leaderboard`, `/rounds`, `/rounds/{id}`) are already live and tested. To flip the frontend onto them:

1. Add to `frontend/.env.local`:
   ```
   NEXT_PUBLIC_PATHOS_API_URL=https://ch3mistocampus--pathos-fastapi-app.modal.run
   ```
2. In `lib/api.ts:21`, change `MOCK_MODE = true` → `false`.
3. Restart `npm run dev`.

The fetchers (`getLeaderboard`, `getRecentRounds`, `getRound`) will then hit `/leaderboard`, `/rounds?limit=N`, and `/rounds/{round_id}` on that base. The Round-shaped JSON is identical to the mock data (same field names + value forms — code form for `RoundSummary.truth_classification`, long form for `Round.truth.classification`).

## Real remaining punch list

- [ ] **Convex client wiring** (see above) — make `/try` actually submit.
- [ ] **Auth provider wiring** — Convex Auth or Clerk; replace `LoginForm` stub.
- [ ] **Aria + screen-reader announces** for sort + isolation modes on the leaderboard (sort buttons exist; verify `aria-sort` + a polite live region for sort/isolation changes).
- [ ] **Failure UX** in the data layer — toast/inline alert on parse/network failure; consider a Zod parser at `lib/api.ts` to fail loudly and fall back to last-known-good.
- [ ] **Contract tests** — runtime validation between backend payloads and `lib/types.ts` (sibling to the Zod parsers).
- [ ] **Strategies procedure parity** — `STRATEGY_DEFINITIONS.procedure` is mirrored from `functions/agents/prompts.py`. Watch for drift when prompts change.
- [ ] **Live-update animation** — leaderboard could flash the row whose EMA changed on refresh (subtle background pulse).
- [ ] **Criterion glossary tooltip** — `/round/[id]` criterion chips could pop the ACMG/AMP rule definition.
- [ ] **Keyboard shortcut** — `Esc` to clear `focusedAgent` on the leaderboard.
- [ ] **Empty states** — cold start (no rounds yet) should render a "no rounds yet" placeholder rather than an empty chart frame.

Mostly landed in earlier passes: confusion matrix per strategy, mobile leaderboard, theme toggle with persistence, animated counters, OG/Twitter card, auto-refresh, hero composition with arena pedestal.

## Constraints to honor

- Hackathon timeline. Clean and demo-friendly beats clever.
- Match the existing aesthetic (clinical, slightly editorial; mostly slate with subtle blue accents).
- Don't change `lib/types.ts` shapes without coordinating with the backend (`functions/orchestrator.py` + `functions/score_round.py`).
- No emojis unless the user explicitly asks.
- Read `AGENTS.md` before writing Next.js code.

## Demo flow (target)

1. Open `/` — arena pedestal with five orbiting agents hooks the audience in 5–10 seconds.
2. Click "View the leaderboard" → `/leaderboard` shows EMA chart with strategy separation, table sorted by EMA, recent rounds grid.
3. Click a recent round (ideally one with divergence) → `/round/[id]` reveals five reasoning traces side-by-side. Read one out loud — Claude's thinking is visible.
4. Optionally `/strategies` to explain the prompting philosophies.
5. Optionally `/try` to paste a variant and watch the agents classify it live (once Convex is wired).

## Open questions

- Brand color — currently a clinical slate/blue. Want a custom accent or theme drop?
- Auth provider — Convex Auth (password or OAuth) vs Clerk via Vercel Marketplace?
- Demo audience — genomics specialists or generalist judges? Affects how much ACMG jargon to leave un-explained.
