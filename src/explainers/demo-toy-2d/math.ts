/** Deterministic PRNG (mulberry32) so the toy data and the poster always match. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Trailing moving average: mean of the last min(i + 1, k) values. */
export function movingAverage(values: readonly number[], k: number): number[] {
  if (k < 1 || !Number.isInteger(k)) throw new RangeError('k must be a positive integer');
  const out: number[] = [];
  let sum = 0;
  values.forEach((v, i) => {
    sum += v;
    if (i >= k) sum -= values[i - k]!;
    out.push(sum / Math.min(i + 1, k));
  });
  return out;
}

/** Toy signal: a sine wave plus uniform noise in [-0.5, 0.5). */
export function toySignal(n: number, seed = 7): number[] {
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => Math.sin((i / n) * Math.PI * 4) + (r() - 0.5));
}
