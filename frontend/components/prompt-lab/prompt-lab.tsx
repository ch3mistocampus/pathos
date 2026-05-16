"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import {
  Beaker,
  CheckCircle2,
  Loader2,
  Play,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { MOCK_ROUND, STRATEGY_DEFINITIONS } from "@/lib/mock-data";
import {
  AGENT_LABEL,
  AGENT_NAMES,
  CLASSIFICATION_LABEL,
  type AgentName,
  type Classification,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type Preset = "balanced" | "decisive" | "conservative";

const PRESET_LABEL: Record<Preset, string> = {
  balanced: "Balanced",
  decisive: "Decisive",
  conservative: "Conservative",
};

const PRESET_COPY: Record<Preset, string> = {
  balanced: "Weigh functional, population, and computational evidence evenly.",
  decisive: "Prefer clear pathogenic or benign calls when evidence converges.",
  conservative: "Hold VUS unless multiple independent criteria agree.",
};

function defaultPrompt(agent: AgentName): string {
  const strategy = STRATEGY_DEFINITIONS[agent];
  return [
    strategy.tagline,
    "",
    strategy.procedure.map((step, index) => `${index + 1}. ${step}`).join("\n"),
    "",
    "Return JSON with classification, applied_criteria, reasoning, and confidence.",
  ].join("\n");
}

function inferClassification(prompt: string, preset: Preset): Classification {
  const lower = prompt.toLowerCase();
  const decisiveSignals = [
    "functional",
    "ps3",
    "loss-of-function",
    "loss of function",
    "pathogenic",
  ].filter((term) => lower.includes(term)).length;
  const populationSignals = ["population", "gnomad", "ba1", "benign"].filter(
    (term) => lower.includes(term),
  ).length;

  if (preset === "conservative" && decisiveSignals < 4) return "LP";
  if (populationSignals > decisiveSignals + 1) return "LB";
  if (decisiveSignals >= 3 || preset === "decisive") return "P";
  return "VUS";
}

function scoreClassification(classification: Classification): number {
  const distanceFromTruth: Record<Classification, number> = {
    P: 0,
    LP: 1,
    VUS: 2,
    LB: 3,
    B: 4,
  };
  return Math.max(0.25, 1 - distanceFromTruth[classification] * 0.13);
}

export function PromptLab() {
  const router = useRouter();
  const { ready, user } = useAuth();
  const submitVariant = useMutation(api.submissions.submitVariant);
  const [agent, setAgent] = useState<AgentName>("functional_first");
  const [preset, setPreset] = useState<Preset>("balanced");
  const [prompt, setPrompt] = useState(defaultPrompt("functional_first"));
  const [submissionId, setSubmissionId] = useState<Id<"submissions"> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subscribe to the submission row; Convex auto-refetches as status flips.
  const submission = useQuery(
    api.submissions.getSubmission,
    submissionId ? { id: submissionId } : "skip",
  );

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login?next=/try");
    }
  }, [ready, router, user]);

  const challenge = MOCK_ROUND.variant;

  const isRunning =
    submissionId !== null &&
    submission != null &&
    submission.status !== "done" &&
    submission.status !== "error";

  const result = useMemo<{
    classification: Classification;
    confidence: number;
    score: number;
    criteria: string[];
  } | null>(() => {
    if (!submission || submission.status !== "done" || !submission.predictions) {
      return null;
    }
    const pred = submission.predictions[agent];
    if (!pred) return null;
    const classification = pred.classification as Classification;
    const score = scoreClassification(classification);
    return {
      classification,
      confidence: typeof pred.confidence === "number" ? pred.confidence : score,
      score,
      criteria: Array.isArray(pred.applied_criteria) ? pred.applied_criteria : [],
    };
  }, [agent, submission]);

  const promptStats = useMemo(() => {
    const words = prompt.trim().split(/\s+/).filter(Boolean).length;
    const criteria = (prompt.match(/\b(PVS1|PS[1-4]|PM[1-6]|PP[1-5]|BA1|BS[1-4]|BP[1-7])\b/g) ?? [])
      .filter((value, index, values) => values.indexOf(value) === index);
    return { words, criteria };
  }, [prompt]);

  function updateAgent(nextAgent: AgentName) {
    setAgent(nextAgent);
    setPrompt(defaultPrompt(nextAgent));
  }

  async function onRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setErrorMessage(null);
    setSubmissionId(null);
    try {
      const id = await submitVariant({
        variant: challenge,
        user_id: user.username,
      });
      setSubmissionId(id);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to submit variant",
      );
    }
  }

  if (!ready || !user) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-6 py-12">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Opening prompt lab
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-4 border-b border-border/60 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono uppercase tracking-[0.18em]">
              <Beaker className="size-3" aria-hidden />
              Prompt lab
            </Badge>
            <span className="text-sm text-muted-foreground">Signed in as {user.username}</span>
          </div>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.025em] sm:text-5xl">
            Try your own interpretation strategy.
          </h1>
        </div>
        <Link
          href="/round/round_1747403600"
          className="text-sm font-medium text-primary hover:underline"
        >
          Inspect benchmark round
        </Link>
      </header>

      <form onSubmit={onRun} className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        <aside className="space-y-6">
          <section className="rounded-xl border border-border/70 bg-background/75 p-4 pathos-shadow">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="size-4" aria-hidden />
              Strategy
            </div>
            <div className="grid gap-2">
              {AGENT_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => updateAgent(name)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-sm transition",
                    agent === name
                      ? "border-primary bg-[var(--primary-tint)] text-foreground"
                      : "border-border/70 bg-background hover:bg-muted",
                  )}
                >
                  <span className="block font-medium">{AGENT_LABEL[name]}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {STRATEGY_DEFINITIONS[name].tagline}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border/70 bg-background/75 p-4 pathos-shadow">
            <div className="mb-3 text-sm font-semibold">Options</div>
            <div className="grid gap-2">
              {(Object.keys(PRESET_LABEL) as Preset[]).map((name) => (
                <label
                  key={name}
                  className="flex cursor-pointer gap-2 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm has-checked:border-primary has-checked:bg-[var(--primary-tint)]"
                >
                  <input
                    type="radio"
                    name="preset"
                    checked={preset === name}
                    onChange={() => {
                      setPreset(name);
                      setSubmissionId(null);
                    }}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium">{PRESET_LABEL[name]}</span>
                    <span className="block text-xs text-muted-foreground">
                      {PRESET_COPY[name]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </aside>

        <section className="rounded-xl border border-border/70 bg-background/80 p-4 pathos-shadow">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">System prompt</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Seeded from {AGENT_LABEL[agent]}, editable for this session.
              </p>
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {promptStats.words} words · {promptStats.criteria.length} criteria
            </div>
          </div>
          <textarea
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              setSubmissionId(null);
            }}
            spellCheck={false}
            className="min-h-[520px] w-full resize-y rounded-lg border border-input bg-card p-4 font-mono text-[13px] leading-relaxed outline-none transition focus:border-primary focus:ring-3 focus:ring-ring/30"
          />
          <div className="mt-4 flex flex-wrap justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPrompt(defaultPrompt(agent));
                setSubmissionId(null);
              }}
            >
              Reset prompt
            </Button>
            <Button type="submit" className="pathos-cta" disabled={isRunning}>
              {isRunning ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Play className="size-4" aria-hidden />
              )}
              Run trial
            </Button>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-xl border border-border/70 bg-background/75 p-4 pathos-shadow">
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-foreground/45">
              Current challenge
            </div>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">
              {challenge.hgvs_c}
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Gene</dt>
                <dd className="font-medium">{challenge.gene}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Protein</dt>
                <dd className="font-medium">{challenge.hgvs_p}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">gnomAD</dt>
                <dd className="font-medium">{challenge.gnomad.note}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Function</dt>
                <dd className="font-medium">{challenge.mavedb_function?.category}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-border/70 bg-background/75 p-4 pathos-shadow">
            <div className="mb-3 text-sm font-semibold">Trial result</div>
            {errorMessage && (
              <p className="mb-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {errorMessage}
              </p>
            )}
            {isRunning && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-foreground/70">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                {submission?.status === "classifying"
                  ? "Five agents running in parallel — usually 30–90 seconds."
                  : "Submitted. Waiting for the agent pool to pick it up…"}
              </div>
            )}
            {submission?.status === "error" && (
              <p className="mb-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {submission.error ?? "Classification failed."}
              </p>
            )}
            {result ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-primary/20 bg-[var(--primary-tint)] p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="size-4 text-primary" aria-hidden />
                    {CLASSIFICATION_LABEL[result.classification]}
                  </div>
                  <div className="mt-2 font-mono text-xs text-muted-foreground">
                    confidence {result.confidence.toFixed(2)} · score{" "}
                    {result.score.toFixed(3)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-[0.18em] text-foreground/45">
                    Applied criteria
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {result.criteria.map((criterion) => (
                      <Badge key={criterion} variant="secondary">
                        {criterion}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-foreground/65">
                  This local trial mirrors the app scoring surface. When the
                  backend bridge is ready, this panel can call the live agent run
                  endpoint with the same prompt and option payload.
                </p>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Run a trial to preview classification, confidence, criteria, and
                score for the selected prompt.
              </p>
            )}
          </section>
        </aside>
      </form>
    </section>
  );
}
