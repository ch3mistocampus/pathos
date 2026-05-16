import { CLASSIFICATION_LABEL, type Classification, type HistoryEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const CLASSES: Classification[] = ["P", "LP", "VUS", "LB", "B"];

interface Props {
  history: HistoryEntry[];
  className?: string;
}

/**
 * 5x5 ACMG confusion matrix.
 * Rows = truth, columns = predicted. Diagonal counts are correct classifications.
 * Cells are colored by relative frequency within the matrix; diagonal uses the
 * primary accent, off-diagonal uses the destructive accent.
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

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between text-[11px] text-foreground/55">
        <span className="font-mono">truth ↓ / pred →</span>
        <span>
          accuracy{" "}
          <span className="font-mono text-foreground">
            {(accuracy * 100).toFixed(0)}%
          </span>
          <span className="ml-2 text-foreground/50">n={total}</span>
        </span>
      </div>

      <div
        role="table"
        aria-label="Confusion matrix: truth rows by predicted columns"
        className="grid gap-px overflow-hidden rounded-md border border-border/60 bg-border/60"
        style={{ gridTemplateColumns: `auto repeat(${CLASSES.length}, minmax(0,1fr))` }}
      >
        <div className="bg-muted/40" role="presentation" />
        {CLASSES.map((c) => (
          <div
            key={`head-${c}`}
            role="columnheader"
            className="bg-muted/40 px-1 py-1 text-center font-mono text-[10px] text-foreground/65"
          >
            {c}
          </div>
        ))}

        {CLASSES.map((truth, rowIdx) => (
          <div key={`row-${truth}`} className="contents">
            <div
              role="rowheader"
              className="bg-muted/40 px-1.5 py-1 text-left font-mono text-[10px] text-foreground/65"
              title={CLASSIFICATION_LABEL[truth]}
            >
              {truth}
            </div>
            {CLASSES.map((pred, colIdx) => {
              const value = counts[rowIdx][colIdx];
              const intensity = value === 0 ? 0 : Math.max(0.08, value / max);
              const isDiagonal = rowIdx === colIdx;
              const background = isDiagonal
                ? `color-mix(in oklch, var(--primary) ${Math.round(intensity * 80)}%, transparent)`
                : `color-mix(in oklch, var(--destructive) ${Math.round(intensity * 70)}%, transparent)`;
              return (
                <div
                  key={`cell-${truth}-${pred}`}
                  role="cell"
                  title={`${CLASSIFICATION_LABEL[truth]} → ${CLASSIFICATION_LABEL[pred]}: ${value}`}
                  className={cn(
                    "flex aspect-square items-center justify-center bg-background text-center font-mono text-[10.5px] tabular-nums transition-colors",
                    value === 0 ? "text-foreground/30" : "text-foreground/85",
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
