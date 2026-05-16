import type { SVGProps } from "react";

/** Minimal DNA double-helix mark for the PathosHunt brand wordmark. */
export function HelixMark({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="helix-stroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--primary-deep)" />
        </linearGradient>
      </defs>
      <path
        d="M6 2 C 22 8, 22 14, 6 20 C -10 26, 26 28, 26 34"
        stroke="url(#helix-stroke)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M26 2 C 10 8, 10 14, 26 20 C 42 26, 6 28, 6 34"
        stroke="url(#helix-stroke)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.45">
        <line x1="9" y1="6" x2="23" y2="6" />
        <line x1="11" y1="11" x2="21" y2="11" />
        <line x1="11" y1="16" x2="21" y2="16" />
        <line x1="9" y1="22" x2="23" y2="22" />
        <line x1="11" y1="28" x2="21" y2="28" />
      </g>
    </svg>
  );
}

/** Pulsing dot used for "LIVE" indicators. Color follows the --live token. */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={`relative inline-flex h-2 w-2 ${className ?? ""}`}>
      <span
        className="absolute inset-0 animate-ping rounded-full"
        style={{ background: "var(--live-soft)" }}
      />
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ background: "var(--live)" }}
      />
    </span>
  );
}

/** Compact sparkline; values are 0–1. */
export function Sparkline({
  values,
  className,
  stroke = "var(--primary)",
  width = 56,
  height = 16,
}: {
  values: number[];
  className?: string;
  stroke?: string;
  width?: number;
  height?: number;
}) {
  if (values.length === 0) return null;
  const step = width / Math.max(1, values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - v * height;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
    >
      <path
        d={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Tiny bar-spark used in evidence rows. */
export function BarSpark({
  values,
  color = "var(--primary)",
  className,
}: {
  values: number[];
  color?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex h-4 items-end gap-[2px] ${className ?? ""}`}
      aria-hidden
    >
      {values.map((v, i) => (
        <span
          key={i}
          className="w-[3px] rounded-sm"
          style={{
            height: `${Math.max(8, v * 100)}%`,
            background: color,
            opacity: 0.35 + v * 0.55,
          }}
        />
      ))}
    </div>
  );
}
