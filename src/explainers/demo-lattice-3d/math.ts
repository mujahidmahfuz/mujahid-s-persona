/** Points of an n×n×n cubic lattice, centred on the origin, with the given spacing. */
export function latticePoints(n: number, spacing = 1): [number, number, number][] {
  if (n < 1 || !Number.isInteger(n)) throw new RangeError('n must be a positive integer');
  const off = ((n - 1) * spacing) / 2;
  const pts: [number, number, number][] = [];
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) pts.push([i * spacing - off, j * spacing - off, k * spacing - off]);
  return pts;
}

/** Index of the point closest to the origin (the highlighted node). */
export function centreIndex(pts: readonly [number, number, number][]): number {
  let best = 0;
  let bestD = Infinity;
  pts.forEach(([x, y, z], i) => {
    const d = x * x + y * y + z * z;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}
