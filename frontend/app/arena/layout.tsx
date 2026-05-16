import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Genomic Arena — Real-time competition for genetic intelligence",
  description:
    "The world's first live genomic AI evaluation platform. Multiple AI agents, real-world variants, continuous head-to-head competition with full reasoning transparency.",
};

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${instrumentSerif.variable} arena-root relative min-h-[100dvh] bg-[#f7f9fc] text-[#0c1733]`}
    >
      {/* Ambient page wash — soft icy blue and a quiet cyan bloom, both fixed and inert */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute inset-x-0 top-[-220px] h-[640px]"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 0%, rgba(184,210,243,0.55) 0%, rgba(247,249,252,0) 70%)",
          }}
        />
        <div
          className="absolute right-[-160px] top-[180px] h-[520px] w-[640px]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(122,179,232,0.28), rgba(247,249,252,0) 70%)",
          }}
        />
        <div
          className="absolute left-[-120px] top-[420px] h-[460px] w-[520px]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(174,196,232,0.32), rgba(247,249,252,0) 75%)",
          }}
        />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
