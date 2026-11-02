import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIGS, STEPS, quantumParts } from './model.ts';

test('three hybrid configurations, each with at least one quantum part', () => {
  for (const id of Object.keys(CONFIGS) as (keyof typeof CONFIGS)[]) {
    const q = quantumParts(id);
    assert.ok(q.generator || q.discriminator, id);
  }
  assert.deepEqual(quantumParts('qg'), { generator: true, discriminator: false });
  assert.deepEqual(quantumParts('qd'), { generator: false, discriminator: true });
  assert.deepEqual(quantumParts('both'), { generator: true, discriminator: true });
});

test('four steps of one training round', () => {
  assert.equal(STEPS.length, 4);
});
