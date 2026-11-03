import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SEATS, BALLOT_ORDER, deanonymise, aggregate, kendallTau, agreement, runSession } from './model.ts';

// Reference values: produced by running the project's own backend/council/ranking.py
// (`aggregate`, `agreement`) on these same rankings, 2026-11-03.

test('a reviewer never sees its own answer, and sees everyone else once', () => {
  for (const s of SEATS) {
    const ballot = BALLOT_ORDER[s];
    assert.ok(!ballot.includes(s));
    assert.equal(new Set(ballot).size, SEATS.length - 1);
  }
});

test('de-anonymised rankings', () => {
  assert.deepEqual(deanonymise('Seat 1'), ['Seat 3', 'Seat 2', 'Seat 5', 'Seat 4']);
  assert.deepEqual(deanonymise('Seat 4'), ['Seat 3', 'Seat 5', 'Seat 2', 'Seat 1']);
});

test('full session matches ranking.py', () => {
  const s = runSession();
  assert.deepEqual(
    s.leaderboard.map((e) => [e.model, e.score, e.averageRank, e.votes]),
    [
      ['Seat 3', 1, 1, 4],
      ['Seat 2', 0.6667, 2, 4],
      ['Seat 1', 0.4167, 2.75, 4],
      ['Seat 5', 0.4167, 2.75, 4],
      ['Seat 4', 0, 4, 4],
    ],
  );
  assert.equal(s.agreement, 0.7333);
  assert.equal(s.winner, 'Seat 3');
  assert.equal(s.verdictSource, 'chairman');
});

test('an unparseable review is discarded, and the result matches ranking.py', () => {
  const s = runSession({ unparseable: 'Seat 4' });
  assert.deepEqual(s.discarded, ['Seat 4']);
  assert.deepEqual(
    s.leaderboard.map((e) => [e.model, e.score, e.averageRank, e.votes]),
    [
      ['Seat 3', 1, 1, 3],
      ['Seat 2', 0.7778, 1.67, 3],
      ['Seat 1', 0.5556, 2.33, 3],
      ['Seat 5', 0.3333, 3, 3],
      ['Seat 4', 0, 4, 4],
    ],
  );
  assert.equal(s.agreement, 1);
});

test('chairman failure falls back to the top answer', () => {
  assert.equal(runSession({ chairmanFails: true }).verdictSource, 'fallback');
});

test('aggregate edge cases: single-item ranking scores 1; unranked members get no score and sort last', () => {
  const lb = aggregate(['a', 'b', 'c'], [['a']]);
  assert.deepEqual(lb[0], { model: 'a', score: 1, averageRank: 1, votes: 1 });
  assert.equal(lb[1]!.score, null);
  assert.deepEqual(
    lb.map((e) => e.model),
    ['a', 'b', 'c'],
  );
});

test('Kendall tau: same order +1, reversed −1, too few shared items null', () => {
  assert.equal(kendallTau(['a', 'b', 'c'], ['a', 'b', 'c']), 1);
  assert.equal(kendallTau(['a', 'b', 'c'], ['c', 'b', 'a']), -1);
  assert.equal(kendallTau(['a', 'b'], ['c', 'a']), null);
  assert.equal(agreement([['a', 'b']]), null);
});
