import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  ChevronDown,
  FlaskConical,
  GitBranchPlus,
  LineChart,
  Microscope,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { ArenaPedestal } from "./_components/pedestal";
import {
  BarSpark,
  HelixMark,
  LiveDot,
  Sparkline,
} from "./_components/icons";

// ─────────────────────────────────────────────────────────────────────────────
// Static data — written like real product copy. Numbers are messy on purpose.
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Solutions", href: "#solutions" },
  { label: "Resources", href: "#resources" },
  { label: "Company", href: "#company" },
  { label: "Pricing", href: "#pricing" },
] as const;

type Verdict =
  | "Pathogenic"
  | "Likely Pathogenic"
  | "Uncertain Significance"
  | "Likely Benign";

interface AgentCard {
  name: string;
  specialty: string;
  verdict: Verdict;
  confidence: number;
  spark: number[];
}

const AGENT_CARDS: AgentCard[] = [
  {
    name: "AlphaGenome",
    specialty: "Deep Context Model",
    verdict: "Pathogenic",
    confidence: 0.92,
    spark: [0.42, 0.51, 0.58, 0.61, 0.7, 0.78, 0.81, 0.88, 0.92],
  },
  {
    name: "GeneFoundry",
    specialty: "Causal Inference Model",
    verdict: "Pathogenic",
    confidence: 0.88,
    spark: [0.36, 0.42, 0.48, 0.55, 0.62, 0.7, 0.78, 0.83, 0.88],
  },
  {
    name: "HelixLM",
    specialty: "Multi-Modal Transformer",
    verdict: "Likely Pathogenic",
    confidence: 0.78,
    spark: [0.31, 0.4, 0.46, 0.5, 0.56, 0.62, 0.68, 0.74, 0.78],
  },
  {
    name: "DNAnexus AI",
    specialty: "Graph Neural Network",
    verdict: "Likely Pathogenic",
    confidence: 0.74,
    spark: [0.28, 0.34, 0.42, 0.48, 0.55, 0.6, 0.66, 0.7, 0.74],
  },
  {
    name: "SpliceAI 2.0",
    specialty: "Splicing Specialist",
    verdict: "Likely Pathogenic",
    confidence: 0.69,
    spark: [0.22, 0.31, 0.4, 0.46, 0.52, 0.58, 0.62, 0.66, 0.69],
  },
  {
    name: "EvoPredict",
    specialty: "Evolutionary Model",
    verdict: "Uncertain Significance",
    confidence: 0.42,
    spark: [0.55, 0.5, 0.48, 0.46, 0.44, 0.4, 0.42, 0.41, 0.42],
  },
];

interface EvidenceRow {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  spark: number[];
  color: string;
}

const EVIDENCE_ROWS: EvidenceRow[] = [
  {
    label: "Population Frequency",
    value: "Absent in gnomAD (0/281,632)",
    icon: Users,
    spark: [0.18, 0.22, 0.2, 0.16, 0.12],
    color: "#1d4ed8",
  },
  {
    label: "Conservation",
    value: "Highly conserved (phyloP 5.21)",
    icon: Activity,
    spark: [0.5, 0.62, 0.74, 0.82, 0.88],
    color: "#0e7490",
  },
  {
    label: "Protein Impact",
    value: "Frameshift with premature stop",
    icon: GitBranchPlus,
    spark: [0.34, 0.46, 0.58, 0.68, 0.76],
    color: "#0f3a8a",
  },
  {
    label: "Splicing Impact",
    value: "Aberrant donor site created",
    icon: LineChart,
    spark: [0.28, 0.36, 0.44, 0.5, 0.55],
    color: "#0e7490",
  },
  {
    label: "Functional Assays",
    value: "PS3 — Supporting",
    icon: FlaskConical,
    spark: [0.4, 0.52, 0.6, 0.66, 0.7],
    color: "#1d4ed8",
  },
];

const INSTITUTIONS = [
  "Mayo Clinic",
  "Dana-Farber Cancer Institute",
  "Broad Institute",
  "NIH · National Human Genome Research Institute",
  "All of Us Research Program",
  "Sage Bionetworks",
  "Vanderbilt University Medical Center",
];

const FEATURE_CARDS = [
  {
    icon: LineChart,
    title: "Robust Benchmarking",
    body:
      "Live, head-to-head evaluation of leading AI models on real-world variants with gold-standard expert curation.",
  },
  {
    icon: ShieldCheck,
    title: "Radical Transparency",
    body:
      "See every model's prediction, confidence, evidence, and reasoning side by side — in real time.",
  },
  {
    icon: Microscope,
    title: "Clinically Relevant",
    body:
      "Focused on variants that matter in clinic, mapped to ACMG/AMP interpretation frameworks.",
  },
  {
    icon: Sparkles,
    title: "Insightful Analytics",
    body:
      "Population-level performance analytics to guide model selection and drive continuous improvement.",
  },
];

const REASONING_STEPS = [
  {
    title: "Variant Effect",
    detail: "Frameshift deletion + premature stop codon at codon 23.",
  },
  {
    title: "Population Data",
    detail: "Absent in gnomAD (0/281,632) — supports pathogenicity.",
  },
  {
    title: "Conservation",
    detail: "High conservation across mammals (phyloP 5.21).",
  },
  {
    title: "Functional Evidence",
    detail:
      "LoF predicted by multiple tools; prior LoF variant at codon 23 reported pathogenic.",
  },
  {
    title: "Conclusion",
    detail: "Multiple lines of evidence support pathogenic classification.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ArenaPage() {
  return (
    <>
      <ArenaNav />
      <main className="font-sans">
        <Hero />
        <TrustStrip />
        <StandardSection />
        <ReportPreview />
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Top nav
// ─────────────────────────────────────────────────────────────────────────────

function ArenaNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#dde6f3]/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <Link href="#" className="flex items-center gap-2.5">
            <HelixMark className="h-7 w-6" />
            <div className="leading-tight">
              <div className="text-[15px] font-medium tracking-tight text-[#0c1733]">
                Genomic Arena
              </div>
              <div className="text-[10.5px] tracking-wide text-[#5b6c8a]">
                Real-time competition for genetic intelligence
              </div>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-medium text-[#3a4a6b] transition-colors hover:bg-[#eef3fb] hover:text-[#0c1733]"
            >
              {link.label}
              <ChevronDown
                className="size-3 text-[#94a3be] transition-transform group-hover:translate-y-px"
                strokeWidth={1.75}
                aria-hidden
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="#sign-in"
            className="hidden text-[13px] font-medium text-[#3a4a6b] hover:text-[#0c1733] sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="#request"
            className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(180deg,#1f47b8_0%,#142e85_100%)] px-4 py-2 text-[13px] font-medium text-white shadow-[0_8px_22px_-10px_rgba(20,46,133,0.55),inset_0_1px_0_rgba(255,255,255,0.18)] transition-transform active:translate-y-px"
          >
            Request access
            <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 pb-20 pt-12 lg:px-10 lg:pt-16">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        {/* LEFT: headline + variant card */}
        <div className="lg:col-span-3 lg:pt-8">
          <h1
            className="text-[44px] leading-[1.04] tracking-[-0.015em] text-[#0c1733] lg:text-[46px]"
            style={{ fontFamily: "var(--font-instrument-serif)" }}
          >
            The world&apos;s first{" "}
            <em
              className="not-italic"
              style={{
                fontStyle: "italic",
                fontFamily: "var(--font-instrument-serif)",
                color: "#1f47b8",
              }}
            >
              live
            </em>{" "}
            genomic AI evaluation platform
          </h1>

          <p className="mt-5 max-w-[36ch] text-[14px] leading-relaxed text-[#4d5d80]">
            Multiple AI agents. Real-world variants. Continuous competition.
            Maximum transparency.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="#request"
              className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(180deg,#1f47b8_0%,#142e85_100%)] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_14px_30px_-14px_rgba(20,46,133,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform active:translate-y-px"
            >
              Request access
            </Link>
            <Link
              href="#platform"
              className="inline-flex items-center rounded-full border border-[#cbd6ea] bg-white px-5 py-2.5 text-[13px] font-medium text-[#1f47b8] transition-colors hover:bg-[#f4f7fc]"
            >
              Explore the platform
            </Link>
          </div>

          <VariantLiveCard className="mt-10" />
        </div>

        {/* CENTER: pedestal + orbiting agent cards + consensus */}
        <div className="relative lg:col-span-6">
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/70 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.18em] text-emerald-700 backdrop-blur-sm">
              <LiveDot />
              Live evaluation in progress
            </span>
          </div>

          <div className="relative mx-auto aspect-[5/4] w-full max-w-[640px]">
            <ArenaPedestal className="absolute inset-0 h-full w-full" />

            {/* Agent cards positioned around the pedestal.
                Percent-based positions stay readable down to ~720px wide. */}
            <AgentOrbit
              card={AGENT_CARDS[0]}
              className="absolute left-[14%] top-[5%] w-[42%] md:w-[40%]"
            />
            <AgentOrbit
              card={AGENT_CARDS[1]}
              className="absolute right-[10%] top-[6%] w-[42%] md:w-[40%]"
            />
            <AgentOrbit
              card={AGENT_CARDS[2]}
              className="absolute left-[2%] top-[40%] w-[40%] md:w-[37%]"
            />
            <AgentOrbit
              card={AGENT_CARDS[3]}
              className="absolute right-[2%] top-[40%] w-[40%] md:w-[37%]"
            />
            <AgentOrbit
              card={AGENT_CARDS[4]}
              className="absolute right-[12%] bottom-[12%] w-[40%] md:w-[37%]"
            />
            <AgentOrbit
              card={AGENT_CARDS[5]}
              className="absolute left-[14%] bottom-[12%] w-[40%] md:w-[37%]"
            />
          </div>

          <ConsensusCard className="-mt-2" />
        </div>

        {/* RIGHT: leaderboard + evidence */}
        <div className="space-y-4 lg:col-span-3 lg:pt-8">
          <LiveLeaderboard />
          <EvidenceAtGlance />
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Left supporting card — "LIVE NOW" variant
// ─────────────────────────────────────────────────────────────────────────────

function VariantLiveCard({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[#dde6f3] bg-white/85 p-4 shadow-[0_18px_40px_-24px_rgba(20,46,133,0.25),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-sm ${className ?? ""}`}
    >
      <div className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.18em] text-emerald-700">
        <LiveDot />
        Live now
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-[11.5px]">
        <Field label="ClinVar Variant" value="BRCA1 c.68_69delAG" mono />
        <Field label="Protein" value="p.Glu23Valfs*17" mono />
        <Field label="Genome Build" value="GRCh38" />
        <Field label="Coordinate" value="chr17:43,044,294-43,044,295" mono />
        <Field label="Variant ID" value="CA-0007921" mono />
        <Field label="Submitters" value="18 ClinVar labs" />
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
      <div className="text-[9.5px] uppercase tracking-[0.14em] text-[#7a8aab]">
        {label}
      </div>
      <div
        className={`mt-0.5 ${mono ? "font-mono text-[11.5px]" : "text-[12px]"} text-[#0c1733]`}
      >
        {value}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent cards floating around the pedestal
// ─────────────────────────────────────────────────────────────────────────────

function AgentOrbit({
  card,
  className,
}: {
  card: AgentCard;
  className?: string;
}) {
  const tint = verdictTint(card.verdict);
  return (
    <div
      className={`group rounded-2xl border border-white/70 bg-white/72 p-3 shadow-[0_22px_44px_-26px_rgba(20,46,133,0.45),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-[10px] transition-transform duration-500 hover:-translate-y-0.5 ${className ?? ""}`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium text-white shadow-inner"
          style={{ background: tint.dot }}
        >
          {card.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-medium tracking-tight text-[#0c1733]">
            {card.name}
          </div>
          <div className="truncate text-[10px] text-[#6a7a99]">
            {card.specialty}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-2">
        <div>
          <div
            className="text-[10px] font-medium uppercase tracking-[0.12em]"
            style={{ color: tint.text }}
          >
            {card.verdict}
          </div>
          <div className="mt-0.5 text-[18px] font-mono tabular-nums tracking-tight text-[#0c1733]">
            {card.confidence.toFixed(2)}
          </div>
        </div>
        <Sparkline values={card.spark} stroke={tint.spark} />
      </div>
    </div>
  );
}

function verdictTint(verdict: Verdict): {
  dot: string;
  spark: string;
  text: string;
} {
  switch (verdict) {
    case "Pathogenic":
      return {
        dot: "linear-gradient(160deg,#3563d6,#11286a)",
        spark: "#1d4ed8",
        text: "#1f47b8",
      };
    case "Likely Pathogenic":
      return {
        dot: "linear-gradient(160deg,#4f7fd9,#1f3f8f)",
        spark: "#2a62c5",
        text: "#2a62c5",
      };
    case "Uncertain Significance":
      return {
        dot: "linear-gradient(160deg,#b2bbcc,#5b6883)",
        spark: "#6e7a93",
        text: "#5b6883",
      };
    case "Likely Benign":
      return {
        dot: "linear-gradient(160deg,#7bb3e8,#3473a6)",
        spark: "#3473a6",
        text: "#3473a6",
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Consensus card under the pedestal
// ─────────────────────────────────────────────────────────────────────────────

function ConsensusCard({ className }: { className?: string }) {
  // Confidence 0.81 → marker sits in the "likely pathogenic" zone.
  const markerPct = 0.81 * 100;

  return (
    <div
      className={`relative mx-auto max-w-[440px] rounded-2xl border border-[#dde6f3] bg-white/85 p-4 shadow-[0_22px_40px_-22px_rgba(20,46,133,0.3),inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm ${className ?? ""}`}
    >
      <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.18em] text-[#7a8aab]">
        <span>Current Consensus</span>
        <span className="inline-flex items-center gap-1.5 text-emerald-700">
          <LiveDot />
          Live
        </span>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-3">
        <div
          className="text-[22px] leading-tight tracking-tight text-[#0c1733]"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Likely Pathogenic
        </div>
        <div className="text-right">
          <div className="font-mono text-[20px] tabular-nums text-[#0c1733]">
            0.81
          </div>
          <div className="text-[9.5px] uppercase tracking-[0.16em] text-[#7a8aab]">
            Confidence
          </div>
        </div>
      </div>

      <div className="relative mt-4 h-2 w-full rounded-full bg-[linear-gradient(90deg,#cfe9d6_0%,#e7e1b8_50%,#f2c4b8_100%)]">
        {/* Marker */}
        <div
          className="absolute -top-1.5 h-5 w-1 rounded-full bg-[#0c1733] shadow-[0_4px_12px_-2px_rgba(12,23,51,0.55)]"
          style={{ left: `calc(${markerPct}% - 2px)` }}
          aria-hidden
        />
      </div>
      <div className="mt-2 flex justify-between text-[9.5px] font-medium uppercase tracking-[0.18em] text-[#7a8aab]">
        <span>Benign</span>
        <span>Uncertain</span>
        <span>Pathogenic</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Right column — Live Leaderboard
// ─────────────────────────────────────────────────────────────────────────────

function LiveLeaderboard() {
  const sorted = [...AGENT_CARDS].sort((a, b) => b.confidence - a.confidence);

  return (
    <section
      aria-label="Live leaderboard"
      className="rounded-2xl border border-[#dde6f3] bg-white/90 p-4 shadow-[0_18px_44px_-26px_rgba(20,46,133,0.32),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#0c1733]">
          <LineChart className="size-3.5 text-[#1f47b8]" strokeWidth={1.75} />
          Live Leaderboard
        </div>
        <Link
          href="#leaderboard"
          className="text-[11px] font-medium text-[#1f47b8] hover:text-[#0c1733]"
        >
          View all
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-[1.5rem_1fr_auto] gap-x-3 gap-y-2 text-[10.5px] uppercase tracking-[0.14em] text-[#7a8aab]">
        <span>Rank</span>
        <span>Model</span>
        <span className="text-right">Score</span>
      </div>
      <div className="mt-1 divide-y divide-[#e9eff8]">
        {sorted.map((card, idx) => {
          const tint = verdictTint(card.verdict);
          return (
            <div
              key={card.name}
              className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-x-3 py-2 text-[12px]"
            >
              <span className="font-mono tabular-nums text-[#7a8aab]">
                {idx + 1}
              </span>
              <span className="flex items-center gap-2 truncate">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ background: tint.spark }}
                />
                <span className="truncate font-medium text-[#0c1733]">
                  {card.name}
                </span>
              </span>
              <span className="font-mono tabular-nums text-[#0c1733]">
                {card.confidence.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#e9eff8] pt-3 text-[10.5px] text-[#7a8aab]">
        <span>Scores update in real time</span>
        <span className="inline-flex items-center gap-1.5 font-medium uppercase tracking-[0.16em] text-emerald-700">
          <LiveDot />
          Live
        </span>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Right column — Evidence at a Glance
// ─────────────────────────────────────────────────────────────────────────────

function EvidenceAtGlance() {
  return (
    <section
      aria-label="Evidence at a glance"
      className="rounded-2xl border border-[#dde6f3] bg-white/90 p-4 shadow-[0_18px_44px_-26px_rgba(20,46,133,0.32),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#0c1733]">
          <Microscope className="size-3.5 text-[#1f47b8]" strokeWidth={1.75} />
          Evidence at a Glance
        </div>
        <Link
          href="#evidence"
          className="text-[11px] font-medium text-[#1f47b8] hover:text-[#0c1733]"
        >
          View all
        </Link>
      </div>

      <ul className="mt-3 divide-y divide-[#e9eff8]">
        {EVIDENCE_ROWS.map((row) => {
          const Icon = row.icon;
          return (
            <li
              key={row.label}
              className="grid grid-cols-[1.6rem_1fr_auto] items-center gap-x-3 py-2.5"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#eef3fb] text-[#1f47b8]">
                <Icon className="size-3.5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-medium text-[#0c1733]">
                  {row.label}
                </div>
                <div className="truncate text-[10.5px] text-[#6a7a99]">
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

// ─────────────────────────────────────────────────────────────────────────────
// Trust strip
// ─────────────────────────────────────────────────────────────────────────────

function TrustStrip() {
  return (
    <section className="border-y border-[#e3eaf4] bg-white/60 py-7 backdrop-blur-sm">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="text-center text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#7a8aab]">
          Trusted by leading research and clinical institutions
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {INSTITUTIONS.map((name) => (
            <div
              key={name}
              className="inline-flex items-center gap-2 text-[12.5px] font-medium tracking-tight text-[#5b6c8a] opacity-90"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#9bb1d3]" />
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// "A new standard" — features + reasoning trace
// ─────────────────────────────────────────────────────────────────────────────

function StandardSection() {
  return (
    <section
      id="platform"
      className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10 lg:py-24"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2
          className="text-[40px] leading-[1.04] tracking-[-0.015em] text-[#0c1733] lg:text-[44px]"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          A new standard for genomic AI evaluation
        </h2>
        <p className="mt-5 text-[14.5px] leading-relaxed text-[#4d5d80]">
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
              className="group rounded-2xl border border-[#e2eaf6] bg-white p-6 transition-shadow hover:shadow-[0_28px_60px_-30px_rgba(20,46,133,0.28)]"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(160deg,#eaf1fc,#dde8f9)] text-[#1f47b8]">
                <Icon className="size-4" strokeWidth={1.6} />
              </span>
              <h3 className="mt-5 text-[15.5px] font-medium tracking-tight text-[#0c1733]">
                {feature.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[#4d5d80]">
                {feature.body}
              </p>
              <Link
                href="#learn"
                className="mt-5 inline-flex items-center gap-1 text-[12.5px] font-medium text-[#1f47b8] transition-colors group-hover:text-[#0c1733]"
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
  return (
    <section
      id="reasoning"
      className="mt-14 grid gap-8 rounded-3xl border border-[#dde6f3] bg-white/85 p-6 backdrop-blur-sm lg:grid-cols-[1.05fr_1fr] lg:p-10"
    >
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#dde6f3] bg-white px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.18em] text-[#5b6c8a]">
          <Microscope className="size-3 text-[#1f47b8]" strokeWidth={1.75} />
          AI Reasoning, audit-grade
        </div>
        <h3
          className="mt-5 text-[30px] leading-[1.08] tracking-[-0.01em] text-[#0c1733]"
          style={{ fontFamily: "var(--font-instrument-serif)" }}
        >
          Every prediction comes with its work shown.
        </h3>
        <p className="mt-4 max-w-prose text-[13.5px] leading-relaxed text-[#4d5d80]">
          Each model output is paired with a structured reasoning trace —
          mapped to ACMG/AMP evidence categories — so clinical reviewers can
          interrogate the logic, not just the verdict.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3 text-[11.5px]">
          <Stat label="Avg trace length" value="12 steps" />
          <Stat label="Evidence types" value="9 categories" />
          <Stat label="Auditor agreement" value="94.6%" />
        </div>
      </div>

      <div className="rounded-2xl border border-[#dde6f3] bg-[#f4f7fc] p-5">
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-medium tracking-tight text-[#0c1733]">
            Reasoning Trace
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.16em] text-[#1f47b8]">
            AlphaGenome
          </div>
        </div>

        <ol className="mt-4 divide-y divide-[#dde6f3]">
          {REASONING_STEPS.map((step, idx) => (
            <li key={step.title} className="grid grid-cols-[1.4rem_1fr] gap-3 py-3">
              <span className="font-mono text-[11px] tabular-nums text-[#7a8aab]">
                0{idx + 1}
              </span>
              <div>
                <div className="text-[11.5px] font-medium tracking-tight text-[#0c1733]">
                  {step.title}
                </div>
                <div className="mt-0.5 font-mono text-[11.5px] leading-relaxed text-[#3a4a6b]">
                  {step.detail}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex items-center justify-between border-t border-[#dde6f3] pt-3 text-[11px] text-[#5b6c8a]">
          <span>Mapped to ACMG/AMP PVS1, PM2, PP3</span>
          <Link
            href="#trace"
            className="inline-flex items-center gap-1 font-medium text-[#1f47b8] hover:text-[#0c1733]"
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
    <div className="rounded-xl border border-[#dde6f3] bg-white px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-[#7a8aab]">
        {label}
      </div>
      <div className="mt-1 text-[14px] font-medium text-[#0c1733]">{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dark navy preview — "From research to report"
// ─────────────────────────────────────────────────────────────────────────────

function ReportPreview() {
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
              Powering better decisions in genomics
            </span>
            <h2
              className="mt-5 text-[44px] leading-[1.04] tracking-[-0.01em] lg:text-[52px]"
              style={{ fontFamily: "var(--font-instrument-serif)" }}
            >
              From research to report.
            </h2>
            <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-white/70">
              The same evidence stack that powers the public arena feeds your
              clinical dashboards, cohort analytics, and ACMG-aligned variant
              reports — without an export step.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="#request"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-[#0c1733] shadow-[0_18px_36px_-18px_rgba(10,23,51,0.7)] transition-transform active:translate-y-px"
              >
                Request access
                <ArrowUpRight className="size-3.5" strokeWidth={2} aria-hidden />
              </Link>
              <Link
                href="#preview"
                className="inline-flex items-center rounded-full border border-white/20 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-white/8"
              >
                See the report builder
              </Link>
            </div>
          </div>

          <DashboardPeek />
        </div>
      </div>
    </section>
  );
}

function DashboardPeek() {
  return (
    <div className="relative">
      {/* Tab bar */}
      <div className="flex items-center gap-1 text-[10.5px] text-white/70">
        <span className="rounded-md bg-white/8 px-2.5 py-1 font-medium text-white">
          Cohort Performance
        </span>
        <span className="rounded-md px-2.5 py-1">Model Calibration</span>
        <span className="rounded-md px-2.5 py-1">Interpretation Alignment (ACMG)</span>
        <span className="ml-auto rounded-md border border-white/15 px-2 py-1">+</span>
      </div>

      {/* Three peeking dashboard tiles */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <PeekTile
          label="Cohort Accuracy"
          metric="91.4%"
          delta="+1.8 pts vs last run"
          spark={[0.42, 0.5, 0.55, 0.62, 0.7, 0.76, 0.83, 0.88, 0.91]}
        />
        <PeekTile
          label="Model Calibration"
          metric="3.81"
          delta="Brier · lower is better"
          spark={[0.7, 0.66, 0.6, 0.55, 0.5, 0.46, 0.42, 0.4, 0.38]}
          color="#9bd6ff"
        />
        <PeekTile
          label="ACMG Alignment"
          metric="86.2%"
          delta="vs expert panel · 247 variants"
          spark={[0.5, 0.55, 0.62, 0.66, 0.72, 0.77, 0.82, 0.84, 0.86]}
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
