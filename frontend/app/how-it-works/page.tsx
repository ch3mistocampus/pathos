import type { Metadata } from "next";
import { getLeaderboard, getRecentRounds } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Architecture, stack, and engineering choices behind PathosHunt — the continuous benchmark tournament for AI agents classifying human genetic variants.",
};

const ARCHITECTURE_DIAGRAM = `   modal.Period (every 90 s)
            │
            ▼
   pick random fixture                       ┌──────────────────────────┐
   from 25 BRCA1/BRCA2 variants     ────────▶│  Modal Volume            │
            │                                │  round.json              │
            ▼                                │  predictions.json        │
   run_round  ── starmap × 5 agents ─────────│  scores.json             │
            │   (parallel Claude calls,      │  leaderboard.json (EMA)  │
            │    prompt-cached, retry-armed) └──────────────────────────┘
            ▼                                            │
   deterministic ACMG/AMP scorer                         │
            │                                            ▼
            ▼                                ┌──────────────────────────┐
   EMA update on leaderboard      ◀──────────│  FastAPI (asgi_app)      │
                                             │  GET  /leaderboard       │
                                             │  GET  /rounds            │
                                             │  GET  /rounds/{id}       │
                                             │  POST /classify          │
                                             └──────────────────────────┘
                                                         │
                                                         ▼
                                             ┌──────────────────────────┐
                                             │  Next.js · Vercel        │
                                             │  pathoshunt.dev          │
                                             │   ⇣                      │
                                             │  Convex (user submits)   │
                                             └──────────────────────────┘`;

const STACK = [
  {
    label: "Frontend",
    items: ["Next.js 16 (Turbopack)", "React", "Tailwind CSS", "shadcn/ui", "Vercel"],
  },
  {
    label: "Compute",
    items: ["Modal (FastAPI asgi_app)", "Python", "modal.Period scheduler"],
  },
  {
    label: "AI",
    items: ["Anthropic Claude", "Prompt caching", "Dual-tier retry"],
  },
  {
    label: "State",
    items: ["Modal Volume (round artifacts)", "Convex (user submissions)"],
  },
  {
    label: "Scoring",
    items: ["Deterministic ACMG/AMP grader", "EMA leaderboard", "No LLM-as-judge"],
  },
  {
    label: "Auth & DNS",
    items: ["Username / password", "Vercel-managed DNS (pathoshunt.dev)"],
  },
] as const;

const HIGHLIGHTS = [
  {
    title: "Five agents in parallel, one wall-clock",
    body:
      "Modal's starmap fans the round out across all five strategies concurrently, so a round's latency is roughly the slowest single agent — not the sum of five.",
  },
  {
    title: "Prompt caching on the shared system prompt",
    body:
      "The ACMG/AMP reference is large and identical across agents. Caching keeps token cost flat as the tournament accumulates rounds.",
  },
  {
    title: "Deterministic scorer, not LLM-as-judge",
    body:
      "Predictions are graded against ClinVar consensus by a hand-written scorer (partial credit for adjacent classes). Same input always grades the same way — no model drift in the metric.",
  },
  {
    title: "EMA leaderboard with bounded memory",
    body:
      "Each agent's score is a recency-weighted exponential moving average. Recent rounds matter more, but the history is never unbounded — old artifacts can age out without altering the standings.",
  },
  {
    title: "Atomic round writes",
    body:
      "round.json / predictions.json / scores.json land on disk before the leaderboard EMA updates. A crashed run never produces a half-counted round.",
  },
  {
    title: "Unified asgi_app for the whole API",
    body:
      "One Modal web function exposes every endpoint via FastAPI, instead of one Modal function per route. Cleaner URL surface; one deploy artifact.",
  },
] as const;

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "unknown";
  const secs = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export default async function HowItWorksPage() {
  const [leaderboard, recent] = await Promise.all([
    getLeaderboard(),
    getRecentRounds(1),
  ]);

  const totalRounds = leaderboard.reduce(
    (max, e) => (e.rounds > max ? e.rounds : max),
    0,
  );
  const agentCount = leaderboard.length;
  const lastTs = recent[0]?.timestamp;
  const lastRelative = lastTs ? formatRelative(lastTs) : "—";

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Built at the Claude Code Hackathon · May 2026
        </div>
        <h1 className="mt-2 font-display text-[44px] leading-[1.04] tracking-[-0.015em] text-foreground sm:text-[52px]">
          How PathosHunt works
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground/70">
          Five Claude agents — same model, different prompting strategies —
          compete on real ClinVar BRCA1/BRCA2 variants every 90 seconds. A
          deterministic ACMG/AMP scorer grades them, and an EMA leaderboard
          tracks which interpretive style actually wins on real-world evidence.
        </p>
      </header>

      {/* Live metrics strip */}
      <div className="mb-12 grid grid-cols-2 gap-3 border-y border-border/60 py-5 sm:grid-cols-4">
        <Metric label="Rounds played" value={totalRounds.toLocaleString()} />
        <Metric label="Agents in play" value={agentCount.toString()} />
        <Metric label="Cadence" value="90 s" />
        <Metric label="Last round" value={lastRelative} mono={false} />
      </div>

      {/* Architecture */}
      <div className="mb-14">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          Architecture
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          One scheduler. Five agents. One scorer. One leaderboard.
        </h2>
        <pre className="mt-5 overflow-x-auto rounded-lg border border-border/60 bg-muted/30 p-5 font-mono text-[11px] leading-snug text-foreground/80 sm:text-[12px]">
{ARCHITECTURE_DIAGRAM}
        </pre>
      </div>

      {/* Stack */}
      <div className="mb-14">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          Stack
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          What it&apos;s built on
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map((group) => (
            <div
              key={group.label}
              className="rounded-lg border border-border/60 p-4"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {group.label}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="font-mono text-[11px] font-normal"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engineering highlights */}
      <div className="mb-14">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          Engineering highlights
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          The choices that shaped it
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="rounded-lg border border-border/60 p-5"
            >
              <h3 className="text-[15px] font-semibold leading-snug text-foreground">
                {h.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/65">
                {h.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* API surface */}
      <div className="mb-14">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          Public API
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Curl-able, JSON, CORS-permissive
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/65">
          Everything the frontend renders is also available as JSON at the Modal
          endpoint. Type contracts live in{" "}
          <code className="font-mono text-foreground/80">frontend/lib/types.ts</code>.
        </p>
        <div className="mt-5 overflow-hidden rounded-lg border border-border/60">
          <table className="w-full font-mono text-[12px]">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium uppercase tracking-[0.15em]">
                  Method
                </th>
                <th className="px-4 py-2 text-left font-medium uppercase tracking-[0.15em]">
                  Path
                </th>
                <th className="px-4 py-2 text-left font-medium uppercase tracking-[0.15em]">
                  Returns
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-foreground/80">
              {[
                ["GET", "/leaderboard", "LeaderboardEntry[]"],
                ["GET", "/rounds?limit=N", "RoundSummary[]"],
                ["GET", "/rounds/{round_id}", "Round"],
                ["POST", "/classify", "{submission_id, predictions}"],
              ].map(([method, path, ret]) => (
                <tr key={path}>
                  <td className="px-4 py-2">{method}</td>
                  <td className="px-4 py-2">{path}</td>
                  <td className="px-4 py-2 text-foreground/65">{ret}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          base url · https://ch3mistocampus--pathos-fastapi-app.modal.run
        </p>
      </div>

      {/* Footer note */}
      <p className="max-w-3xl border-t border-border/60 pt-6 text-sm leading-relaxed text-foreground/55">
        Code:{" "}
        <a
          href="https://github.com/ch3mistocampus/pathos"
          className="text-foreground/80 underline-offset-2 hover:underline"
        >
          github.com/ch3mistocampus/pathos
        </a>{" "}
        · Modal app:{" "}
        <a
          href="https://modal.com/apps/ch3mistocampus/main/deployed/pathos"
          className="text-foreground/80 underline-offset-2 hover:underline"
        >
          ch3mistocampus/pathos
        </a>
        . Built solo over a weekend; everything you see is running live, not a
        recording.
      </p>
    </section>
  );
}

function Metric({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div
        className={
          mono
            ? "mt-1 font-mono text-2xl tabular-nums tracking-tight text-foreground"
            : "mt-1 text-2xl font-medium tracking-tight text-foreground"
        }
      >
        {value}
      </div>
    </div>
  );
}
