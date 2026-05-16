# Convex — Pathos user submissions

Convex powers the **user-submitted variant** flow. The continuous tournament (90 s scheduler, leaderboard) lives entirely in Modal; this layer is just for "someone pastes a variant on `/try` and watches the five agents classify it." No effect on the public leaderboard.

## Project info

- **Team:** chemistoncampus
- **Project:** pathos
- **Dashboard:** <https://dashboard.convex.dev/d/marvelous-swan-945>
- Deployment URL + name are stored in the repo-root `.env.local` (gitignored).

## Schema (`schema.ts`)

One table: `submissions`.

| Field | Type | Notes |
|---|---|---|
| `user_id` | string | `"anonymous"` until Convex Auth is wired |
| `variant` | any | full `VariantChallenge` payload (same shape the Modal scheduler sends to agents) |
| `status` | `"pending" \| "classifying" \| "done" \| "error"` | progresses linearly |
| `predictions` | optional any | filled in by the action; per-agent `AgentPrediction` dicts |
| `error` | optional string | set when status === `"error"` |
| `created_at` | number | `Date.now()` |
| `completed_at` | optional number | set when `done`/`error` |

Indexes: `by_user` (for `getMySubmissions`), `by_status` (for backoffice/admin views).

## Functions (`submissions.ts`)

### Public

| Function | Kind | Purpose |
|---|---|---|
| `submitVariant({ variant })` | mutation | Insert a row in status `pending`, schedule the action, return submission id. |
| `getMySubmissions()` | query | Current user's submissions, newest first. |
| `getSubmission({ id })` | query | Single row; scoped to the submitter once auth is real. |

### Internal (action-only)

| Function | Kind |
|---|---|
| `_get`, `_setStatus`, `_complete`, `_fail` | internal query / mutations used by the action |
| `runClassification({ submissionId })` | action — `fetch`es `POST /classify` on the Modal `asgi_app`, then writes predictions back |

## Modal contract

The Convex action calls:

```
POST https://ch3mistocampus--pathos-fastapi-app.modal.run/classify
Content-Type: application/json

{ "variant": { ... full VariantChallenge ... } }
```

Modal responds (after ~30–90 s):

```json
{
  "submission_id": "sub_1778960681054",
  "predictions": {
    "strict_rule":       { "classification": "LP", "applied_criteria": [...], "reasoning": "...", "confidence": 0.78, "_model": "...", "_usage": {...} },
    "functional_first":  { ... },
    "insilico_first":    { ... },
    "population_first":  { ... },
    "conservative":      { ... }
  }
}
```

The `submission_id` Modal returns is its own internal id (it persists the round under `/data/submissions/{submission_id}/` on the Modal Volume); the Convex row has a separate `Id<"submissions">`. The action only needs the `predictions` blob.

## Local workflow

```bash
# from repo root
npx convex dev --once                          # push schema/functions to dev deployment
npx convex dashboard                           # open web UI for the deployment
npx convex logs                                # tail logs
```

Run a function locally:

```bash
npx convex run submissions:submitVariant '{
  "variant": {
    "variant_id": "BRCA1_NM_007294.4_c.181T>G",
    "hgvs_c": "NM_007294.4:c.181T>G",
    ...
  }
}'
```

The returned id is the Convex document id; poll with:

```bash
npx convex run submissions:getSubmission '{ "id": "..." }'
```

…and watch `status` move `pending → classifying → done`.

## Frontend wiring (TODO)

The frontend has `/try` and `/login` page stubs but Convex is **not yet imported on the frontend side**. To wire it:

1. `cd frontend && npm install convex`
2. Add to `frontend/.env.local`:
   ```
   NEXT_PUBLIC_CONVEX_URL=<value from repo-root .env.local CONVEX_URL>
   ```
3. Wrap `app/layout.tsx` body in `<ConvexProvider client={convex}>`.
4. In the `/try` page's submit handler, replace the stub with:
   ```ts
   const submit = useMutation(api.submissions.submitVariant);
   const submissionId = await submit({ variant });
   const submission = useQuery(api.submissions.getSubmission, { id: submissionId });
   // submission.status will auto-update; render predictions when status === "done"
   ```

When ready to add real auth, install `@convex-dev/auth` and configure a provider (password or OAuth). The Convex backend already reads `ctx.auth.getUserIdentity()` so it just starts honoring identities the moment the frontend signs users in.

## Future

- Wire Convex Auth (password or GitHub OAuth) for `/login`.
- Add a `getMyRecentSubmissions(limit)` query for a "my history" page.
- Webhook from Modal back into Convex for streaming partial results (currently the action blocks until all 5 agents finish).
