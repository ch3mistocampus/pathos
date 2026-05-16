// Hand-rolled, zero-dependency runtime guards for the Modal backend JSON.
// Mirrors `./types.ts`; if those types change, update these helpers in
// lockstep. Kept dependency-free so we don't add zod just for five payloads.

import {
  AGENT_NAMES,
  type AgentName,
  type AgentPrediction,
  type AgentScore,
  type Classification,
  type HistoryEntry,
  type LeaderboardEntry,
  type Round,
  type RoundSummary,
  type VariantChallenge,
  type VariantTruth,
} from "./types";

export class ParseError extends Error {
  constructor(message: string, public readonly path: string) {
    super(`${path}: ${message}`);
    this.name = "ParseError";
  }
}

const CLASSIFICATIONS: Classification[] = ["P", "LP", "VUS", "LB", "B"];

const TRUTH_CLASSES = new Set([
  "Pathogenic",
  "Likely_pathogenic",
  "Uncertain_significance",
  "Likely_benign",
  "Benign",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw new ParseError(`expected string, got ${typeof value}`, path);
  }
  return value;
}

function asNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new ParseError(`expected number, got ${typeof value}`, path);
  }
  return value;
}

function asOptionalNumber(value: unknown, path: string): number | null {
  if (value === null || value === undefined) return null;
  return asNumber(value, path);
}

function asAgent(value: unknown, path: string): AgentName {
  const str = asString(value, path);
  if (!(AGENT_NAMES as readonly string[]).includes(str)) {
    throw new ParseError(`unknown agent "${str}"`, path);
  }
  return str as AgentName;
}

function asClassification(value: unknown, path: string): Classification {
  const str = asString(value, path);
  if (!CLASSIFICATIONS.includes(str as Classification)) {
    throw new ParseError(`unknown classification "${str}"`, path);
  }
  return str as Classification;
}

function asStringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) {
    throw new ParseError(`expected array, got ${typeof value}`, path);
  }
  return value.map((entry, idx) => asString(entry, `${path}[${idx}]`));
}

function parseHistoryEntry(raw: unknown, path: string): HistoryEntry {
  if (!isRecord(raw)) throw new ParseError("expected object", path);
  return {
    round_id: asString(raw.round_id, `${path}.round_id`),
    score: asNumber(raw.score, `${path}.score`),
    predicted: asClassification(raw.predicted, `${path}.predicted`),
    truth: asClassification(raw.truth, `${path}.truth`),
    timestamp:
      typeof raw.timestamp === "string" ? raw.timestamp : undefined,
  };
}

function parseLeaderboardEntry(raw: unknown, path: string): LeaderboardEntry {
  if (!isRecord(raw)) throw new ParseError("expected object", path);
  const history = Array.isArray(raw.history) ? raw.history : [];
  return {
    agent: asAgent(raw.agent, `${path}.agent`),
    ema: asNumber(raw.ema, `${path}.ema`),
    rounds: asNumber(raw.rounds, `${path}.rounds`),
    history: history.map((h, idx) =>
      parseHistoryEntry(h, `${path}.history[${idx}]`),
    ),
  };
}

export function parseLeaderboard(raw: unknown): LeaderboardEntry[] {
  if (!Array.isArray(raw)) {
    throw new ParseError("expected array", "leaderboard");
  }
  return raw.map((entry, idx) =>
    parseLeaderboardEntry(entry, `leaderboard[${idx}]`),
  );
}

function parseRoundSummary(raw: unknown, path: string): RoundSummary {
  if (!isRecord(raw)) throw new ParseError("expected object", path);
  return {
    round_id: asString(raw.round_id, `${path}.round_id`),
    variant_id: asString(raw.variant_id, `${path}.variant_id`),
    timestamp: asString(raw.timestamp, `${path}.timestamp`),
    truth_classification: asClassification(
      raw.truth_classification,
      `${path}.truth_classification`,
    ),
    top_agent: asAgent(raw.top_agent, `${path}.top_agent`),
    top_score: asNumber(raw.top_score, `${path}.top_score`),
  };
}

export function parseRecentRounds(raw: unknown): RoundSummary[] {
  if (!Array.isArray(raw)) {
    throw new ParseError("expected array", "recent_rounds");
  }
  return raw.map((entry, idx) =>
    parseRoundSummary(entry, `recent_rounds[${idx}]`),
  );
}

function parseVariantChallenge(raw: unknown, path: string): VariantChallenge {
  if (!isRecord(raw)) throw new ParseError("expected object", path);
  const gnomad = isRecord(raw.gnomad) ? raw.gnomad : {};
  const insilico = isRecord(raw.insilico) ? raw.insilico : {};
  return {
    variant_id: asString(raw.variant_id, `${path}.variant_id`),
    hgvs_c: asString(raw.hgvs_c, `${path}.hgvs_c`),
    hgvs_p:
      raw.hgvs_p === null || raw.hgvs_p === undefined
        ? null
        : asString(raw.hgvs_p, `${path}.hgvs_p`),
    gene: asString(raw.gene, `${path}.gene`),
    consequence: asString(raw.consequence, `${path}.consequence`),
    chrom: asString(raw.chrom, `${path}.chrom`),
    pos: asNumber(raw.pos, `${path}.pos`),
    ref: asString(raw.ref, `${path}.ref`),
    alt: asString(raw.alt, `${path}.alt`),
    gnomad: {
      af: asOptionalNumber(gnomad.af, `${path}.gnomad.af`),
      af_popmax: asOptionalNumber(gnomad.af_popmax, `${path}.gnomad.af_popmax`),
      popmax_population:
        typeof gnomad.popmax_population === "string"
          ? gnomad.popmax_population
          : null,
      hom: asNumber(gnomad.hom ?? 0, `${path}.gnomad.hom`),
      ac: asNumber(gnomad.ac ?? 0, `${path}.gnomad.ac`),
      an: asNumber(gnomad.an ?? 0, `${path}.gnomad.an`),
      note:
        typeof gnomad.note === "string" ? gnomad.note : undefined,
    },
    insilico: {
      revel: asOptionalNumber(insilico.revel, `${path}.insilico.revel`),
      cadd_phred: asOptionalNumber(
        insilico.cadd_phred,
        `${path}.insilico.cadd_phred`,
      ),
      alphamissense: asOptionalNumber(
        insilico.alphamissense,
        `${path}.insilico.alphamissense`,
      ),
      metarnn: asOptionalNumber(insilico.metarnn, `${path}.insilico.metarnn`),
      spliceai_max: asOptionalNumber(
        insilico.spliceai_max,
        `${path}.insilico.spliceai_max`,
      ),
    },
    mavedb_function: isRecord(raw.mavedb_function)
      ? {
          score: asNumber(
            raw.mavedb_function.score,
            `${path}.mavedb_function.score`,
          ),
          category: asString(
            raw.mavedb_function.category,
            `${path}.mavedb_function.category`,
          ),
          source: asString(
            raw.mavedb_function.source,
            `${path}.mavedb_function.source`,
          ),
          note:
            typeof raw.mavedb_function.note === "string"
              ? raw.mavedb_function.note
              : undefined,
        }
      : null,
    literature: Array.isArray(raw.literature)
      ? raw.literature.map((lit, idx) => {
          if (!isRecord(lit))
            throw new ParseError("expected object", `${path}.literature[${idx}]`);
          return {
            pmid: asString(lit.pmid, `${path}.literature[${idx}].pmid`),
            title: asString(lit.title, `${path}.literature[${idx}].title`),
            abstract: asString(
              lit.abstract,
              `${path}.literature[${idx}].abstract`,
            ),
            relevant_criteria_hint: Array.isArray(lit.relevant_criteria_hint)
              ? asStringArray(
                  lit.relevant_criteria_hint,
                  `${path}.literature[${idx}].relevant_criteria_hint`,
                )
              : undefined,
          };
        })
      : [],
    _difficulty:
      raw._difficulty === "easy" || raw._difficulty === "hard"
        ? raw._difficulty
        : undefined,
  };
}

function parseTruth(raw: unknown, path: string): VariantTruth {
  if (!isRecord(raw)) throw new ParseError("expected object", path);
  const cls = asString(raw.classification, `${path}.classification`);
  if (!TRUTH_CLASSES.has(cls)) {
    throw new ParseError(`unknown truth class "${cls}"`, `${path}.classification`);
  }
  return {
    classification: cls as VariantTruth["classification"],
    review_status: asString(raw.review_status, `${path}.review_status`),
    clinvar_id: asString(raw.clinvar_id, `${path}.clinvar_id`),
    submitter_count: asNumber(
      raw.submitter_count,
      `${path}.submitter_count`,
    ),
    note: typeof raw.note === "string" ? raw.note : undefined,
  };
}

function parsePrediction(raw: unknown, path: string): AgentPrediction {
  if (!isRecord(raw)) throw new ParseError("expected object", path);
  return {
    classification: asClassification(raw.classification, `${path}.classification`),
    applied_criteria: asStringArray(
      raw.applied_criteria,
      `${path}.applied_criteria`,
    ),
    reasoning: asString(raw.reasoning, `${path}.reasoning`),
    confidence: asNumber(raw.confidence, `${path}.confidence`),
  };
}

function parseScore(raw: unknown, path: string): AgentScore {
  if (!isRecord(raw)) throw new ParseError("expected object", path);
  return {
    predicted: asClassification(raw.predicted, `${path}.predicted`),
    truth: asClassification(raw.truth, `${path}.truth`),
    accuracy: asNumber(raw.accuracy, `${path}.accuracy`),
    decisiveness: asNumber(raw.decisiveness, `${path}.decisiveness`),
    criterion_match: asNumber(raw.criterion_match, `${path}.criterion_match`),
    score: asNumber(raw.score, `${path}.score`),
  };
}

export function parseRound(raw: unknown): Round {
  if (!isRecord(raw)) throw new ParseError("expected object", "round");

  const predictions: Round["predictions"] = {};
  if (isRecord(raw.predictions)) {
    for (const [k, v] of Object.entries(raw.predictions)) {
      const agent = asAgent(k, `round.predictions[${k}]`);
      predictions[agent] = parsePrediction(v, `round.predictions.${k}`);
    }
  }

  const scores: Round["scores"] = {};
  if (isRecord(raw.scores)) {
    for (const [k, v] of Object.entries(raw.scores)) {
      const agent = asAgent(k, `round.scores[${k}]`);
      scores[agent] = parseScore(v, `round.scores.${k}`);
    }
  }

  return {
    round_id: asString(raw.round_id, "round.round_id"),
    timestamp: asString(raw.timestamp, "round.timestamp"),
    variant: parseVariantChallenge(raw.variant, "round.variant"),
    truth: parseTruth(raw.truth, "round.truth"),
    predictions,
    scores,
  };
}
