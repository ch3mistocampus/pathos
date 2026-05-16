# Pathos

**Continuous benchmark tournament for AI agents that classify human genetic variants per ACMG/AMP guidelines.**

Five Claude agents with distinct interpretive strategies — strict-rule, functional-first, in-silico-first, population-first, conservative — compete on real ClinVar BRCA1/BRCA2 variants. A new round fires every 90 seconds, a deterministic scorer grades the predictions against expert consensus, and an EMA leaderboard tracks each strategy's accuracy over time. Users can also submit their own variant via the `/try` page and watch the same five agents classify it live.

**Status:** built at the Claude Code Hackathon, May 2026. Backend is deployed and the scheduler is running. Frontend wires to live data via one env flag (currently still on mocks for design iteration).

## Live URLs

| | |
|---|---|
| **API (Modal)** | <https://ch3mistocampus--pathos-fastapi-app.modal.run> |
| **Modal dashboard** | <https://modal.com/apps/ch3mistocampus/main/deployed/pathos> |
| **Convex dashboard** | <https://dashboard.convex.dev/d/marvelous-swan-945> |
| **GitHub** | <https://github.com/ch3mistocampus/pathos> |

### API endpoints

| Method | Path | Returns |
|---|---|---|
| GET | `/leaderboard` | `LeaderboardEntry[]` (5 agents, sorted by EMA desc) |
| GET | `/rounds?limit=N` | `RoundSummary[]` (newest first; limit clamped to 1–100) |
| GET | `/rounds/{round_id}` | full `Round` (404 if missing, 400 if id malformed) |
| POST | `/classify` | `{submission_id, predictions}` for user-submitted variants (~30–90 s) |

Type contracts live in `frontend/lib/types.ts`.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Continuous tournament                         │
│                                                                      │
│   modal scheduler.tick   (every 90 s, modal.Period)                  │
│         │                                                            │
│         ▼                                                            │
│   pick random fixture from /fixtures  (25 BRCA1/2 variants)          │
│         │                                                            │
│         ▼                                                            │
│   run_round  ── fan-out 5 agents in parallel via run_agent.starmap ─▶│
│         │      (each agent: prompt-cached + dual retry)              │
│         ▼                                                            │
│   score_round  →  EMA update on leaderboard Dict                     │
│                →  round.json / predictions.json / scores.json on     │
│                   the Modal Volume                                   │
└──────────────────────────────────────────────────────────────────────┘
                            ▲
                            │   GET /leaderboard, /rounds, /rounds/{id}
                            │   (via Modal asgi_app, CORS-permissive)
                            │
┌───────────────────────────┴──────────────────────────────────────────┐
│                         Next.js 16 frontend                          │
│                                                                      │
│   /              hero + live tournament snapshot                     │
│   /leaderboard   sortable table + EMA chart + recent rounds          │
│   /round/[id]    5 reasoning traces side-by-side                     │
│   /strategies    each strategy's tagline / philosophy / procedure    │
│   /try           user-submitted variant — Convex → Modal /classify   │
│   /login         (auth scaffold; not yet wired)                      │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            │   useMutation(api.submissions.submitVariant)
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       Convex (user submissions)                      │
│                                                                      │
│   submissions table   (status: pending/classifying/done/error)       │
│           │                                                          │
│           ▼                                                          │
│   runClassification action  →  POST /classify on the Modal asgi_app  │
│           │                                                          │
│           ▼                                                          │
│   writes predictions back into the row; query auto-updates the UI    │
└──────────────────────────────────────────────────────────────────────┘
```

## The five strategies

| Slug | Tagline |
|---|---|
| `strict_rule` | Walk every ACMG criterion mechanically. Default to VUS on ambiguity. |
| `functional_first` | PS3/BS3 near-decisive. Population only overrides via BA1. |
| `insilico_first` | Upgrade PP3/BP4 to moderate when AlphaMissense + REVEL + CADD converge. |
| `population_first` | gnomAD popmax first. BA1 ends analysis. PM2 in disease genes carries strong weight. |
| `conservative` | Require multiple PS-level lines for Pathogenic. Default to VUS unless unambiguous. |

Full prompts live at `functions/agents/prompts.py`. Each is a multi-paragraph system prompt with the same ACMG/AMP reference block (cached) plus a strategy-specific procedure.

## File map

```
pathos/
├── README.md                       — this file
├── modal_app.py                    — Modal app: image, volume, dict, secret, agent registry
├── pyproject.toml                  — Python deps
├── package.json                    — Node deps (convex client at repo root)
├── .env.local                      — Convex deployment URL + name (gitignored)
│
├── functions/                      — Modal Python backend
│   ├── agents/
│   │   ├── base.py                 — run_agent (cache_control + exp-backoff + JSON retry)
│   │   └── prompts.py              — the 5 strategy prompts
│   ├── orchestrator.py             — run_round (scored, leaderboard-updating)
│   │                                 + classify_only (user submissions, unscored)
│   ├── score_round.py              — deterministic 5-class accuracy + criterion match
│   ├── scheduler.py                — modal.Period(90s) tick → run_round on random fixture
│   └── api.py                      — single asgi_app with 4 routes (GET ×3, POST /classify)
│
├── convex/                         — Convex backend (user submissions)
│   ├── schema.ts                   — submissions table (user_id, variant, status, predictions)
│   ├── submissions.ts              — mutations / queries / action → Modal /classify
│   └── _generated/                 — auto-generated by `npx convex dev`
│
├── data/fixtures/                  — 25 BRCA1/BRCA2 variant JSONs (real ClinVar entries)
│
├── scripts/
│   ├── manual_round.py             — `modal run` one fixture × one agent for debug
│   └── validate_fixtures.py        — stdlib-only schema-checker for all fixtures
│
└── frontend/                       — Next.js 16 dashboard
    ├── app/                        — App Router pages
    ├── components/                 — UI components
    ├── lib/                        — types, mock-data, api helpers, runtime parsers
    └── HANDOFF.md                  — frontend reference doc
```

## Local development

### Backend (Modal)

```bash
# one-time
pipx install modal
modal token new                                          # browser auth
modal secret create anthropic ANTHROPIC_API_KEY=sk-ant-...

# regular workflow
modal run modal_app.py::app.tick                         # one-shot test round (no schedule)
modal deploy modal_app.py                                # deploy + start 90s scheduler
modal app stop pathos                                    # kill switch

# inspect state
modal dict items pathos_leaderboard
modal volume ls pathos_data /rounds
```

### Convex

```bash
# one-time
npx convex login                                         # browser auth
npx convex dev --configure new --project pathos          # only if recreating the project

# regular workflow
npx convex dev --once                                    # push schema/functions to dev deployment

# local invocation
npx convex run submissions:submitVariant '{"variant": {...}}'
npx convex dashboard                                     # open web UI
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000  (or 3001 if 3000 is in use)
```

To flip the frontend off mocks onto live backend data:

1. In `frontend/.env.local`:
   ```
   NEXT_PUBLIC_PATHOS_API_URL=https://ch3mistocampus--pathos-fastapi-app.modal.run
   NEXT_PUBLIC_CONVEX_URL=<value of CONVEX_URL from the repo-root .env.local>
   ```
2. In `frontend/lib/api.ts:21` change `MOCK_MODE = true` to `false`.
3. (For user submissions) install `convex` in `frontend/`, wrap `app/layout.tsx` in `<ConvexProvider>`, and replace the `/try` page's stub with `useMutation(api.submissions.submitVariant)`. Details in `frontend/HANDOFF.md`.

## Stack

| Layer | Technology |
|---|---|
| Agents | Anthropic Claude (`claude-sonnet-4-6` default; override via `PATHOS_MODEL_OVERRIDE` Modal secret env var) |
| Orchestration | Modal — serverless functions, scheduling, persistent Volume, key-value Dict, FastAPI asgi_app |
| User submissions | Convex — reactive DB + serverless functions + scheduler; action calls Modal `POST /classify` |
| Frontend | Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, shadcn/ui, recharts, lucide-react |
| Testing | `scripts/validate_fixtures.py` (fixture schema) |

## Status & operational notes

- 25 fixtures loaded, all pass `scripts/validate_fixtures.py --strict`.
- Modal scheduler runs every 90 seconds. Each tick is ~$0.02–0.05 on sonnet with prompt caching active.
- Prompt cache is `ephemeral` (5-minute window); first call per agent seeds it, subsequent rounds within the window hit cache.
- Atomic `round.json` writes via `os.replace` so OOM-killed workers can't leave half-written artifacts.
- HTTP retry covers Anthropic 429/500/502/503/504/529 + `APIConnectionError` (3 attempts, exp backoff with jitter). One-shot JSON-parse retry sends a corrective follow-up turn on bad JSON.
- Convex schema is auth-ready (`user_id` field); `runClassification` falls back to `"anonymous"` until Convex Auth is wired in the frontend.
- Frontend currently in `MOCK_MODE = true`. Modal endpoints are smoke-tested live; flipping `MOCK_MODE` should Just Work for the read paths (`/leaderboard`, `/rounds`, `/rounds/{id}`).

## Hackathon context

Built for the Claude Code Hackathon, May 2026. The demo's "money shot" is `/round/[id]` — five reasoning traces side-by-side on the same variant — so most of the engineering polish (sortable leaderboard, EMA isolation, divergent fixtures, prompt caching) exists to make that moment land.
