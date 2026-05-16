import { notFound } from "next/navigation";
import { getRound } from "@/lib/api";
import { TraceCard } from "@/components/trace-card";
import { Badge } from "@/components/ui/badge";
import {
  AGENT_NAMES,
  CLASSIFICATION_LABEL,
  type Classification,
} from "@/lib/types";
import { AutoRefresh } from "@/components/auto-refresh";

interface PageProps {
  params: Promise<{ id: string }>;
}

const CLINVAR_TO_CODE: Record<string, Classification> = {
  Pathogenic: "P",
  Likely_pathogenic: "LP",
  Uncertain_significance: "VUS",
  Likely_benign: "LB",
  Benign: "B",
};

function EvidenceCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
        {label}
      </span>
      <div className="font-mono text-xs leading-relaxed text-foreground/85">
        {children}
      </div>
    </div>
  );
}

export default async function RoundPage({ params }: PageProps) {
  const { id } = await params;
  const round = await getRound(decodeURIComponent(id));
  if (!round) notFound();

  const truthCode = CLINVAR_TO_CODE[round.truth.classification] ?? "VUS";

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <AutoRefresh />

      {/* Editorial header: eyebrow → gene display → mono HGVS subhead → chips. */}
      <header className="mb-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
          round · {round.round_id}
        </div>
        <h1 className="mt-2 font-display text-[64px] leading-[0.95] tracking-[-0.02em] text-foreground sm:text-[88px]">
          {round.variant.gene}
        </h1>
        <p className="mt-3 font-mono text-sm text-foreground/65 break-all">
          {round.variant.hgvs_c}
          {round.variant.hgvs_p ? ` · ${round.variant.hgvs_p}` : ""}
          {" · "}chr{round.variant.chrom}:{round.variant.pos}{" "}
          {round.variant.ref}
          {">"}
          {round.variant.alt}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
            {round.variant.consequence}
          </Badge>
          {round.variant._difficulty && (
            <Badge
              variant={round.variant._difficulty === "hard" ? "destructive" : "outline"}
              className="font-mono text-[10px] uppercase tracking-wider"
            >
              {round.variant._difficulty}
            </Badge>
          )}
          <Badge className="font-mono text-[10px] uppercase tracking-wider">
            truth · {CLASSIFICATION_LABEL[truthCode]}
          </Badge>
        </div>
      </header>

      {/* Evidence as a data strip — divider lines and rhythm, no card box. */}
      <div className="mb-12 border-y border-border/60 py-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-tight">
            Evidence shown to the agents
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45">
            identical pack · five strategies
          </span>
        </div>
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-3">
          <EvidenceCell label="gnomAD">
            AF popmax {round.variant.gnomad.af_popmax ?? "—"}
            <br />
            AC {round.variant.gnomad.ac}/{round.variant.gnomad.an} · hom{" "}
            {round.variant.gnomad.hom}
          </EvidenceCell>
          <EvidenceCell label="In-silico">
            REVEL {round.variant.insilico.revel ?? "—"} · CADD{" "}
            {round.variant.insilico.cadd_phred ?? "—"}
            <br />
            AlphaMissense {round.variant.insilico.alphamissense ?? "—"} · SpliceAI{" "}
            {round.variant.insilico.spliceai_max ?? "—"}
          </EvidenceCell>
          <EvidenceCell label="Functional">
            {round.variant.mavedb_function
              ? `${round.variant.mavedb_function.category} (score ${round.variant.mavedb_function.score})`
              : "none recorded"}
          </EvidenceCell>
        </div>
      </div>

      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Reasoning traces</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/45">
          five verdicts · identical evidence
        </span>
      </div>
      {/* 3+2 at xl (1280–1535), 5 across only at 2xl (≥1536) so cards breathe. */}
      <div
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
        style={{ ["--row-index" as never]: 0 }}
      >
        {AGENT_NAMES.map((agent, i) => {
          const prediction = round.predictions[agent];
          const score = round.scores[agent];
          return (
            <div
              key={agent}
              className="pathos-row-in"
              style={{ ["--row-index" as never]: i }}
            >
              <TraceCard
                agent={agent}
                prediction={prediction}
                score={score}
                truthCode={truthCode}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
