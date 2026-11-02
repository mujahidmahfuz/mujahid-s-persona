import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BLOCKS, FLOW, LINKS, clampStep, linksAreValid } from './model.ts';

test('every link joins documented blocks', () => {
  assert.equal(linksAreValid(), true);
  assert.equal(LINKS.length, 3);
});

test('architecture has exactly the four documented parts', () => {
  assert.deepEqual(
    BLOCKS.map((b) => b.id),
    ['flutter', 'kotlin', 'fastapi', 'groq'],
  );
});

test('flow follows timer → reminders → lock → Save Me and clamps', () => {
  assert.equal(FLOW.length, 4);
  assert.equal(clampStep(-3), 0);
  assert.equal(clampStep(9), 3);
  assert.equal(clampStep(2.7), 2);
});
