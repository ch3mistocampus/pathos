"use client";

import { useMemo, useState } from "react";
import { LeaderboardTable, type LeaderboardSortKey } from "@/components/leaderboard-table";
import { EmaChart } from "@/components/ema-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AGENT_LABEL, type AgentName, type LeaderboardEntry } from "@/lib/types";

interface Props {
  entries: LeaderboardEntry[];
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
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Standings</CardTitle>
          <p className="text-xs text-foreground/60">
            Click an agent to isolate its EMA trace. Click again to reset.
          </p>
        </CardHeader>
        <CardContent>
          <LeaderboardTable
            entries={sortedEntries}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={handleSort}
            leaderAgent={leaderAgent}
            chartFocusedAgent={focusedAgent}
            onAgentChartToggle={toggleAgentChart}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score history</CardTitle>
        </CardHeader>
        <CardContent>
          <EmaChart entries={entries} focusedAgent={focusedAgent} />
        </CardContent>
      </Card>
    </div>
  );
}
