import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeLattice, percolate, clusters } from './model.ts';

test('an L×L lattice has 2·L·(L−1) bonds', () => {
  assert.equal(makeLattice(4, 1).length, 2 * 4 * 3);
});

test('p = 0: nothing open, no spanning, clusters are single nodes', () => {
  const L = 5;
  const s = percolate(L, makeLattice(L, 3), 0);
  assert.equal(s.spanning, false);
  assert.equal(s.largest, 1);
});

test('p = 1: everything open, one cluster spans', () => {
  const L = 5;
  const s = percolate(L, makeLattice(L, 3), 1.0000001);
  assert.equal(s.spanning, true);
  assert.equal(s.largest, L * L);
});

test('union-find joins a hand-built path', () => {
  const r = clusters(4, [
    [0, 1],
    [1, 2],
  ]);
  assert.equal(r[0], r[2]);
  assert.notEqual(r[0], r[3]);
});

test('opening is monotone in p (fixed random numbers)', () => {
  const L = 8;
  const bonds = makeLattice(L, 7);
  const a = percolate(L, bonds, 0.4).openBond.filter(Boolean).length;
  const b = percolate(L, bonds, 0.6).openBond.filter(Boolean).length;
  assert.ok(b >= a);
});
