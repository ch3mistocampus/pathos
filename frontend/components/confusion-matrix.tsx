import { CLASSIFICATION_LABEL, type Classification, type HistoryEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const CLASSES: Classification[] = ["P", "LP", "VUS", "LB", "B"];

interface Props {
  history: HistoryEntry[];
  className?: string;
}

/**
 * 5x5 ACMG confusion matrix.
 * Rows = truth, columns = predicted. Diagonal = correct.
 *
 * Color encoding:
 *   - Diagonal cells: emerald accent, opacity scales with cell count.
 *   - Off-diagonal: destructive red, opacity scales with BOTH cell count and
 *     |truth - pred| distance. P→B (severity 4) reads materially darker than
 *     P→LP (severity 1) at the same count, which is the diagnostic story we
 *     want a reader to see at a glance.
 */
export function ConfusionMatrix({ history, className }: Props) {
  const counts = buildCounts(history);
  const total = history.length;
  const max = Math.max(1, ...counts.flat());
  const diagonal = CLASSES.reduce(
    (sum, _, idx) => sum + counts[idx][idx],
    0,
  );
  const accuracy = total > 0 ? diagonal / total : 0;
  const maxDistance = CLASSES.length - 1; // P ↔ B distance

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex items-baseline justify-between text-[11px] text-foreground/55">
        <span className="font-mono uppercase tracking-wider">truth ↓ · pred →</span>
        <span className="font-mono">
          acc{" "}
          <span className="tabular-nums text-foreground">
            {(accuracy * 100).toFixed(0)}%
          </span>
          <span className="ml-2 text-foreground/45">n={total}</span>
        </span>
      </div>

      <div
        role="table"
        aria-label="Confusion matrix: truth rows by predicted columns"
        className="grid gap-px overflow-hidden rounded-lg border border-border/50 bg-border/45"
        style={{ gridTemplateColumns: `auto repeat(${CLASSES.length}, minmax(0,1fr))` }}
      >
        <div className="bg-background/85" role="presentation" />
        {CLASSES.map((c) => (
          <div
            key={`head-${c}`}
            role="columnheader"
            className="bg-background/85 px-1 py-1 text-center font-mono text-[10px] uppercase tracking-wider text-foreground/55"
          >
            {c}
          </div>
        ))}

        {CLASSES.map((truth, rowIdx) => (
          <div key={`row-${truth}`} className="contents">
            <div
              role="rowheader"
              className="bg-background/85 px-1.5 py-1 text-left font-mono text-[10px] uppercase tracking-wider text-foreground/55"
              title={CLASSIFICATION_LABEL[truth]}
            >
              {truth}
            </div>
            {CLASSES.map((pred, colIdx) => {
              const value = counts[rowIdx][colIdx];
              const isDiagonal = rowIdx === colIdx;
              const distance = Math.abs(rowIdx - colIdx);
              const severity = maxDistance > 0 ? distance / maxDistance : 0; // 0..1
              const countWeight = value === 0 ? 0 : Math.max(0.12, value / max);
              const background = isDiagonal
                ? `color-mix(in oklch, var(--primary) ${Math.round(countWeight * 70)}%, transparent)`
                : `color-mix(in oklch, var(--destructive) ${Math.round(countWeight * (35 + severity * 50))}%, transparent)`;
              return (
                <div
                  key={`cell-${truth}-${pred}`}
                  role="cell"
                  title={`${CLASSIFICATION_LABEL[truth]} → ${CLASSIFICATION_LABEL[pred]}: ${value} (severity ${distance})`}
                  className={cn(
                    "flex aspect-square items-center justify-center bg-background text-center font-mono text-[11px] tabular-nums transition-colors",
                    value === 0 ? "text-foreground/30" : "text-foreground/90",
                    isDiagonal && value > 0 && "font-semibold",
                  )}
                  style={value === 0 ? undefined : { background }}
                >
                  {value}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-foreground/45">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block size-2 rounded-sm"
            style={{ background: "color-mix(in oklch, var(--primary) 60%, transparent)" }}
          />
          correct
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block size-2 rounded-sm"
            style={{ background: "color-mix(in oklch, var(--destructive) 30%, transparent)" }}
          />
          mild error
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block size-2 rounded-sm"
            style={{ background: "color-mix(in oklch, var(--destructive) 80%, transparent)" }}
          />
          severe
        </span>
      </div>
    </div>
  );
}

function buildCounts(history: HistoryEntry[]): number[][] {
  const matrix = CLASSES.map(() => CLASSES.map(() => 0));
  for (const h of history) {
    const row = CLASSES.indexOf(h.truth);
    const col = CLASSES.indexOf(h.predicted);
    if (row < 0 || col < 0) continue;
    matrix[row][col] += 1;
  }
  return matrix;
}
