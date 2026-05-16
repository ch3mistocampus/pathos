"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AGENT_LABEL, type AgentName, type LeaderboardEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";

export type LeaderboardSortKey = "agent" | "ema" | "rounds";

interface Props {
  entries: LeaderboardEntry[];
  sortKey: LeaderboardSortKey;
  sortDir: "asc" | "desc";
  onSort: (key: LeaderboardSortKey) => void;
  leaderAgent: AgentName | null;
  chartFocusedAgent: AgentName | null;
  onAgentChartToggle: (agent: AgentName) => void;
}

function SortGlyph({
  active,
  dir,
}: {
  active: boolean;
  dir: "asc" | "desc";
}) {
  if (!active) {
    return <ArrowUpDown className="ml-1 size-3.5 opacity-40" aria-hidden />;
  }
  return dir === "asc" ? (
    <ArrowUp className="ml-1 size-3.5" aria-hidden />
  ) : (
    <ArrowDown className="ml-1 size-3.5" aria-hidden />
  );
}

function ariaSort(active: boolean, dir: "asc" | "desc") {
  if (!active) return "none";
  return dir === "asc" ? "ascending" : "descending";
}

function sortLabel(key: LeaderboardSortKey, active: boolean, dir: "asc" | "desc") {
  if (!active) return `Sort by ${key}`;
  const next = dir === "asc" ? "descending" : "ascending";
  return `Currently sorted ${dir === "asc" ? "ascending" : "descending"}. Activate to sort ${next}.`;
}

export function LeaderboardTable({
  entries,
  sortKey,
  sortDir,
  onSort,
  leaderAgent,
  chartFocusedAgent,
  onAgentChartToggle,
}: Props) {
  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden md:block">
        <Table>
          <caption className="sr-only">
            Leaderboard of five Claude variant-interpretation strategies, sorted by{" "}
            {sortKey} {sortDir === "asc" ? "ascending" : "descending"}.
          </caption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead aria-sort={ariaSort(sortKey === "agent", sortDir)}>
                <button
                  type="button"
                  onClick={() => onSort("agent")}
                  aria-label={sortLabel("agent", sortKey === "agent", sortDir)}
                  className="inline-flex items-center font-medium text-foreground hover:text-foreground/80"
                >
                  Agent
                  <SortGlyph active={sortKey === "agent"} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead
                className="text-right"
                aria-sort={ariaSort(sortKey === "ema", sortDir)}
              >
                <button
                  type="button"
                  onClick={() => onSort("ema")}
                  aria-label={sortLabel("ema", sortKey === "ema", sortDir)}
                  className="ml-auto inline-flex items-center font-medium text-foreground hover:text-foreground/80"
                >
                  EMA
                  <SortGlyph active={sortKey === "ema"} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead
                className="text-right"
                aria-sort={ariaSort(sortKey === "rounds", sortDir)}
              >
                <button
                  type="button"
                  onClick={() => onSort("rounds")}
                  aria-label={sortLabel("rounds", sortKey === "rounds", sortDir)}
                  className="ml-auto inline-flex items-center font-medium text-foreground hover:text-foreground/80"
                >
                  Rounds
                  <SortGlyph active={sortKey === "rounds"} dir={sortDir} />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, idx) => {
              const isLeader =
                leaderAgent != null && entry.agent === leaderAgent;
              const isChartFocus =
                chartFocusedAgent != null && entry.agent === chartFocusedAgent;
              return (
                <TableRow
                  key={entry.agent}
                  className={cn(
                    isLeader && "bg-primary/5 ring-1 ring-inset ring-primary/25",
                    chartFocusedAgent &&
                      !isChartFocus &&
                      "opacity-45 transition-opacity",
                  )}
                >
                  <TableCell className="font-mono text-xs text-foreground/50">
                    {idx + 1}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onAgentChartToggle(entry.agent)}
                      aria-pressed={isChartFocus}
                      aria-label={
                        isChartFocus
                          ? `Hide isolated trace for ${AGENT_LABEL[entry.agent]}`
                          : `Isolate EMA trace for ${AGENT_LABEL[entry.agent]}`
                      }
                      className={cn(
                        "w-full rounded-md text-left transition-colors",
                        "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        "-mx-2 -my-1 px-2 py-1",
                        isChartFocus && "bg-accent/40",
                      )}
                    >
                      <div className="font-medium">
                        {AGENT_LABEL[entry.agent]}
                      </div>
                      <div className="font-mono text-xs text-foreground/50">
                        {entry.agent}
                      </div>
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={isLeader ? "default" : "secondary"}
                      className="font-mono"
                    >
                      <AnimatedNumber value={entry.ema} decimals={3} />
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-foreground/70">
                    <AnimatedNumber value={entry.rounds} decimals={0} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card stack */}
      <div className="space-y-3 md:hidden">
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-foreground/55">
          <span>Sort:</span>
          {(["ema", "agent", "rounds"] as const).map((key) => {
            const active = sortKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSort(key)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
                  active
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border/60 bg-background text-foreground/65 hover:text-foreground",
                )}
              >
                {key}
                <SortGlyph active={active} dir={sortDir} />
              </button>
            );
          })}
        </div>

        <ul className="space-y-2">
          {entries.map((entry, idx) => {
            const isLeader = leaderAgent != null && entry.agent === leaderAgent;
            const isChartFocus =
              chartFocusedAgent != null && entry.agent === chartFocusedAgent;
            return (
              <li key={entry.agent}>
                <button
                  type="button"
                  onClick={() => onAgentChartToggle(entry.agent)}
                  aria-pressed={isChartFocus}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors",
                    "hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isLeader
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/60 bg-background",
                    chartFocusedAgent && !isChartFocus && "opacity-50",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-xs text-foreground/50">
                        {idx + 1}.
                      </span>
                      <span className="font-medium">{AGENT_LABEL[entry.agent]}</span>
                    </div>
                    <Badge
                      variant={isLeader ? "default" : "secondary"}
                      className="font-mono"
                    >
                      <AnimatedNumber value={entry.ema} decimals={3} />
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-foreground/55">
                    <span className="font-mono">{entry.agent}</span>
                    <span>
                      <AnimatedNumber value={entry.rounds} decimals={0} /> rounds
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
