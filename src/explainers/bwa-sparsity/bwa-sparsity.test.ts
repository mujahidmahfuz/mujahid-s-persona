import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GROUPS, frac } from './data.ts';

test('values match the preprint abstract exactly', () => {
  const flat = GROUPS.flatMap((g) => g.bars.map((b) => `${g.setting}|${b.method}|${b.gini}`));
  assert.deepEqual(flat, [
    'N = 100, d = 784|BWA-v2|0.645',
    'N = 100, d = 784|Vanilla Mean|0.613',
    'N = 100, d = 784|SmoothGrad (budget-matched)|0.584',
    'N = 72, d = 500|BWA-v2|0.417',
    'N = 72, d = 500|Vanilla Mean|0.397',
    'N = 72, d = 2000|BWA-v2|0.427',
    'N = 72, d = 2000|Vanilla Mean|0.405',
  ]);
});

test('bars are drawn from zero', () => {
  assert.equal(frac(0), 0);
  assert.equal(frac(0.7), 1);
  assert.ok(Math.abs(frac(0.35) - 0.5) < 1e-12);
});
