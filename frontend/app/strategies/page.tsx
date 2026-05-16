import { StrategyCard } from "@/components/strategy-card";
import { AGENT_NAMES, type AgentName } from "@/lib/types";
import { STRATEGY_DEFINITIONS } from "@/lib/mock-data";
import { getLeaderboard } from "@/lib/api";

export default async function StrategiesPage() {
  const leaderboard = await getLeaderboard();
  const historyByAgent = Object.fromEntries(
    leaderboard.map((entry) => [entry.agent, entry.history]),
  );
  const leaderAgent: AgentName =
    [...leaderboard].sort((a, b) => b.ema - a.ema)[0]?.agent ?? AGENT_NAMES[0];
  const leaderEma = leaderboard.find((e) => e.agent === leaderAgent)?.ema;
  const others = AGENT_NAMES.filter((a) => a !== leaderAgent);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-12">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
          Five Claude strategies · one model
        </div>
        <h1 className="mt-2 font-display text-[44px] leading-[1.02] tracking-[-0.015em] text-foreground sm:text-[52px]">
          Five ways to read the same evidence.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-foreground/70">
          Same model. Same evidence pack. Different system prompts. The leader
          rotates over time; differences in performance isolate the effect of
          strategy, not capability.
        </p>
      </header>

      {/* Leader callout — wide, with an emerald hairline at the top. */}
      <div className="mb-6 flex items-center gap-3 border-t-2 border-primary/70 pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          Current leader
        </span>
        {leaderEma != null && (
          <span className="font-mono text-[11px] tabular-nums text-foreground/55">
            ema {leaderEma.toFixed(3)}
          </span>
        )}
      </div>
      <div className="mb-12">
        <StrategyCard
          agent={leaderAgent}
          tagline={STRATEGY_DEFINITIONS[leaderAgent].tagline}
          philosophy={STRATEGY_DEFINITIONS[leaderAgent].philosophy}
          procedure={STRATEGY_DEFINITIONS[leaderAgent].procedure}
          history={historyByAgent[leaderAgent]}
          featured
        />
      </div>

      <div className="mb-6 flex items-center gap-3 border-t border-border/60 pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
          Challengers
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {others.map((agent) => (
          <StrategyCard
            key={agent}
            agent={agent}
            tagline={STRATEGY_DEFINITIONS[agent].tagline}
            philosophy={STRATEGY_DEFINITIONS[agent].philosophy}
            procedure={STRATEGY_DEFINITIONS[agent].procedure}
            history={historyByAgent[agent]}
          />
        ))}
      </div>

      <p className="mt-12 max-w-3xl text-sm leading-relaxed text-foreground/60">
        Procedure blocks mirror the Python strategy prefixes; the authoritative
        system prompt also appends a shared ACMG/AMP JSON reference (
        <code className="font-mono">ACMG_REFERENCE</code> in{" "}
        <code className="font-mono">functions/agents/prompts.py</code>).
        Confusion matrices are computed live from each agent&apos;s round history.
      </p>
    </section>
  );
}
