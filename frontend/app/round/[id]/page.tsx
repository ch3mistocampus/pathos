import { notFound } from "next/navigation";
import { getRound } from "@/lib/api";
import { TraceCard } from "@/components/trace-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default async function RoundPage({ params }: PageProps) {
  const { id } = await params;
  const round = await getRound(decodeURIComponent(id));
  if (!round) notFound();

  const truthCode = CLINVAR_TO_CODE[round.truth.classification] ?? "VUS";

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <AutoRefresh />
      <header className="mb-8">
        <div className="font-mono text-xs text-foreground/50">{round.round_id}</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {round.variant.variant_id}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{round.variant.gene}</Badge>
          <Badge variant="outline">{round.variant.consequence}</Badge>
          {round.variant._difficulty && (
            <Badge variant={round.variant._difficulty === "hard" ? "destructive" : "outline"}>
              {round.variant._difficulty}
            </Badge>
          )}
          <Badge>truth: {CLASSIFICATION_LABEL[truthCode]}</Badge>
        </div>
      </header>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Evidence shown to the agents</CardTitle>
          <CardDescription>
            HGVS {round.variant.hgvs_c}
            {round.variant.hgvs_p ? ` · ${round.variant.hgvs_p}` : ""}
            {" · "}chr{round.variant.chrom}:{round.variant.pos} {round.variant.ref}{">"}{round.variant.alt}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-foreground/50">gnomAD</div>
              <div className="mt-1 font-mono text-xs">
                AF popmax {round.variant.gnomad.af_popmax ?? "—"}
                {" · "}AC {round.variant.gnomad.ac}/{round.variant.gnomad.an}
                {" · "}hom {round.variant.gnomad.hom}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-foreground/50">In-silico</div>
              <div className="mt-1 font-mono text-xs">
                REVEL {round.variant.insilico.revel ?? "—"}
                {" · "}CADD {round.variant.insilico.cadd_phred ?? "—"}
                {" · "}AlphaMissense {round.variant.insilico.alphamissense ?? "—"}
                {" · "}SpliceAI {round.variant.insilico.spliceai_max ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-foreground/50">Functional</div>
              <div className="mt-1 font-mono text-xs">
                {round.variant.mavedb_function
                  ? `${round.variant.mavedb_function.category} (score ${round.variant.mavedb_function.score})`
                  : "none"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-xl font-semibold tracking-tight">Reasoning traces</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {AGENT_NAMES.map((agent) => {
          const prediction = round.predictions[agent];
          const score = round.scores[agent];
          return (
            <TraceCard
              key={agent}
              agent={agent}
              prediction={prediction}
              score={score}
              truthCode={truthCode}
            />
          );
        })}
      </div>
    </section>
  );
}
