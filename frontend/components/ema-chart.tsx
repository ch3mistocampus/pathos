"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AGENT_LABEL, type AgentName, type LeaderboardEntry } from "@/lib/types";

interface Props {
  entries: LeaderboardEntry[];
  focusedAgent: AgentName | null;
}

// Stable per-strategy palette. Chart-1 is the brand emerald and is reserved for
// functional_first since that's the strategy that tops mock data; keeping this
// mapping stable means strategy identity follows the agent across pages.
const AGENT_COLORS: Record<string, string> = {
  functional_first: "var(--chart-1)", // emerald — brand / typical leader
  strict_rule: "var(--chart-2)",      // slate-blue
  insilico_first: "var(--chart-3)",   // amber
  population_first: "var(--chart-4)", // rose
  conservative: "var(--chart-5)",     // graphite
};

export const PATHOS_AGENT_COLORS = AGENT_COLORS;

type WindowMode = "10" | "50" | "all";

export function EmaChart({ entries, focusedAgent }: Props) {
  const [windowMode, setWindowMode] = useState<WindowMode>("all");

  const maxLength =
    entries.length > 0 ? Math.max(...entries.map((e) => e.history.length)) : 0;

  const fullData = useMemo(() => {
    const rolling: Record<string, number> = {};
    const alpha = 0.1;
    return Array.from({ length: maxLength }, (_, i) => {
      const row: Record<string, number | string> = { round: i + 1 };
      for (const entry of entries) {
        const h = entry.history[i];
        if (h) {
          rolling[entry.agent] =
            (1 - alpha) * (rolling[entry.agent] ?? 0) + alpha * h.score;
          row[entry.agent] = Number(rolling[entry.agent].toFixed(3));
        }
      }
      return row;
    });
  }, [entries, maxLength]);

  const data = useMemo(() => {
    if (windowMode === "all") return fullData;
    const n = windowMode === "10" ? 10 : 50;
    if (fullData.length <= n) return fullData;
    return fullData.slice(-n);
  }, [fullData, windowMode]);

  const visibleEntries = useMemo(() => {
    if (!focusedAgent) return entries;
    return entries.filter((e) => e.agent === focusedAgent);
  }, [entries, focusedAgent]);

  const config: ChartConfig = Object.fromEntries(
    visibleEntries.map((e) => [
      e.agent,
      { label: AGENT_LABEL[e.agent], color: AGENT_COLORS[e.agent] },
    ]),
  );

  const startRound =
    data.length && typeof data[0].round === "number" ? (data[0].round as number) : 1;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs
          value={windowMode}
          onValueChange={(v) => setWindowMode(v as WindowMode)}
          className="w-auto"
        >
          <TabsList className="h-8">
            <TabsTrigger value="10" className="px-2.5 text-xs">
              Last 10
            </TabsTrigger>
            <TabsTrigger value="50" className="px-2.5 text-xs">
              Last 50
            </TabsTrigger>
            <TabsTrigger value="all" className="px-2.5 text-xs">
              All rounds
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-[11px] text-foreground/55">
          {data.length} pts
          {windowMode !== "all" && maxLength > data.length
            ? ` · rounds ${startRound}–${startRound + data.length - 1}`
            : ""}
        </p>
      </div>

      <ChartContainer config={config} className="h-[min(360px,50vh)] w-full">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="round" tickLine={false} axisLine={false} fontSize={11} />
          <YAxis
            domain={[0, 1]}
            tickLine={false}
            axisLine={false}
            fontSize={11}
            width={36}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {visibleEntries.map((e) => (
            <Line
              key={e.agent}
              type="monotone"
              dataKey={e.agent}
              stroke={AGENT_COLORS[e.agent]}
              strokeWidth={focusedAgent ? 2.5 : 1.75}
              dot={false}
              isAnimationActive={false}
              style={{ transition: "stroke-width 300ms cubic-bezier(0.16,1,0.3,1)" }}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
