// Types match the backend Modal Dict and scores.json shapes. Keep in sync with:
//   ../../../functions/orchestrator.py  (leaderboard Dict shape)
//   ../../../functions/score_round.py   (scores.json shape)
//   ../../../functions/agents/base.py   (agent prediction shape)

export type Classification = "P" | "LP" | "VUS" | "LB" | "B";

export const CLASSIFICATION_LABEL: Record<Classification, string> = {
  P: "Pathogenic",
  LP: "Likely Pathogenic",
  VUS: "Uncertain Significance",
  LB: "Likely Benign",
  B: "Benign",
};

export const AGENT_NAMES = [
  "strict_rule",
  "functional_first",
  "insilico_first",
  "population_first",
  "conservative",
] as const;

export type AgentName = (typeof AGENT_NAMES)[number];

export const AGENT_LABEL: Record<AgentName, string> = {
  strict_rule: "Strict Rule",
  functional_first: "Functional First",
  insilico_first: "In-Silico First",
  population_first: "Population First",
  conservative: "Conservative",
};

// What an agent returns from run_agent.
export interface AgentPrediction {
  classification: Classification;
  applied_criteria: string[];
  reasoning: string;
  confidence: number;
  _model?: string;
  _usage?: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens: number;
    cache_creation_input_tokens: number;
  };
}

// One agent's score for one round (from scores.json).
export interface AgentScore {
  predicted: Classification;
  truth: Classification;
  accuracy: number;
  decisiveness: number;
  criterion_match: number;
  score: number;
}

// One history entry stored on a LeaderboardEntry.
export interface HistoryEntry {
  round_id: string;
  score: number;
  predicted: Classification;
  truth: Classification;
  timestamp?: string;
}

// One agent's leaderboard slot — matches the Modal Dict value per agent.
export interface LeaderboardEntry {
  agent: AgentName;
  ema: number;
  rounds: number;
  history: HistoryEntry[];
}

// Variant data the agents see (truth stripped before sending).
export interface VariantChallenge {
  variant_id: string;
  hgvs_c: string;
  hgvs_p: string | null;
  gene: string;
  consequence: string;
  chrom: string;
  pos: number;
  ref: string;
  alt: string;
  gnomad: GnomadData;
  insilico: InsilicoData;
  mavedb_function: MavedbData | null;
  literature: LiteratureEntry[];
  _difficulty?: "easy" | "hard";
}

export interface GnomadData {
  af: number | null;
  af_popmax: number | null;
  popmax_population: string | null;
  hom: number;
  ac: number;
  an: number;
  note?: string;
}

export interface InsilicoData {
  revel: number | null;
  cadd_phred: number | null;
  alphamissense: number | null;
  metarnn: number | null;
  spliceai_max: number | null;
  note?: string;
  [key: string]: number | string | null | undefined;
}

export interface MavedbData {
  score: number;
  category: string;
  source: string;
  note?: string;
}

export interface LiteratureEntry {
  pmid: string;
  title: string;
  abstract: string;
  relevant_criteria_hint?: string[];
}

export interface VariantTruth {
  classification:
    | "Pathogenic"
    | "Likely_pathogenic"
    | "Uncertain_significance"
    | "Likely_benign"
    | "Benign";
  review_status: string;
  clinvar_id: string;
  submitter_count: number;
  note?: string;
}

// Composite shape served by GET /round/:id.
export interface Round {
  round_id: string;
  timestamp: string;
  variant: VariantChallenge;
  truth: VariantTruth;
  predictions: Partial<Record<AgentName, AgentPrediction>>;
  scores: Partial<Record<AgentName, AgentScore>>;
}

// Summary entry for a recent-rounds list.
export interface RoundSummary {
  round_id: string;
  variant_id: string;
  timestamp: string;
  truth_classification: Classification;
  top_agent: AgentName;
  top_score: number;
}
