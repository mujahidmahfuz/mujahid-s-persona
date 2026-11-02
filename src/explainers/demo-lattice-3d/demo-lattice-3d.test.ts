import { test } from 'node:test';
import assert from 'node:assert/strict';
import { latticePoints, centreIndex } from './math.ts';

test('lattice has n³ points centred on the origin', () => {
  const pts = latticePoints(3);
  assert.equal(pts.length, 27);
  const sum = pts.reduce((s, p) => s + p[0] + p[1] + p[2], 0);
  assert.equal(sum, 0);
  assert.deepEqual(pts[0], [-1, -1, -1]);
});

test('centre of a 3-lattice is (0,0,0)', () => {
  const pts = latticePoints(3);
  assert.deepEqual(pts[centreIndex(pts)], [0, 0, 0]);
});
