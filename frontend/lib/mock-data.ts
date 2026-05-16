// Mock data shaped exactly like what the backend Modal Dict / scores.json will return.
// Lets the frontend be built without a running backend. Delete when MOCK_MODE flips off.

import type {
  AgentName,
  HistoryEntry,
  LeaderboardEntry,
  Round,
  RoundSummary,
} from "./types";
import { AGENT_NAMES } from "./types";

const CLASSES = ["P", "LP", "VUS", "LB", "B"] as const;

// Slightly different scoring "tendencies" per agent so the EMA chart shows separation.
const AGENT_BIAS: Record<AgentName, number> = {
  strict_rule: 0.62,
  functional_first: 0.74,
  insilico_first: 0.68,
  population_first: 0.59,
  conservative: 0.55,
};

// Deterministic PRNG so mock data is stable across reloads.
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateHistory(agent: AgentName, rounds: number): HistoryEntry[] {
  const rng = seededRandom(agent.charCodeAt(0) * 1000 + rounds);
  const bias = AGENT_BIAS[agent];
  return Array.from({ length: rounds }, (_, i) => {
    const score = Math.max(0, Math.min(1, bias + (rng() - 0.5) * 0.35));
    const truthIdx = Math.floor(rng() * CLASSES.length);
    const truth = CLASSES[truthIdx];
    // Predicted is correct with probability ~bias, otherwise drifts by 1
    const correct = rng() < bias;
    const predIdx = correct
      ? truthIdx
      : Math.max(0, Math.min(CLASSES.length - 1, truthIdx + (rng() < 0.5 ? -1 : 1)));
    return {
      round_id: `round_${1747400000 + i * 90}`,
      score: Number(score.toFixed(3)),
      predicted: CLASSES[predIdx],
      truth,
      timestamp: new Date(1747400000000 + i * 90000).toISOString(),
    };
  });
}

function computeEma(history: HistoryEntry[], alpha = 0.1): number {
  let ema = 0;
  for (const h of history) {
    ema = (1 - alpha) * ema + alpha * h.score;
  }
  return Number(ema.toFixed(3));
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = AGENT_NAMES.map((agent) => {
  const history = generateHistory(agent, 60);
  return {
    agent,
    ema: computeEma(history),
    rounds: history.length,
    history,
  };
});

export const MOCK_ROUND: Round = {
  round_id: "round_1747403600",
  timestamp: "2026-05-16T18:33:20.000Z",
  variant: {
    variant_id: "BRCA1_NM_007294.4_c.181T>G",
    hgvs_c: "NM_007294.4:c.181T>G",
    hgvs_p: "p.Cys61Gly",
    gene: "BRCA1",
    consequence: "missense_variant",
    chrom: "17",
    pos: 43106487,
    ref: "T",
    alt: "G",
    gnomad: {
      af: null,
      af_popmax: null,
      popmax_population: null,
      hom: 0,
      ac: 0,
      an: 1450000,
      note: "absent from gnomAD v4",
    },
    insilico: {
      revel: 0.957,
      cadd_phred: 27.4,
      alphamissense: 0.984,
      metarnn: 0.91,
      spliceai_max: 0.02,
    },
    mavedb_function: {
      score: -2.1,
      category: "loss_of_function",
      source: "Findlay_2018",
      note: "Saturation genome editing of BRCA1 RING domain",
    },
    literature: [
      {
        pmid: "30209399",
        title: "Accurate classification of BRCA1 variants with saturation genome editing.",
        abstract:
          "Findlay et al. demonstrate that c.181T>G (p.Cys61Gly) abolishes BRCA1 function in a saturation genome editing assay, supporting pathogenic classification.",
        relevant_criteria_hint: ["PS3"],
      },
    ],
    _difficulty: "easy",
  },
  truth: {
    classification: "Pathogenic",
    review_status: "reviewed_by_expert_panel",
    clinvar_id: "55407",
    submitter_count: 18,
  },
  predictions: {
    strict_rule: {
      classification: "P",
      applied_criteria: ["PS3", "PM2", "PP3", "PM1"],
      reasoning:
        "PS3 applies (Findlay 2018 saturation editing shows loss of function). PM2 applies (absent from gnomAD). PP3 applies (REVEL 0.957, CADD 27.4, AlphaMissense 0.984 — three computational lines converge). PM1 applies (RING domain hotspot). Combining: 1 PS + 2 PM + 1 PP -> Pathogenic.",
      confidence: 0.92,
    },
    functional_first: {
      classification: "P",
      applied_criteria: ["PS3", "PM2", "PP3"],
      reasoning:
        "Functional evidence is decisive here: Findlay 2018 SGE assay scores this variant at -2.1, well within loss-of-function range. PS3 alone leans LP at minimum. Combined with PM2 (absent from gnomAD) and PP3 (high-quality predictor consensus), the call is Pathogenic.",
      confidence: 0.94,
    },
    insilico_first: {
      classification: "P",
      applied_criteria: ["PP3_strong", "PS3", "PM2"],
      reasoning:
        "All three modern predictors converge strongly on damaging (AlphaMissense 0.984, REVEL 0.957, CADD 27.4). I upgrade PP3 to moderate per my strategy. PS3 from functional data and PM2 from absence in gnomAD reinforce. Pathogenic.",
      confidence: 0.95,
    },
    population_first: {
      classification: "LP",
      applied_criteria: ["PM2", "PP3", "PS3"],
      reasoning:
        "Variant is absent from gnomAD v4 — PM2 applies with strong weight in a well-established disease gene. Functional and computational evidence support pathogenicity. Without segregation or case-control data, I land at Likely Pathogenic rather than full Pathogenic.",
      confidence: 0.81,
    },
    conservative: {
      classification: "LP",
      applied_criteria: ["PS3", "PM2"],
      reasoning:
        "I require multiple PS-level lines for Pathogenic. Here I have PS3 (functional) + PM2 (absent from gnomAD), which clears Likely Pathogenic but not full Pathogenic without segregation or independent case data. Likely Pathogenic.",
      confidence: 0.78,
    },
  },
  scores: {
    strict_rule: {
      predicted: "P",
      truth: "P",
      accuracy: 1.0,
      decisiveness: 1.0,
      criterion_match: 0.75,
      score: 0.963,
    },
    functional_first: {
      predicted: "P",
      truth: "P",
      accuracy: 1.0,
      decisiveness: 1.0,
      criterion_match: 1.0,
      score: 1.0,
    },
    insilico_first: {
      predicted: "P",
      truth: "P",
      accuracy: 1.0,
      decisiveness: 1.0,
      criterion_match: 0.667,
      score: 0.95,
    },
    population_first: {
      predicted: "LP",
      truth: "P",
      accuracy: 0.75,
      decisiveness: 1.0,
      criterion_match: 1.0,
      score: 0.85,
    },
    conservative: {
      predicted: "LP",
      truth: "P",
      accuracy: 0.75,
      decisiveness: 1.0,
      criterion_match: 1.0,
      score: 0.85,
    },
  },
};

export const MOCK_RECENT_ROUNDS: RoundSummary[] = [
  {
    round_id: "round_1747403600",
    variant_id: "BRCA1_NM_007294.4_c.181T>G",
    timestamp: "2026-05-16T18:33:20.000Z",
    truth_classification: "P",
    top_agent: "functional_first",
    top_score: 1.0,
  },
  {
    round_id: "round_1747403510",
    variant_id: "BRCA2_NM_000059.4_c.7976+5G>A",
    timestamp: "2026-05-16T18:31:50.000Z",
    truth_classification: "LB",
    top_agent: "population_first",
    top_score: 0.95,
  },
  {
    round_id: "round_1747403420",
    variant_id: "BRCA1_NM_007294.4_c.4837A>G",
    timestamp: "2026-05-16T18:30:20.000Z",
    truth_classification: "B",
    top_agent: "population_first",
    top_score: 1.0,
  },
  {
    round_id: "round_1747403330",
    variant_id: "BRCA1_NM_007294.4_c.3548A>G",
    timestamp: "2026-05-16T18:28:50.000Z",
    truth_classification: "VUS",
    top_agent: "conservative",
    top_score: 0.9,
  },
  {
    round_id: "round_1747403240",
    variant_id: "BRCA1_NM_007294.4_c.68_69del",
    timestamp: "2026-05-16T18:27:20.000Z",
    truth_classification: "P",
    top_agent: "strict_rule",
    top_score: 1.0,
  },
];

// Summaries + procedure blocks synced with ../functions/agents/prompts.py strategy prefixes.
export const STRATEGY_DEFINITIONS: Record<
  AgentName,
  { tagline: string; philosophy: string; procedure: string[] }
> = {
  strict_rule: {
    tagline: "Apply ACMG/AMP mechanically. No intuition, no rounding up.",
    philosophy:
      "Walks through every criterion explicitly. Uses combining rules literally. Defaults to VUS on ambiguity.",
    procedure: [
      "Check PVS1 before all other pathogenic rules.",
      "Review population frequency for BA1, BS1, and PM2.",
      "Score predictors as PP3 or BP4.",
      "Evaluate functional and literature evidence.",
      "List criteria, then apply combining rules literally.",
    ],
  },
  functional_first: {
    tagline: "Functional assays decide. Everything else supports.",
    philosophy:
      "Treats PS3 and BS3 as near-decisive. Population frequency only overrides clear functional findings via BA1.",
    procedure: [
      "Let functional assay results drive the first call.",
      "Apply BA1 when population data overrides function.",
      "Fall back to ACMG when function is absent.",
      "Upgrade only when function has independent support.",
      "Cite functional evidence prominently in reasoning.",
    ],
  },
  insilico_first: {
    tagline: "Modern predictors are accurate enough to make decisive calls.",
    philosophy:
      "Upgrades PP3/BP4 to moderate when AlphaMissense + REVEL + CADD converge. Still respects BA1.",
    procedure: [
      "Review all predictor scores before other evidence.",
      "Upgrade convergent predictor signals to moderate strength.",
      "Combine predictions with population and functional data.",
      "Make decisive calls when signals are unambiguous.",
      "Use VUS when predictors conflict.",
    ],
  },
  population_first: {
    tagline: "gnomAD frequency is the most objective signal available.",
    philosophy:
      "Checks popmax first. BA1 ends the analysis. PM2 in known disease genes carries strong weight.",
    procedure: [
      "Check gnomAD frequency and homozygotes first.",
      "Stop at Benign when popmax exceeds 5%.",
      "Treat common variants as likely benign unless contradicted.",
      "Run full ACMG analysis for rare present variants.",
      "Apply PM2 when absent, then combine evidence.",
    ],
  },
  conservative: {
    tagline: "When in doubt, VUS. Overclassification has clinical cost.",
    philosophy:
      "Requires multiple PS-level lines for Pathogenic. Defaults to VUS unless evidence is unambiguous.",
    procedure: [
      "Start every assessment at VUS.",
      "Require strong paired evidence for Likely Pathogenic.",
      "Reserve Pathogenic for PVS1 plus PS3 or two strong lines.",
      "Allow benign calls only from frequency or function.",
      "Keep VUS whenever evidence remains uncertain.",
    ],
  },
};
