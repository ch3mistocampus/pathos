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

interface Props {
  agent: AgentName;
  tagline: string;
  philosophy: string;
  procedure: string[];
  history?: HistoryEntry[];
}

export function StrategyCard({
  agent,
  tagline,
  philosophy,
  procedure,
  history,
}: Props) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="font-mono text-xs text-foreground/50">{agent}</div>
        <CardTitle className="text-xl">{AGENT_LABEL[agent]}</CardTitle>
        <CardDescription className="text-base leading-snug text-foreground/85">
          {tagline}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-sm leading-relaxed text-foreground/70">{philosophy}</p>

        <Separator />

        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-foreground/50">
            Procedure
          </div>
          <ol className="mt-2 space-y-2 text-sm leading-relaxed text-foreground/70">
            {procedure.map((step, index) => (
              <li key={step} className="grid grid-cols-[2rem_1fr] gap-2">
                <span className="font-mono text-foreground/50">
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
              <div className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                Confusion (truth vs prediction)
              </div>
              <ConfusionMatrix history={history} className="mt-2" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
