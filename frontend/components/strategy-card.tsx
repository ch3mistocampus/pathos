import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConfusionMatrix } from "@/components/confusion-matrix";
import { AGENT_LABEL, type AgentName, type HistoryEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  agent: AgentName;
  tagline: string;
  philosophy: string;
  procedure: string[];
  history?: HistoryEntry[];
  featured?: boolean;
}

export function StrategyCard({
  agent,
  tagline,
  philosophy,
  procedure,
  history,
  featured,
}: Props) {
  if (featured) {
    return (
      <Card className="flex flex-col gap-6 pathos-shadow ring-primary/30">
        <CardHeader className="gap-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
            {agent}
          </div>
          <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {AGENT_LABEL[agent]}
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-snug text-foreground/85">
            {tagline}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            <p className="text-sm leading-relaxed text-foreground/70">
              {philosophy}
            </p>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
                Procedure
              </div>
              <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-foreground/75">
                {procedure.map((step, index) => (
                  <li key={step} className="grid grid-cols-[2.25rem_1fr] gap-2">
                    <span className="font-mono text-foreground/45">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {history && history.length > 0 && (
            <div className="flex flex-col gap-3 md:border-l md:border-border/50 md:pl-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
                Confusion · truth vs prediction
              </div>
              <ConfusionMatrix history={history} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("flex flex-col")}>
      <CardHeader>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
          {agent}
        </div>
        <CardTitle className="text-xl">{AGENT_LABEL[agent]}</CardTitle>
        <CardDescription className="text-base leading-snug text-foreground/85">
          {tagline}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-sm leading-relaxed text-foreground/70">{philosophy}</p>

        <Separator />

        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
            Procedure
          </div>
          <ol className="mt-2 space-y-2 text-sm leading-relaxed text-foreground/70">
            {procedure.map((step, index) => (
              <li key={step} className="grid grid-cols-[2rem_1fr] gap-2">
                <span className="font-mono text-foreground/45">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {history && history.length > 0 && (
          <>
            <Separator />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
                Confusion · truth vs prediction
              </div>
              <ConfusionMatrix history={history} className="mt-2" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
