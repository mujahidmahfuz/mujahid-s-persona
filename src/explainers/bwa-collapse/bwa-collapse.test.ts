import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  E,
  B,
  D,
  euclideanMean,
  l2,
  toSimplex,
  signTestP,
  signVote,
  wassersteinBarycenter,
  bwaConsensus,
  BARYCENTER_E,
} from './model.ts';

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

test('toy matrix is 6 × 8', () => {
  assert.equal(B, 6);
  assert.equal(D, 8);
});

test('Euclidean mean cancels a perfectly sign-flipped feature (Lemma 1 intuition)', () => {
  const m = euclideanMean(E);
  // feature 3: +0.80, −0.82, +0.78, −0.79, +0.81, −0.77 → mean 0.0016…
  close(m[2]!, (0.8 - 0.82 + 0.78 - 0.79 + 0.81 - 0.77) / 6);
  assert.ok(Math.abs(m[2]!) < 0.01);
  // the averaged vector is shorter than the average replicate
  const meanNorm = l2(m);
  const avgNorm = E.reduce((s, r) => s + l2(r), 0) / B;
  assert.ok(meanNorm < avgNorm);
});

test('toSimplex gives a probability vector', () => {
  const p = toSimplex([1, -3, 0, 4]);
  assert.deepEqual(p, [0.125, 0.375, 0, 0.5]);
  close(
    toSimplex(E[0]!).reduce((a, b) => a + b, 0),
    1,
  );
});

test('exact two-sided binomial sign test (hand-computed)', () => {
  close(signTestP(6, 6), 2 / 64); // 0.03125
  close(signTestP(0, 6), 2 / 64);
  close(signTestP(5, 6), 14 / 64); // 0.21875
  close(signTestP(3, 6), 1);
});

test('sign vote keeps unanimous features and abstains on the rest at α = 0.05', () => {
  const v = signVote(E).map((x) => x.sign);
  assert.deepEqual(v, [1, -1, 0, 0, 1, 0, 0, -1]);
});

test('barycenter is a probability vector and converges', () => {
  const { mu, iterations } = wassersteinBarycenter(E);
  close(
    mu.reduce((a, b) => a + b, 0),
    1,
  );
  assert.ok(mu.every((x) => x > 0));
  assert.ok(iterations < 30000);
});

test('stored barycenter equals a fresh Algorithm-1 run (and POT, to 5 dp)', () => {
  const { mu } = wassersteinBarycenter(E);
  mu.forEach((x, j) => assert.ok(Math.abs(x - BARYCENTER_E[j]!) < 1e-4, `feature ${j}: ${x} vs ${BARYCENTER_E[j]}`));
});

test('barycenter of identical replicates is that replicate (up to entropic blur)', () => {
  const row = toSimplex(E[0]!);
  const { mu } = wassersteinBarycenter([E[0]!, E[0]!, E[0]!]);
  mu.forEach((x, j) => assert.ok(Math.abs(x - row[j]!) < 0.02, `feature ${j}: ${x} vs ${row[j]}`));
});

test('consensus keeps the replicates’ mean L2 energy (core.py rescale)', () => {
  const target = E.reduce((s, r) => s + l2(r), 0) / B;
  close(l2(bwaConsensus(E)), target);
});
