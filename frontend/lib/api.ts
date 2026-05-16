// API helpers. Currently returns mock data; flip MOCK_MODE to false and set
// NEXT_PUBLIC_PATHOS_API_URL when the Modal backend is deployed.
//
// All live responses pass through small hand-rolled parsers in `./parsers.ts`
// that guard against backend shape drift. On parse / network failure the
// helpers fall back to the last successful response so the demo never goes
// blank during a transient outage.

import {
  MOCK_LEADERBOARD,
  MOCK_RECENT_ROUNDS,
  MOCK_ROUND,
} from "./mock-data";
import {
  parseLeaderboard,
  parseRecentRounds,
  parseRound,
  ParseError,
} from "./parsers";
import type { LeaderboardEntry, Round, RoundSummary } from "./types";

const MOCK_MODE = false;

const API_BASE = process.env.NEXT_PUBLIC_PATHOS_API_URL ?? "";

interface LastGood {
  leaderboard: LeaderboardEntry[] | null;
  recentRounds: RoundSummary[] | null;
  rounds: Map<string, Round>;
}

// Module-level cache of last successful payloads. In a serverless deploy this
// reset per cold start, which is acceptable as a graceful-degradation shim.
const lastGood: LastGood = {
  leaderboard: null,
  recentRounds: null,
  rounds: new Map(),
};

async function fetchJson<T>(
  path: string,
  parse: (raw: unknown) => T,
): Promise<T> {
  if (!API_BASE) {
    throw new Error(
      "NEXT_PUBLIC_PATHOS_API_URL is not set. Either set it or flip MOCK_MODE = true in lib/api.ts.",
    );
  }
  const res = await fetch(`${API_BASE}${path}`, {
    next: { revalidate: 15 },
  });
  if (!res.ok) {
    throw new Error(`API ${path} returned ${res.status}`);
  }
  const raw = (await res.json()) as unknown;
  return parse(raw);
}

function warn(message: string, err: unknown) {
  if (typeof console === "undefined") return;
  if (err instanceof ParseError) {
    console.warn(`[pathos/api] ${message}: ${err.message}`);
  } else if (err instanceof Error) {
    console.warn(`[pathos/api] ${message}: ${err.message}`);
  } else {
    console.warn(`[pathos/api] ${message}`, err);
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (MOCK_MODE) return MOCK_LEADERBOARD;
  try {
    const data = await fetchJson("/leaderboard", parseLeaderboard);
    lastGood.leaderboard = data;
    return data;
  } catch (err) {
    warn("getLeaderboard failed; using last-good cache", err);
    return lastGood.leaderboard ?? MOCK_LEADERBOARD;
  }
}

export async function getRecentRounds(limit = 20): Promise<RoundSummary[]> {
  if (MOCK_MODE) return MOCK_RECENT_ROUNDS.slice(0, limit);
  try {
    const data = await fetchJson(`/rounds?limit=${limit}`, parseRecentRounds);
    lastGood.recentRounds = data;
    return data;
  } catch (err) {
    warn("getRecentRounds failed; using last-good cache", err);
    return (lastGood.recentRounds ?? MOCK_RECENT_ROUNDS).slice(0, limit);
  }
}

export async function getRound(roundId: string): Promise<Round> {
  if (MOCK_MODE) {
    if (roundId !== MOCK_ROUND.round_id) {
      // Fall back to the canonical mock round so the page never 404s in mock mode.
      return { ...MOCK_ROUND, round_id: roundId };
    }
    return MOCK_ROUND;
  }
  try {
    const data = await fetchJson(
      `/rounds/${encodeURIComponent(roundId)}`,
      parseRound,
    );
    lastGood.rounds.set(roundId, data);
    return data;
  } catch (err) {
    warn(`getRound(${roundId}) failed; using last-good cache`, err);
    const cached = lastGood.rounds.get(roundId);
    if (cached) return cached;
    return { ...MOCK_ROUND, round_id: roundId };
  }
}

export function isMockMode(): boolean {
  return MOCK_MODE;
}
