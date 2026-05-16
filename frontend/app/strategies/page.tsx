import { StrategyCard } from "@/components/strategy-card";
import { AGENT_NAMES } from "@/lib/types";
import { STRATEGY_DEFINITIONS } from "@/lib/mock-data";
import { getLeaderboard } from "@/lib/api";

export default async function StrategiesPage() {
  const leaderboard = await getLeaderboard();
  const historyByAgent = Object.fromEntries(
    leaderboard.map((entry) => [entry.agent, entry.history]),
  );

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">The five strategies</h1>
        <p className="mt-2 max-w-3xl text-sm text-foreground/70">
          Same model. Same evidence pack. Different system prompts. Each agent
          applies a distinct interpretive philosophy. Differences in leaderboard
          performance isolate the effect of strategy, not capability.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {AGENT_NAMES.map((agent) => (
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

      <p className="mt-10 text-sm text-foreground/60">
        Procedure blocks mirror the Python strategy prefixes; the authoritative
        system prompt also appends a shared ACMG/AMP JSON reference (
        <code className="font-mono">ACMG_REFERENCE</code> in{" "}
        <code className="font-mono">functions/agents/prompts.py</code>). Confusion
        matrices are computed live from each agent&apos;s round history.
      </p>
    </section>
  );
}
