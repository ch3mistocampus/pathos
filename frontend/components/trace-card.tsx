import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AGENT_LABEL,
  CLASSIFICATION_LABEL,
  type AgentName,
  type AgentPrediction,
  type AgentScore,
  type Classification,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  agent: AgentName;
  prediction?: AgentPrediction;
  score?: AgentScore;
  truthCode: Classification;
}

export function TraceCard({ agent, prediction, score, truthCode }: Props) {
  if (!prediction) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="text-sm">{AGENT_LABEL[agent]}</CardTitle>
          <CardDescription className="text-xs">no submission</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const match = prediction.classification === truthCode;

  return (
    <Card
      className={cn(
        "flex flex-col transition-shadow",
        match && "ring-1 ring-inset ring-primary/20",
        !match && "ring-1 ring-destructive/35 dark:ring-destructive/55",
      )}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm">{AGENT_LABEL[agent]}</CardTitle>
            <CardDescription className="font-mono text-xs">{agent}</CardDescription>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge variant={match ? "default" : "destructive"} className="font-mono">
              predicted {prediction.classification}
            </Badge>
            <Badge variant="outline" className="font-mono text-[10px]">
              truth {truthCode}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={match ? "secondary" : "outline"}
            className="text-[10px] font-normal text-foreground/80"
          >
            {CLASSIFICATION_LABEL[prediction.classification]}
            {" ↔ "}
            {CLASSIFICATION_LABEL[truthCode]}
          </Badge>
          <Badge
            variant={match ? "outline" : "destructive"}
            className={cn(
              "text-[10px] font-normal uppercase tracking-wide",
              match && "border-primary/40 text-primary",
            )}
          >
            {match ? "matches expert consensus" : "delta vs truth"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 text-xs">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-foreground/50">
            Applied criteria
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {prediction.applied_criteria.length === 0 ? (
              <span className="text-foreground/40">none recorded</span>
            ) : (
              prediction.applied_criteria.map((c) => (
                <span
                  key={c}
                  className="rounded-md border border-border/70 bg-background px-2 py-0.5 font-mono text-[10px] text-foreground/90"
                >
                  {c}
                </span>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium uppercase tracking-wide text-foreground/50">
            Reasoning
          </div>
          <ScrollArea className="mt-2 h-[11.5rem] rounded-md border border-border/40 bg-muted/15">
            <p className="whitespace-pre-wrap px-3 py-2 pb-4 text-[13px] leading-[1.55] text-foreground/90">
              {prediction.reasoning}
            </p>
          </ScrollArea>
        </div>

        {score && (
          <div className="rounded-md border border-border/40 bg-muted/10 p-3 font-mono text-[11px] text-foreground/75">
            <div className="flex justify-between">
              <span>composite score</span>
              <span className={match ? "text-foreground" : "text-destructive/90"}>
                {score.score.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>accuracy</span>
              <span>{score.accuracy.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>criterion match</span>
              <span>{score.criterion_match.toFixed(2)}</span>
            </div>
          </div>
        )}

        {prediction.confidence !== undefined && (
          <div className="text-[11px] text-foreground/50">
            self-reported confidence: {(prediction.confidence * 100).toFixed(0)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}
