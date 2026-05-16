"use client";

import { useMemo, useState } from "react";
import {
  LeaderboardTable,
  type LeaderboardSortKey,
} from "@/components/leaderboard-table";
import { EmaChart } from "@/components/ema-chart";
import { AGENT_LABEL, type AgentName, type LeaderboardEntry } from "@/lib/types";

interface Props {
  entries: LeaderboardEntry[];
}

/** Eyebrow + heading. Replaces shadcn CardHeader without re-introducing card chrome. */
function PanelHeader({
  eyebrow,
  title,
  hint,
}: {
  eyebrow: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/45">
        {eyebrow}
      </span>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {hint && (
          <p className="text-xs text-foreground/55">{hint}</p>
        )}
      </div>
    </div>
  );
}

export function LeaderboardDashboard({ entries }: Props) {
  const [sortKey, setSortKey] = useState<LeaderboardSortKey>("ema");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [focusedAgent, setFocusedAgent] = useState<AgentName | null>(null);

  const leaderAgent = useMemo(() => {
    return [...entries].sort((a, b) => b.ema - a.ema)[0]?.agent ?? null;
  }, [entries]);

  const sortedEntries = useMemo(() => {
    const list = [...entries];
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      if (sortKey === "agent") {
        return a.agent.localeCompare(b.agent) * dir;
      }
      if (sortKey === "ema") {
        return (a.ema - b.ema) * dir;
      }
      return (a.rounds - b.rounds) * dir;
    });
    return list;
  }, [entries, sortKey, sortDir]);

  const handleSort = (key: LeaderboardSortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "agent" ? "asc" : "desc");
  };

  const toggleAgentChart = (agent: AgentName) => {
    setFocusedAgent((cur) => (cur === agent ? null : agent));
  };

  const announcement = focusedAgent
    ? `Chart isolated to ${AGENT_LABEL[focusedAgent]}.`
    : "Showing all five strategies in the chart.";

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <section className="flex flex-col gap-5">
        <PanelHeader
          eyebrow="Standings"
          title="Strategy rankings"
          hint="Click any agent to isolate its trace"
        />
        <div className="border-t border-border/60 pt-2">
          <LeaderboardTable
            entries={sortedEntries}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            leaderAgent={leaderAgent}
            chartFocusedAgent={focusedAgent}
            onAgentChartToggle={toggleAgentChart}
          />
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <PanelHeader
          eyebrow="History"
          title="EMA score over rounds"
          hint={focusedAgent ? `isolated · ${AGENT_LABEL[focusedAgent]}` : "α = 0.10"}
        />
        <div className="border-t border-border/60 pt-4">
          <EmaChart entries={entries} focusedAgent={focusedAgent} />
        </div>
      </section>
    </div>
  );
}
