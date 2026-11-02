import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SLEEP_EVENTS, CIFAR, reduction } from './data.ts';

test('numbers match the source exactly', () => {
  assert.deepEqual(
    SLEEP_EVENTS.bars.map((b) => b.value),
    [555, 239],
  );
  assert.deepEqual(
    CIFAR.bars.map((b) => b.value),
    [0.7926, 0.8665, 0.8733],
  );
});

test('239 vs 555 is the CV’s “57% fewer”', () => {
  assert.equal(Math.round(reduction(239, 555) * 100), 57);
});
