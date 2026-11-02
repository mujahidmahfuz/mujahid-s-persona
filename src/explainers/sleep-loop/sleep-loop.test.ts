import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NODES, STEPS, GATES, markerAt } from './model.ts';

test('one step per node, in loop order', () => {
  assert.equal(STEPS.length, NODES.length);
  assert.deepEqual(
    NODES.map((n) => n.id),
    ['wake', 'gate', 'tier', 'replay'],
  );
});

test('the three gates documented in the inventory', () => {
  assert.deepEqual(Object.keys(GATES), ['fixed', 'heuristic', 'learned']);
});

test('marker wraps around the loop', () => {
  assert.deepEqual(markerAt(0), markerAt(4));
  assert.deepEqual(markerAt(-1), markerAt(3));
});
