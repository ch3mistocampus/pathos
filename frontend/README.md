# Pathos Frontend

Next.js 16 dashboard for the Pathos continuous tournament. Reads from the Modal backend (3 GET endpoints) and pushes user-submitted variants through Convex (which in turn calls Modal's `POST /classify`).

See [`HANDOFF.md`](./HANDOFF.md) for the full file map, what's done, and the punch list.
See [`AGENTS.md`](./AGENTS.md) if you're an AI agent about to write code here — Next.js 16 has breaking changes versus older training data.

## Running

```bash
npm install
npm run dev        # http://localhost:3000   (or 3001 if 3000 is in use)
```

Mocks ship with the app; no backend is required for any frontend dev work. The `MOCK_MODE` flag in `lib/api.ts` swaps the entire data layer between mocks and the live Modal API.

## Going live

In `.env.local`:

```
NEXT_PUBLIC_PATHOS_API_URL=https://ch3mistocampus--pathos-fastapi-app.modal.run
NEXT_PUBLIC_CONVEX_URL=<value of CONVEX_URL from the repo-root .env.local>
```

In `lib/api.ts:21`, change `MOCK_MODE = true` → `false`. Restart the dev server.

For user submissions (`/try`, `/login`), see the "Convex integration TODO" section in `HANDOFF.md` — Convex is provisioned but the client isn't yet imported here.

## Pages

| Path | Purpose |
|---|---|
| `/` | Hero + live tournament snapshot |
| `/leaderboard` | Sortable table + EMA chart + recent rounds |
| `/round/[id]` | Five reasoning traces side-by-side for one round |
| `/strategies` | Tagline / philosophy / procedure per strategy |
| `/try` | Submit your own variant (UI scaffolded; Convex wiring pending) |
| `/login` | Auth form (UI scaffolded; provider wiring pending) |

## Stack

- Next.js 16.2 (App Router, Turbopack)
- React 19
- Tailwind CSS v4 + `tw-animate-css`
- shadcn/ui (slate base, CSS variables)
- recharts (EMA chart) · lucide-react (icons) · @base-ui/react (primitives)

Backend contract lives in `lib/types.ts` — keep it in sync with `functions/orchestrator.py` and `functions/score_round.py` upstream.
