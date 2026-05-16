import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";
export const OG_ALT = "Pathos — ACMG variant interpretation arena";

export function renderPathosOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #0b0d12 0%, #14171f 50%, #1c1f29 100%)",
          color: "#f8fafc",
          fontFamily: "ui-sans-serif, system-ui, -apple-system",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#94a3b8",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              background: "#a78bfa",
              borderRadius: 4,
              transform: "rotate(45deg)",
            }}
          />
          Pathos · variant interpretation arena
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.02,
              letterSpacing: -2,
              fontWeight: 600,
              maxWidth: 1000,
            }}
          >
            The benchmark for AI variant interpretation.
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: "#cbd5f5",
              maxWidth: 980,
            }}
          >
            Five Claude strategies. Real ClinVar variants. A fresh round every 90
            seconds — and the reasoning is first-class.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#94a3b8",
          }}
        >
          <div style={{ display: "flex", gap: 18 }}>
            <Pill label="strict_rule" />
            <Pill label="functional_first" />
            <Pill label="insilico_first" />
            <Pill label="population_first" />
            <Pill label="conservative" />
          </div>
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular",
              color: "#a3a3a3",
            }}
          >
            pathos.local / leaderboard
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}

function Pill({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "10px 18px",
        borderRadius: 999,
        border: "1px solid rgba(148,163,184,0.35)",
        background: "rgba(148,163,184,0.08)",
        fontFamily: "ui-monospace, SFMono-Regular",
        fontSize: 20,
        color: "#e2e8f0",
        display: "flex",
        alignItems: "center",
      }}
    >
      {label}
    </div>
  );
}
