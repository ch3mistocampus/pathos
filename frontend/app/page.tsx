import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  FlaskConical,
  GitBranchPlus,
  LineChart,
  Microscope,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { ArenaPedestal } from "@/components/arena/pedestal";
import {
  BarSpark,
  LiveDot,
  Sparkline,
} from "@/components/arena/icons";
import { AutoRefresh } from "@/components/auto-refresh";
import { MOCK_LEADERBOARD, MOCK_ROUND, STRATEGY_DEFINITIONS } from "@/lib/mock-data";
import {
  AGENT_LABEL,
  AGENT_NAMES,
  CLASSIFICATION_LABEL,
  type AgentName,
  type Classification,
} from "@/lib/types";

const VERDICT_TINT: Record<
  Classification,
  { dot: string; spark: string; text: string; label: string }
> = {
  P: {
    dot: "linear-gradient(160deg,#3563d6,#11286a)",
    spark: "#1d4ed8",
    text: "#1f47b8",
    label: "Pathogenic",
  },
  LP: {
    dot: "linear-gradient(160deg,#4f7fd9,#1f3f8f)",
    spark: "#2a62c5",
    text: "#2a62c5",
    label: "Likely Pathogenic",
  },
  VUS: {
    dot: "linear-gradient(160deg,#b2bbcc,#5b6883)",
    spark: "#6e7a93",
    text: "#5b6883",
    label: "Uncertain Significance",
  },
  LB: {
    dot: "linear-gradient(160deg,#7bb3e8,#3473a6)",
    spark: "#3473a6",
    text: "#3473a6",
    label: "Likely Benign",
  },
  B: {
    dot: "linear-gradient(160deg,#9bd6ff,#3a8fc2)",
    spark: "#0e7490",
    text: "#0e7490",
    label: "Benign",
  },
};

interface StrategyView {
  agent: AgentName;
  label: string;
  specialty: string;
  verdict: Classification;
  verdictLabel: string;
  confidence: number;
  ema: number;
  spark: number[];
  rank: number;
  tint: (typeof VERDICT_TINT)[Classification];
}

function buildStrategyViews(): StrategyView[] {
  const sorted = [...MOCK_LEADERBOARD].sort((a, b) => b.ema - a.ema);
  return sorted.map((entry, idx) => {
    const pred = MOCK_ROUND.predictions[entry.agent];
    const verdict: Classification = pred?.classification ?? "VUS";
    const tint = VERDICT_TINT[verdict];
    return {
      agent: entry.agent,
      label: AGENT_LABEL[entry.agent],
      specialty: STRATEGY_DEFINITIONS[entry.agent].tagline,
      verdict,
      verdictLabel: tint.label,
      confidence: pred?.confidence ?? entry.ema,
      ema: entry.ema,
      spark: entry.history.slice(-9).map((h) => h.score),
      rank: idx + 1,
      tint,
    };
  });
}

const STRATEGIES = buildStrategyViews();

const ORBIT_POSITIONS = [
  "absolute left-[14%] top-[3%] w-[42%] md:w-[40%]",
  "absolute right-[10%] top-[4%] w-[42%] md:w-[40%]",
  "absolute left-[2%] top-[40%] w-[40%] md:w-[37%]",
  "absolute right-[2%] top-[40%] w-[40%] md:w-[37%]",
  "absolute right-[24%] bottom-[8%] w-[40%] md:w-[37%]",
] as const;

const EVIDENCE_SOURCES = [
  "Mapped to ACMG / AMP",
  "ClinVar variants",
  "gnomAD v4",
  "MaveDB functional",
  "AlphaMissense · REVEL · CADD",
  "SpliceAI",
];

const FEATURE_CARDS = [
  {
    icon: LineChart,
    title: "Continuous benchmark",
    body:
      "A fresh ClinVar variant every 90 seconds. Static leaderboards get memorized — rotating challenges don't.",
  },
  {
    icon: ShieldCheck,
    title: "Strategy isolated",
    body:
      "Same model, five distinct ACMG/AMP prompting strategies. Performance gaps reflect strategy, not capability.",
  },
  {
    icon: Microscope,
    title: "Clinically grounded",
    body:
      "Real BRCA1 / BRCA2 variants, real expert consensus from ClinVar's reviewed_by_expert_panel tier.",
  },
  {
    icon: Sparkles,
    title: "Reasoning, audit-grade",
    body:
      "Every verdict ships with applied ACMG criteria and a free-text reasoning trace. Read why, not just what.",
  },
];

export default function HomePage() {
  return (
    <div className="font-sans">
      <AutoRefresh />
      <Hero />
      <TrustStrip />
      <StandardSection />
      <ReportPreview />
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 pb-20 pt-10 lg:px-10 lg:pt-14">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3 lg:pt-8">
          <h1 className="font-display text-[44px] leading-[1.04] tracking-[-0.015em] text-foreground lg:text-[46px]">
            The world&apos;s first{" "}
            <em className="font-display italic text-[var(--primary)]">live</em>{" "}
            genomic AI evaluation platform
          </h1>

          <p className="mt-5 max-w-[36ch] text-[14px] leading-relaxed text-muted-foreground">
            Five Claude strategies. Real-world ClinVar variants. Continuous
            head-to-head competition with full reasoning transparency.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/leaderboard"
              className="pathos-cta inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-medium"
            >
              View the leaderboard
              <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
            </Link>
            <Link
              href="/strategies"
              className="inline-flex items-center rounded-full border border-border bg-card px-5 py-2.5 text-[13px] font-medium text-[var(--primary)] transition-colors hover:bg-[var(--accent-soft)]"
            >
              See the five strategies
            </Link>
          </div>

          <VariantLiveCard className="mt-10" />
        </div>

        <div className="relative lg:col-span-6">
          <div className="mb-3 flex justify-center">
            <span
              className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.18em] backdrop-blur-sm"
              style={{ borderColor: "var(--live-soft)", color: "var(--live)" }}
            >
              <LiveDot />
              Live round in progress
            </span>
          </div>

          <div className="relative mx-auto aspect-[5/4] w-full max-w-[640px]">
            <ArenaPedestal className="absolute inset-0 h-full w-full" />
            {STRATEGIES.map((s, i) => (
              <AgentOrbit key={s.agent} view={s} className={ORBIT_POSITIONS[i]} />
            ))}
          </div>

          <ConsensusCard className="-mt-2" />
        </div>

        <div className="space-y-4 lg:col-span-3 lg:pt-8">
          <LiveLeaderboard />
          <EvidenceAtGlance />
        </div>
      </div>
    </section>
  );
}

function VariantLiveCard({ className }: { className?: string }) {
  const v = MOCK_ROUND.variant;
  const truth = MOCK_ROUND.truth;
  return (
    <div
      className={`pathos-shadow rounded-2xl border border-border bg-card/85 p-4 backdrop-blur-sm ${className ?? ""}`}
    >
      <div
        className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.18em]"
        style={{ color: "var(--live)" }}
      >
        <LiveDot />
        Live now
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[11.5px]">
        <Field
          label="ClinVar Variant"
          value={`${v.gene} ${v.hgvs_c.split(":")[1] ?? v.hgvs_c}`}
          mono
        />
        <Field label="Protein" value={v.hgvs_p ?? "—"} mono />
        <Field label="Genome Build" value="GRCh38" />
        <Field
          label="Coordinate"
          value={`chr${v.chrom}:${v.pos.toLocaleString()}`}
          mono
        />
        <Field label="ClinVar ID" value={truth.clinvar_id} mono />
        <Field
          label="Submitters"
          value={`${truth.submitter_count} ClinVar labs`}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-0.5 ${mono ? "font-mono text-[11.5px]" : "text-[12px]"} text-foreground`}
      >
        {value}
      </div>
    </div>
  );
}

function AgentOrbit({
  view,
  className,
}: {
  view: StrategyView;
  className?: string;
}) {
  return (
    <Link
      href={`/round/${MOCK_ROUND.round_id}`}
      className={`group pathos-lift rounded-2xl border border-white/70 bg-card/72 p-3 backdrop-blur-[10px] transition-transform duration-500 hover:-translate-y-0.5 ${className ?? ""}`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium text-white shadow-inner"
          style={{ background: view.tint.dot }}
        >
          {view.label.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-medium tracking-tight text-foreground">
            {view.label}
          </div>
          <div className="truncate text-[10px] text-muted-foreground">
            {view.specialty}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-2">
        <div>
          <div
            className="text-[10px] font-medium uppercase tracking-[0.12em]"
            style={{ color: view.tint.text }}
          >
            {view.verdictLabel}
          </div>
          <div className="mt-0.5 font-mono text-[18px] tabular-nums tracking-tight text-foreground">
            {view.confidence.toFixed(2)}
          </div>
        </div>
        <Sparkline values={view.spark} stroke={view.tint.spark} />
      </div>
    </Link>
  );
}

function ConsensusCard({ className }: { className?: string }) {
  const avg =
    STRATEGIES.reduce((s, x) => s + x.confidence, 0) / STRATEGIES.length;
  const verdictCounts: Record<Classification, number> = {
    P: 0,
    LP: 0,
    VUS: 0,
    LB: 0,
    B: 0,
  };
  for (const s of STRATEGIES) verdictCounts[s.verdict] += 1;
  const leadingVerdict = (Object.entries(verdictCounts) as [
    Classification,
    number,
  ][]).sort((a, b) => b[1] - a[1])[0][0];

  const markerPct = avg * 100;
  return (
    <div
      className={`pathos-lift relative mx-auto max-w-[440px] rounded-2xl border border-border bg-card/85 p-4 backdrop-blur-sm ${className ?? ""}`}
    >
      <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>Current Consensus</span>
        <span
          className="inline-flex items-center gap-1.5"
          style={{ color: "var(--live)" }}
        >
          <LiveDot />
          Live
        </span>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-3">
        <div className="font-display text-[22px] leading-tight tracking-tight text-foreground">
          {CLASSIFICATION_LABEL[leadingVerdict]}
        </div>
        <div className="text-right">
          <div className="font-mono text-[20px] tabular-nums text-foreground">
            {avg.toFixed(2)}
          </div>
          <div className="text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
            Avg. confidence
          </div>
        </div>
      </div>

      <div className="relative mt-4 h-2 w-full rounded-full bg-[linear-gradient(90deg,#cfe9d6_0%,#e7e1b8_50%,#f2c4b8_100%)]">
        <div
          className="absolute -top-1.5 h-5 w-1 rounded-full bg-foreground shadow-[0_4px_12px_-2px_rgba(12,23,51,0.55)]"
          style={{ left: `calc(${markerPct}% - 2px)` }}
          aria-hidden
        />
      </div>
      <div className="mt-2 flex justify-between text-[9.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span>Benign</span>
        <span>Uncertain</span>
        <span>Pathogenic</span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[10.5px] text-muted-foreground">
        <span>
          Expert consensus:{" "}
          <span className="font-medium text-foreground">
            {MOCK_ROUND.truth.classification.replace(/_/g, " ")}
          </span>
        </span>
        <Link
          href={`/round/${MOCK_ROUND.round_id}`}
          className="inline-flex items-center gap-1 font-medium text-[var(--primary)] hover:text-foreground"
        >
          Inspect round
          <ArrowUpRight className="size-3" strokeWidth={1.75} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function LiveLeaderboard() {
  return (
    <section
      aria-label="Live leaderboard"
      className="pathos-lift rounded-2xl border border-border bg-card/90 p-4 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] font-medium text-foreground">
          <LineChart
            className="size-3.5 text-[var(--primary)]"
            strokeWidth={1.75}
          />
          Live Leaderboard
        </div>
        <Link
          href="/leaderboard"
          className="text-[11px] font-medium text-[var(--primary)] hover:text-foreground"
        >
          View all
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-[1.5rem_1fr_auto] gap-x-3 gap-y-2 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>Rank</span>
        <span>Strategy</span>
        <span className="text-right">EMA</span>
      </div>
      <div className="mt-1 divide-y divide-border/60">
        {STRATEGIES.map((s) => (
          <div
            key={s.agent}
            className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-x-3 py-2 text-[12px]"
          >
            <span className="font-mono tabular-nums text-muted-foreground">
              {s.rank}
            </span>
            <span className="flex items-center gap-2 truncate">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ background: s.tint.spark }}
              />
              <span className="truncate font-medium text-foreground">
                {s.label}
              </span>
            </span>
            <span className="font-mono tabular-nums text-foreground">
              {s.ema.toFixed(3)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[10.5px] text-muted-foreground">
        <span>EMA · α=0.10 · all rounds</span>
        <span
          className="inline-flex items-center gap-1.5 font-medium uppercase tracking-[0.16em]"
          style={{ color: "var(--live)" }}
        >
          <LiveDot />
          Live
        </span>
      </div>
    </section>
  );
}

function EvidenceAtGlance() {
  const v = MOCK_ROUND.variant;
  const rows = [
    {
      label: "Population frequency",
      value: v.gnomad.af_popmax
        ? `popmax ${v.gnomad.af_popmax}`
        : `Absent in gnomAD (0/${v.gnomad.an.toLocaleString()})`,
      icon: Users,
      spark: [0.18, 0.22, 0.2, 0.16, 0.12],
      color: "#1d4ed8",
    },
    {
      label: "In-silico predictors",
      value: `REVEL ${v.insilico.revel} · AM ${v.insilico.alphamissense}`,
      icon: Activity,
      spark: [0.5, 0.62, 0.74, 0.82, 0.88],
      color: "#0e7490",
    },
    {
      label: "Protein impact",
      value: v.hgvs_p
        ? `${v.consequence.replace(/_/g, " ")} · ${v.hgvs_p}`
        : v.consequence,
      icon: GitBranchPlus,
      spark: [0.34, 0.46, 0.58, 0.68, 0.76],
      color: "#0f3a8a",
    },
    {
      label: "Splicing impact",
      value: `SpliceAI ${v.insilico.spliceai_max ?? "—"}`,
      icon: LineChart,
      spark: [0.28, 0.36, 0.44, 0.5, 0.55],
      color: "#0e7490",
    },
    {
      label: "Functional assay",
      value: v.mavedb_function
        ? `PS3 · ${v.mavedb_function.category.replace(/_/g, " ")}`
        : "no assay",
      icon: FlaskConical,
      spark: [0.4, 0.52, 0.6, 0.66, 0.7],
      color: "#1d4ed8",
    },
  ];

  return (
    <section
      aria-label="Evidence at a glance"
      className="pathos-lift rounded-2xl border border-border bg-card/90 p-4 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] font-medium text-foreground">
          <Microscope
            className="size-3.5 text-[var(--primary)]"
            strokeWidth={1.75}
          />
          Evidence at a Glance
        </div>
        <Link
          href={`/round/${MOCK_ROUND.round_id}`}
          className="text-[11px] font-medium text-[var(--primary)] hover:text-foreground"
        >
          View all
        </Link>
      </div>

      <ul className="mt-3 divide-y divide-border/60">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <li
              key={row.label}
              className="grid grid-cols-[1.6rem_1fr_auto] items-center gap-x-3 py-2.5"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent-soft)] text-[var(--primary)]">
                <Icon className="size-3.5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-medium text-foreground">
                  {row.label}
                </div>
                <div className="truncate text-[10.5px] text-muted-foreground">
                  {row.value}
                </div>
              </div>
              <BarSpark values={row.spark} color={row.color} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="border-y border-border bg-card/60 py-7 backdrop-blur-sm">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="text-center text-[10.5px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Grounded in the same evidence stack human reviewers use
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {EVIDENCE_SOURCES.map((name) => (
            <div
              key={name}
              className="inline-flex items-center gap-2 text-[12.5px] font-medium tracking-tight text-muted-foreground"
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--primary)", opacity: 0.5 }}
              />
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StandardSection() {
  return (
    <section
      id="platform"
      className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-[40px] leading-[1.04] tracking-[-0.015em] text-foreground lg:text-[44px]">
          A new standard for genomic AI evaluation
        </h2>
        <p className="mt-5 text-[14.5px] leading-relaxed text-muted-foreground">
          Built for scientists and clinicians who demand rigor, transparency,
          and real-world relevance.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURE_CARDS.map((feature) => {
          const Icon = feature.icon;
          return (
            <article
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[0_28px_60px_-30px_rgba(20,46,133,0.28)]"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(160deg,#eaf1fc,#dde8f9)] text-[var(--primary)] dark:bg-[linear-gradient(160deg,rgba(53,99,214,0.18),rgba(53,99,214,0.06))]">
                <Icon className="size-4" strokeWidth={1.6} />
              </span>
              <h3 className="mt-5 text-[15.5px] font-medium tracking-tight text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
              <Link
                href="/strategies"
                className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--primary)] transition-colors group-hover:text-foreground"
              >
                Learn more
                <ArrowUpRight className="size-3.5" strokeWidth={1.75} aria-hidden />
              </Link>
            </article>
          );
        })}
      </div>

      <ReasoningPanel />
    </section>
  );
}

function ReasoningPanel() {
  const leader = STRATEGIES[0];
  const pred = MOCK_ROUND.predictions[leader.agent];
  const criteria = pred?.applied_criteria ?? [];
  return (
    <section
      id="reasoning"
      className="mt-14 grid gap-8 rounded-3xl border border-border bg-card/85 p-6 backdrop-blur-sm lg:grid-cols-[1.05fr_1fr] lg:p-10"
    >
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Microscope
            className="size-3 text-[var(--primary)]"
            strokeWidth={1.75}
          />
          AI Reasoning, audit-grade
        </div>
        <h3 className="mt-5 font-display text-[30px] leading-[1.08] tracking-[-0.01em] text-foreground">
          Every prediction comes with its work shown.
        </h3>
        <p className="mt-4 max-w-prose text-[13.5px] leading-relaxed text-muted-foreground">
          Each verdict is paired with the ACMG/AMP criteria the agent applied
          and the free-text reasoning behind it. Reviewers interrogate the
          logic, not just the label.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3 text-[11.5px]">
          <Stat label="Strategies" value="5 prompts" />
          <Stat label="Round cadence" value="90 seconds" />
          <Stat label="Leader EMA" value={STRATEGIES[0].ema.toFixed(3)} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-[var(--accent-soft)] p-5">
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-medium tracking-tight text-foreground">
            Reasoning trace
          </div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--primary)]">
            {leader.agent}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {criteria.map((c) => (
            <span
              key={c}
              className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[10.5px] text-foreground"
            >
              {c}
            </span>
          ))}
        </div>

        <p className="mt-4 max-h-[14rem] overflow-hidden text-[12.5px] leading-relaxed text-muted-foreground">
          {pred?.reasoning}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span>
            Verdict ·{" "}
            <span className="font-medium text-foreground">
              {VERDICT_TINT[leader.verdict].label}
            </span>
          </span>
          <Link
            href={`/round/${MOCK_ROUND.round_id}`}
            className="inline-flex items-center gap-1 font-medium text-[var(--primary)] hover:text-foreground"
          >
            View full trace
            <ArrowUpRight className="size-3" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-[14px] font-medium text-foreground">
        {value}
      </div>
    </div>
  );
}

function ReportPreview() {
  const leader = STRATEGIES[0];
  const totalRounds = MOCK_LEADERBOARD[0]?.rounds ?? 0;
  return (
    <section
      id="solutions"
      className="relative mt-8 overflow-hidden border-t border-[#101a36] bg-[#0a1733] text-white"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3463d6]/45 to-transparent" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(49,98,206,0.35) 0%, rgba(10,23,51,0) 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:pt-20">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
              From research to report
            </span>
            <h2 className="mt-5 font-display text-[44px] leading-[1.04] tracking-[-0.01em] lg:text-[52px]">
              Built for the bench. Audited like a paper.
            </h2>
            <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-white/70">
              The same evidence stack and reasoning traces that feed the public
              arena drop into cohort analytics and ACMG-aligned variant reports
              without an export step.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-[#0c1733] shadow-[0_18px_36px_-18px_rgba(10,23,51,0.7)] transition-transform active:translate-y-px"
              >
                Live leaderboard
                <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
              </Link>
              <Link
                href={`/round/${MOCK_ROUND.round_id}`}
                className="inline-flex items-center rounded-full border border-white/20 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-white/8"
              >
                Inspect a round
              </Link>
            </div>
          </div>

          <DashboardPeek
            leaderLabel={leader.label}
            leaderEma={leader.ema}
            rounds={totalRounds}
            sortedHistoryScores={
              MOCK_LEADERBOARD.find((e) => e.agent === leader.agent)?.history
                .slice(-9)
                .map((h) => h.score) ?? []
            }
          />
        </div>
      </div>
    </section>
  );
}

function DashboardPeek({
  leaderLabel,
  leaderEma,
  rounds,
  sortedHistoryScores,
}: {
  leaderLabel: string;
  leaderEma: number;
  rounds: number;
  sortedHistoryScores: number[];
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-1 text-[10.5px] text-white/70">
        <span className="rounded-md bg-white/8 px-2.5 py-1 font-medium text-white">
          Strategy performance
        </span>
        <span className="rounded-md px-2.5 py-1">Cohort calibration</span>
        <span className="rounded-md px-2.5 py-1">Criterion match</span>
        <span className="ml-auto rounded-md border border-white/15 px-2 py-1">
          +
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <PeekTile
          label="Leader · EMA"
          metric={leaderEma.toFixed(3)}
          delta={leaderLabel}
          spark={sortedHistoryScores}
        />
        <PeekTile
          label="Rounds run"
          metric={String(rounds)}
          delta="continuous · 90s cadence"
          spark={[0.42, 0.48, 0.55, 0.6, 0.66, 0.72, 0.78, 0.84, 0.9]}
          color="#9bd6ff"
        />
        <PeekTile
          label="Strategies"
          metric={String(AGENT_NAMES.length)}
          delta="prompt-isolated · same model"
          spark={[0.55, 0.6, 0.62, 0.66, 0.7, 0.72, 0.74, 0.76, 0.78]}
          color="#c4d7ff"
        />
      </div>
    </div>
  );
}

function PeekTile({
  label,
  metric,
  delta,
  spark,
  color = "#7fb1ff",
}: {
  label: string;
  metric: string;
  delta: string;
  spark: number[];
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
      <div className="text-[10.5px] uppercase tracking-[0.14em] text-white/55">
        {label}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <div className="font-mono text-[22px] tabular-nums tracking-tight">
          {metric}
        </div>
        <Sparkline values={spark} stroke={color} width={64} height={20} />
      </div>
      <div className="mt-2 text-[10.5px] text-white/55">{delta}</div>
    </div>
  );
}
