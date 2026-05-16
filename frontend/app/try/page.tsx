import type { Metadata } from "next";
import { PromptLab } from "@/components/prompt-lab/prompt-lab";

export const metadata: Metadata = {
  title: "Prompt lab",
  description: "Try custom PathosHunt prompt strategies and option presets.",
};

export default function TryPage() {
  return <PromptLab />;
}
