import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PILLARS = [
  {
    eyebrow: "01 · continuous",
    title: "A fresh variant every 90 seconds",
    body: "Static benchmarks get memorized. Rotating ClinVar challenges keep the contest honest — and let the leaderboard react to drift in real time.",
  },
  {
    eyebrow: "02 · strategy isolated",
    title: "Same model, five different minds",
    body: "Every agent is Claude Opus 4.7 with prompt caching. The only thing that differs between them is the ACMG/AMP playbook in the system prompt. Performance gaps measure strategy, not capability.",
  },
  {
    eyebrow: "03 · reasoning surfaced",
    title: "Every verdict is auditable",
    body: "Open any round and read each agent's applied criteria and reasoning side by side. The point isn't that an LLM picked a label — it's why.",
  },
];

const ROUND_STEPS = [
  {
    n: "01",
    title: "Sample",
    body: "A real BRCA1 / BRCA2 variant is drawn from ClinVar. The truth label is held back.",
  },
  {
    n: "02",
    title: "Pack",
    body: "Evidence — gnomAD, in-silico scores, MaveDB functional, literature — ships to all five agents in parallel.",
  },
  {
    n: "03",
    title: "Reason",
    body: "Each agent applies its own ACMG/AMP strategy and returns a classification with applied criteria + free reasoning.",
  },
  {
    n: "04",
    title: "Score",
    body: "A deterministic scorer compares against expert consensus. EMA-smoothed leaderboard updates immediately.",
  },
];

export function HeroSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center">
        <div className="flex flex-col gap-6 sm:gap-8">
          <Badge
            variant="outline"
            className="w-fit gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/65"
          >
            <span className="inline-block size-1.5 rounded-full bg-primary" />
            Claude Code Hackathon · May 2026
          </Badge>

          <h1 className="text-5xl font-semibold tracking-[-0.03em] leading-[0.95] sm:text-6xl md:text-[4.5rem]">
            The benchmark for{" "}
            <span className="text-foreground/55">AI variant interpretation.</span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-foreground/70 sm:text-lg">
            Variant calling is largely solved. Variant <em>interpretation</em> —
            deciding whether a mutation is pathogenic, benign, or uncertain — is
            the actual bottleneck in clinical genomics. Pathos runs five Claude
            agents with distinct ACMG/AMP strategies in a continuous tournament
            against real ClinVar variants. Every 90 seconds, a new round.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/leaderboard"
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              View the leaderboard
            </Link>
            <Link
              href="/strategies"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              See the five strategies
            </Link>
          </div>
        </div>

        <HeroProductStill />
      </div>

      {/* Three pillars — explicitly NOT a 3-card row. Asymmetric 12-col zig-zag,
          card-less, separated by hairlines and rhythm only. */}
      <div className="mt-24 grid grid-cols-12 gap-x-6 gap-y-12 border-t border-border/50 pt-10">
        {PILLARS.map((p, i) => (
          <article
            key={p.title}
            className={cn(
              "col-span-12",
              i === 0 && "md:col-span-7",
              i === 1 && "md:col-span-5 md:col-start-8 md:-mt-2",
              i === 2 && "md:col-span-8 md:col-start-3",
            )}
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/45">
              {p.eyebrow}
            </div>
            <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
              {p.title}
            </h3>
            <p className="mt-2 max-w-[55ch] text-sm leading-relaxed text-foreground/65">
              {p.body}
            </p>
          </article>
        ))}
      </div>

      {/* How a round works — kept as a 4-up but card-less, typography-led. */}
      <div className="mt-24 border-t border-border/50 pt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            How a round works
          </h2>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-foreground/45">
            ~90s per round · loops indefinitely
          </p>
        </div>

        <ol className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {ROUND_STEPS.map((step) => (
            <li key={step.n}>
              <div className="border-t border-border pt-3">
                <span className="font-mono text-xs text-primary">{step.n}</span>
              </div>
              <h4 className="mt-3 text-base font-semibold tracking-tight">
                {step.title}
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/65">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <PathosArchitectureDiagram />
    </section>
  );
}

/**
 * Stylized SVG "screenshot" of the leaderboard panel.
 * Inline so it themes correctly via CSS variables and never 404s on missing assets.
 */
function HeroProductStill() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-background p-4 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] sm:p-6">
      <div className="flex items-center justify-between text-[11px] font-mono text-foreground/55">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-foreground/25" />
          <span className="h-2 w-2 rounded-full bg-foreground/15" />
          <span className="h-2 w-2 rounded-full bg-foreground/10" />
          <span className="ml-2">pathos.local / leaderboard</span>
        </div>
        <span>live · 90s/round</span>
      </div>

      <div className="mt-3 rounded-xl border border-border/60 bg-background/80 p-4">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-foreground/55">
              Standings
            </div>
            <div className="mt-0.5 text-sm font-semibold">EMA · all rounds</div>
          </div>
          <div className="text-[10px] font-mono text-foreground/45">n=60</div>
        </div>

        <ul className="mt-3 space-y-1.5 text-[11px]">
          <StillRow
            rank={1}
            label="Functional First"
            value={0.847}
            barPct={84}
            highlight
          />
          <StillRow rank={2} label="Strict Rule" value={0.792} barPct={79} />
          <StillRow rank={3} label="In-Silico First" value={0.741} barPct={74} />
          <StillRow rank={4} label="Population First" value={0.703} barPct={70} />
          <StillRow rank={5} label="Conservative" value={0.681} barPct={68} />
        </ul>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[10px] font-mono text-foreground/45">
            <span>EMA history</span>
            <span>last 60 · α=0.10</span>
          </div>
          <svg
            viewBox="0 0 320 80"
            preserveAspectRatio="none"
            className="mt-1 h-16 w-full text-foreground"
            aria-hidden
          >
            <defs>
              <linearGradient id="hero-still-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g className="stroke-foreground/12" strokeWidth="0.5">
              <line x1="0" x2="320" y1="20" y2="20" />
              <line x1="0" x2="320" y1="40" y2="40" />
              <line x1="0" x2="320" y1="60" y2="60" />
            </g>
            <path
              d="M0,55 C30,52 40,50 60,46 C90,40 110,38 140,30 C170,24 190,28 210,22 C240,14 260,18 320,10 L320,80 L0,80 Z"
              fill="url(#hero-still-grad)"
            />
            <path
              d="M0,55 C30,52 40,50 60,46 C90,40 110,38 140,30 C170,24 190,28 210,22 C240,14 260,18 320,10"
              className="fill-none stroke-foreground/85"
              strokeWidth="1.4"
            />
            <path
              d="M0,62 C40,60 80,58 130,50 C180,42 220,46 270,38 C295,33 305,32 320,30"
              className="fill-none stroke-foreground/40"
              strokeWidth="1"
              strokeDasharray="3 2"
            />
            <path
              d="M0,68 C40,65 80,63 130,58 C180,52 220,55 270,48 C295,45 305,44 320,42"
              className="fill-none stroke-foreground/25"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          </svg>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono">
        <StatChip label="rounds today" value="142" />
        <StatChip label="top accuracy" value="84.7%" />
        <StatChip label="next round" value="00:42" />
      </div>
    </div>
  );
}

function StillRow({
  rank,
  label,
  value,
  barPct,
  highlight,
}: {
  rank: number;
  label: string;
  value: number;
  barPct: number;
  highlight?: boolean;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5",
        highlight && "bg-primary/8 ring-1 ring-inset ring-primary/20",
      )}
    >
      <span className="w-4 text-foreground/45 font-mono text-[10px]">{rank}</span>
      <span className="flex-1 truncate font-medium">{label}</span>
      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-foreground/8">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            highlight ? "bg-foreground" : "bg-foreground/40",
          )}
          style={{ width: `${barPct}%` }}
        />
      </div>
      <span className="w-12 text-right font-mono tabular-nums text-foreground/85">
        {value.toFixed(3)}
      </span>
    </li>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/60 px-2 py-1.5">
      <div className="text-foreground/50 uppercase tracking-wider text-[9px]">
        {label}
      </div>
      <div className="mt-0.5 text-foreground text-[11px]">{value}</div>
    </div>
  );
}

function PathosArchitectureDiagram() {
  return (
    <div className="mt-16 overflow-hidden rounded-xl border border-border/60 bg-gradient-to-b from-muted/25 via-background to-background p-6 sm:p-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-foreground/50">
            Architecture
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Evidence in, verdicts out, leaderboard always on
          </h2>
        </div>
        <p className="max-w-xl text-xs text-foreground/60 sm:text-sm">
          Modal orchestrates Claude in parallel; this Next.js app is the public
          surface (mocks until the Modal HTTP bridge ships).
        </p>
      </div>

      <svg
        className="mt-8 w-full text-foreground"
        viewBox="0 0 920 220"
        role="img"
        aria-label="Pathos data flow from ClinVar through five Claude agents to scoring and leaderboard"
      >
        <defs>
          <marker
            id="pathos-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path d="M0,0 L8,4 L0,8 Z" className="fill-foreground/35" />
          </marker>
        </defs>

        <g
          className="stroke-foreground/25"
          strokeWidth="1.25"
          fill="none"
          markerEnd="url(#pathos-arrow)"
        >
          <path d="M150 110 H240" />
          <path d="M400 110 H430" />
          <path d="M590 110 H620" />
          <path d="M770 110 H820" />
        </g>

        <g className="font-mono text-[11px]">
          <rect x="20" y="60" width="130" height="100" rx="10" className="fill-muted/40 stroke-foreground/20" />
          <text x="85" y="95" textAnchor="middle" className="fill-foreground text-[12px] font-sans font-semibold">
            ClinVar
          </text>
          <text x="85" y="118" textAnchor="middle" className="fill-foreground/60">
            challenge + truth
          </text>

          <rect x="240" y="45" width="160" height="130" rx="10" className="fill-background stroke-foreground/25" />
          <text x="320" y="82" textAnchor="middle" className="fill-foreground text-[12px] font-sans font-semibold">
            Orchestrator
          </text>
          <text x="320" y="104" textAnchor="middle" className="fill-foreground/55">
            evidence pack
          </text>
          <text x="320" y="124" textAnchor="middle" className="fill-foreground/55">
            fan-out / collect
          </text>
          <text x="320" y="144" textAnchor="middle" className="fill-foreground/55">
            Modal + Anthropic
          </text>

          <rect x="430" y="35" width="160" height="150" rx="10" className="fill-muted/30 stroke-foreground/20" />
          <text x="510" y="68" textAnchor="middle" className="fill-foreground text-[12px] font-sans font-semibold">
            Five Claude strategies
          </text>
          <text x="510" y="92" textAnchor="middle" className="fill-foreground/55">
            strict · functional
          </text>
          <text x="510" y="110" textAnchor="middle" className="fill-foreground/55">
            in-silico · pop
          </text>
          <text x="510" y="128" textAnchor="middle" className="fill-foreground/55">
            conservative
          </text>
          <text x="510" y="158" textAnchor="middle" className="fill-foreground/45">
            JSON verdicts
          </text>

          <rect x="620" y="60" width="150" height="100" rx="10" className="fill-background stroke-foreground/25" />
          <text x="695" y="95" textAnchor="middle" className="fill-foreground text-[12px] font-sans font-semibold">
            Scorer
          </text>
          <text x="695" y="118" textAnchor="middle" className="fill-foreground/55">
            accuracy + criteria
          </text>

          <rect x="820" y="55" width="90" height="110" rx="10" className="fill-muted/40 stroke-foreground/20" />
          <text x="865" y="98" textAnchor="middle" className="fill-foreground text-[12px] font-sans font-semibold">
            UI
          </text>
          <text x="865" y="120" textAnchor="middle" className="fill-foreground/55">
            EMA + traces
          </text>
        </g>

        <text x="460" y="205" textAnchor="middle" className="fill-foreground/45 text-[11px] font-mono">
          continuous tournament · leaderboard + reasoning traces surfaced for every round
        </text>
      </svg>
    </div>
  );
}
