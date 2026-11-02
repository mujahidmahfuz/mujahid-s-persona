import { test } from 'node:test';
import assert from 'node:assert/strict';
import { movingAverage, rng, toySignal } from './math.ts';

test('movingAverage matches hand-computed values', () => {
  // k = 3: [1, (1+2)/2, (1+2+3)/3, (2+3+4)/3, (3+4+5)/3]
  assert.deepEqual(movingAverage([1, 2, 3, 4, 5], 3), [1, 1.5, 2, 3, 4]);
  assert.deepEqual(movingAverage([4, 8], 1), [4, 8]);
});

test('movingAverage rejects invalid windows', () => {
  assert.throws(() => movingAverage([1], 0), RangeError);
});

test('rng and toySignal are deterministic', () => {
  assert.equal(rng(1)(), rng(1)());
  assert.deepEqual(toySignal(10), toySignal(10));
  assert.equal(toySignal(50).length, 50);
});
