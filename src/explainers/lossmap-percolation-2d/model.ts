/**
 * Bond percolation on an L × L square lattice (nodes at integer points, bonds to right/down
 * neighbours). Each bond gets a fixed uniform random number u; it is open when u < p, so
 * sliding p opens bonds monotonically — the classic way to watch a threshold appear.
 * Exact threshold for the infinite square lattice: p_c = 1/2 (Kesten 1980).
 */
export interface Bond {
  a: number;
  b: number;
  u: number;
  horizontal: boolean;
}

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

export function makeLattice(L: number, seed: number): Bond[] {
  const r = rng(seed);
  const bonds: Bond[] = [];
  for (let y = 0; y < L; y++)
    for (let x = 0; x < L; x++) {
      const i = y * L + x;
      if (x < L - 1) bonds.push({ a: i, b: i + 1, u: r(), horizontal: true });
      if (y < L - 1) bonds.push({ a: i, b: i + L, u: r(), horizontal: false });
    }
  return bonds;
}

/** Union–find with path halving. */
export function clusters(n: number, open: readonly [number, number][]): number[] {
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]!]!;
      x = parent[x]!;
    }
    return x;
  };
  for (const [a, b] of open) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }
  return parent.map((_, i) => find(i));
}

export interface State {
  openBond: boolean[];
  spanning: boolean;
  /** root id of a left–right spanning cluster, or -1 */
  spanRoot: number;
  root: number[];
  largest: number;
}

export function percolate(L: number, bonds: readonly Bond[], p: number): State {
  const openBond = bonds.map((b) => b.u < p);
  const root = clusters(
    L * L,
    bonds.filter((_, i) => openBond[i]).map((b) => [b.a, b.b] as [number, number]),
  );
  const left = new Set(Array.from({ length: L }, (_, y) => root[y * L]!));
  let spanRoot = -1;
  for (let y = 0; y < L; y++) {
    const r = root[y * L + L - 1]!;
    if (left.has(r)) {
      spanRoot = r;
      break;
    }
  }
  const size = new Map<number, number>();
  for (const r of root) size.set(r, (size.get(r) ?? 0) + 1);
  return { openBond, spanning: spanRoot !== -1, spanRoot, root, largest: Math.max(...size.values()) };
}
