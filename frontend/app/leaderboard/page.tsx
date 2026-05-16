import { getLeaderboard, getRecentRounds } from "@/lib/api";
import { LeaderboardDashboard } from "@/components/leaderboard-dashboard";
import { AutoRefresh } from "@/components/auto-refresh";
import Link from "next/link";
import { AGENT_LABEL, CLASSIFICATION_LABEL } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export default async function LeaderboardPage() {
  const [leaderboard, recent] = await Promise.all([
    getLeaderboard(),
    getRecentRounds(10),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Live arena · five strategies
        </div>
        <h1 className="mt-2 font-display text-[44px] leading-[1.04] tracking-[-0.015em] text-foreground sm:text-[52px]">
          Leaderboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          EMA-smoothed score across all rounds. Higher is better; perfect is 1.0.
          Click any agent to isolate its trace.
        </p>
      </header>

      <AutoRefresh />
      <LeaderboardDashboard entries={leaderboard} />

      <div className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Recent rounds</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((r) => (
            <Link
              key={r.round_id}
              href={`/round/${encodeURIComponent(r.round_id)}`}
              className="rounded-lg border border-border/60 p-4 transition-colors hover:bg-accent/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-xs text-foreground/50">
                    {r.round_id}
                  </div>
                  <div className="mt-1 break-words font-medium leading-snug">
                    {r.variant_id}
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0 self-start">
                  truth: {CLASSIFICATION_LABEL[r.truth_classification]}
                </Badge>
              </div>
              <div className="mt-3 text-xs text-foreground/60">
                Top: <span className="font-medium text-foreground/80">{AGENT_LABEL[r.top_agent]}</span>
                {" · "}
                score {r.top_score.toFixed(3)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
