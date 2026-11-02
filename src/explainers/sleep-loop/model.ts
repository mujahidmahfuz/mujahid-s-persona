/** Structure of the sleep scheduler — CONTENT-INVENTORY §3 / CV only. No numbers. */
export const NODES = [
  { id: 'wake', label: 'Wake: train on the current task', x: 155, y: 70 },
  { id: 'gate', label: 'Gate: sleep now?', x: 550, y: 70 },
  { id: 'tier', label: 'Sleep tier: micro · light · deep', x: 550, y: 250 },
  { id: 'replay', label: 'Replay & consolidate', x: 155, y: 250 },
] as const;

export const GATES = {
  fixed: { name: 'Fixed interval', rule: 'Sleeps on a fixed schedule — the baseline.' },
  heuristic: { name: 'Heuristic gate', rule: 'Sleeps when a rule based on the network’s state says so — the primary result.' },
  learned: { name: 'Learned policy', rule: 'A contextual bandit trained with REINFORCE decides — documented as analysis.' },
} as const;
export type GateId = keyof typeof GATES;

export const STEPS = [
  {
    label: '1 Wake',
    caption: 'The network trains on the current task. Learning new tasks one after another is what causes forgetting.',
  },
  {
    label: '2 Gate',
    caption: 'Between batches the gate decides whether it is time to sleep. The three versions differ only in this decision.',
  },
  {
    label: '3 Sleep',
    caption: 'On Split CIFAR-10 sleep comes in graduated tiers — micro, light or deep — instead of a single kind.',
  },
  {
    label: '4 Replay',
    caption:
      'During sleep earlier experience is replayed and consolidated, then training resumes. Fewer, better-timed sleeps is the goal.',
  },
] as const;

/** Position of the travelling marker for a step (wraps). */
export function markerAt(step: number): { x: number; y: number } {
  const n = NODES[((step % NODES.length) + NODES.length) % NODES.length]!;
  return { x: n.x, y: n.y };
}
