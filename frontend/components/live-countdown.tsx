"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * 90-second loop synced to wall clock (every minute*1.5). Visual pulse on the
 * live dot uses the Pass 3 keyframe defined in globals.css; rendering happens
 * once a second so the countdown is the only thing that re-renders.
 */
const ROUND_MS = 90_000;

function secondsLeft(now = Date.now()): number {
  // Anchor to wall clock so different tabs / refreshes agree.
  return Math.max(0, ROUND_MS - (now % ROUND_MS));
}

function fmt(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

export function LiveCountdown({ className }: { className?: string }) {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    setMs(secondsLeft());
    const id = window.setInterval(() => setMs(secondsLeft()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5",
        "text-[11px] font-mono text-foreground/80",
        className,
      )}
      aria-live="off"
    >
      <span
        aria-hidden
        className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"
      >
        <span className="absolute inset-0 animate-pathos-pulse rounded-full bg-primary/60" />
      </span>
      <span className="uppercase tracking-wider text-foreground/55">live</span>
      <span className="tabular-nums text-foreground">
        {ms == null ? "--:--" : fmt(ms)}
      </span>
    </div>
  );
}
