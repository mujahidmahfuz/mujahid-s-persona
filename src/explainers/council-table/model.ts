/**
 * LLM Council — the arithmetic of one session, ported line for line from the project's public code
 * (github.com/mujahidmahfuz/LLM-Council, backend/council/ranking.py `aggregate`, `kendall_tau`,
 * `agreement`, and pipeline.py `_review` / `_chairman_ruling`).
 *
 * The seats, the ballot orders and the rankings below are ILLUSTRATIVE — hand-written for this
 * explainer, not output from any model run. Seats are anonymous on purpose: no real model is shown
 * winning or losing.
 */

export const SEATS = ['Seat 1', 'Seat 2', 'Seat 3', 'Seat 4', 'Seat 5'] as const;
export type Seat = (typeof SEATS)[number];

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * What each reviewer is shown in round 2: everyone else's answer, in a shuffled order, labelled
 * Response A, B, C… (pipeline.py `_review`: drop own answer, `shuffler.shuffle(others)`).
 * Fixed here so the figure is reproducible.
 */
export const BALLOT_ORDER: Record<Seat, Seat[]> = {
  'Seat 1': ['Seat 4', 'Seat 2', 'Seat 5', 'Seat 3'],
  'Seat 2': ['Seat 5', 'Seat 3', 'Seat 1', 'Seat 4'],
  'Seat 3': ['Seat 1', 'Seat 4', 'Seat 2', 'Seat 5'],
  'Seat 4': ['Seat 3', 'Seat 1', 'Seat 5', 'Seat 2'],
  'Seat 5': ['Seat 2', 'Seat 4', 'Seat 3', 'Seat 1'],
};

/** Each reviewer's FINAL RANKING, as letters, best first (what `parse_ranking` returns). */
export const LETTER_RANKING: Record<Seat, string[]> = {
  'Seat 1': ['D', 'B', 'C', 'A'], // Seat 3, Seat 2, Seat 5, Seat 4
  'Seat 2': ['B', 'C', 'A', 'D'], // Seat 3, Seat 1, Seat 5, Seat 4
  'Seat 3': ['C', 'A', 'D', 'B'], // Seat 2, Seat 1, Seat 5, Seat 4
  'Seat 4': ['A', 'C', 'D', 'B'], // Seat 3, Seat 5, Seat 2, Seat 1
  'Seat 5': ['C', 'A', 'D', 'B'], // Seat 3, Seat 2, Seat 1, Seat 4
};

/** Letters → seats again (pipeline.py: `by_letter = dict(zip(letters, others))`). */
export function deanonymise(reviewer: Seat): Seat[] {
  const order = BALLOT_ORDER[reviewer];
  return LETTER_RANKING[reviewer].map((l) => order[LETTERS.indexOf(l)]!);
}

export interface LeaderboardEntry {
  model: string;
  /** 1 = ranked first by every reviewer, 0 = ranked last by all; null if nobody ranked it. */
  score: number | null;
  /** 1-based, lower is better. */
  averageRank: number | null;
  votes: number;
}

const round = (x: number, dp: number) => Math.round(x * 10 ** dp) / 10 ** dp;

/**
 * ranking.py `aggregate`: each ranking scores a member 1 − (position − 1)/(n − 1); members nobody
 * ranked get no score and sort last; ties keep seat order (JS sort is stable, like Python's).
 */
export function aggregate(members: readonly string[], rankings: readonly (readonly string[])[]): LeaderboardEntry[] {
  const scores = new Map<string, number[]>(members.map((m) => [m, []]));
  const positions = new Map<string, number[]>(members.map((m) => [m, []]));
  for (const ranking of rankings) {
    const size = ranking.length;
    ranking.forEach((model, i) => {
      const position = i + 1;
      if (!scores.has(model)) return;
      scores.get(model)!.push(size === 1 ? 1 : 1 - (position - 1) / (size - 1));
      positions.get(model)!.push(position);
    });
  }
  const entries = members.map((model) => {
    const s = scores.get(model)!;
    const p = positions.get(model)!;
    return {
      model,
      score: s.length ? round(s.reduce((a, b) => a + b, 0) / s.length, 4) : null,
      averageRank: p.length ? round(p.reduce((a, b) => a + b, 0) / p.length, 2) : null,
      votes: s.length,
    };
  });
  return [...entries].sort(
    (a, b) =>
      Number(a.score === null) - Number(b.score === null) ||
      -(a.score ?? 0) + (b.score ?? 0) ||
      (a.averageRank ?? 0) - (b.averageRank ?? 0),
  );
}

/** ranking.py `kendall_tau`, over the items both rankings contain. */
export function kendallTau(first: readonly string[], second: readonly string[]): number | null {
  const inSecond = new Set(second);
  const shared = first.filter((x) => inSecond.has(x));
  if (shared.length < 2) return null;
  const sharedSet = new Set(shared);
  const pos = new Map(second.filter((x) => sharedSet.has(x)).map((x, i) => [x, i]));
  let concordant = 0;
  let discordant = 0;
  shared.forEach((left, i) => {
    for (const right of shared.slice(i + 1)) {
      if (pos.get(left)! < pos.get(right)!) concordant++;
      else discordant++;
    }
  });
  return (concordant - discordant) / (concordant + discordant);
}

/** ranking.py `agreement`: mean pairwise Kendall τ between reviewers, −1…+1. */
export function agreement(rankings: readonly (readonly string[])[]): number | null {
  const taus: number[] = [];
  rankings.forEach((first, i) => {
    for (const second of rankings.slice(i + 1)) {
      const t = kendallTau(first, second);
      if (t !== null) taus.push(t);
    }
  });
  return taus.length ? round(taus.reduce((a, b) => a + b, 0) / taus.length, 4) : null;
}

export interface Session {
  /** Reviews that parsed, as seat rankings (best first). */
  rankings: { reviewer: Seat; ranking: Seat[] }[];
  discarded: Seat[];
  leaderboard: LeaderboardEntry[];
  winner: string | null;
  agreement: number | null;
  /** pipeline.py `_chairman_ruling`: "chairman", or "fallback" (the top answer, marked) if the chairman fails. */
  verdictSource: 'chairman' | 'fallback';
}

/** One session, with the two failure switches the figure offers. */
export function runSession(opts: { unparseable?: Seat | null; chairmanFails?: boolean } = {}): Session {
  const rankings = SEATS.filter((s) => s !== opts.unparseable).map((reviewer) => ({ reviewer, ranking: deanonymise(reviewer) }));
  const leaderboard = aggregate(
    SEATS,
    rankings.map((r) => r.ranking),
  );
  return {
    rankings,
    discarded: opts.unparseable ? [opts.unparseable] : [],
    leaderboard,
    winner: leaderboard[0]!.score !== null ? leaderboard[0]!.model : null,
    agreement: agreement(rankings.map((r) => r.ranking)),
    verdictSource: opts.chairmanFails ? 'fallback' : 'chairman',
  };
}
