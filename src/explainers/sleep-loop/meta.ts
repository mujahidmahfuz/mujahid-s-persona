import type { ExplainerMeta } from '../types';

export const meta: ExplainerMeta = {
  id: 'sleep-loop',
  dim: '2d',
  // Handles reduced motion itself (no autoplay, final step, transitions off), so it stays interactive.
  animated: false,
  illustrative: false,
  description:
    'A loop of four boxes: Wake (train on the current task) → Gate (sleep now?) → Sleep tier (micro, light or deep) → Replay and consolidate → back to Wake. A marker travels around the loop step by step. A switch selects the gate: Fixed interval (a timer, the baseline), Heuristic gate (a rule on the network’s state, the primary result) or Learned policy (a contextual bandit trained with REINFORCE, documented as analysis).',
  howToRead: [
    'Follow the pink marker around the loop, or use the step buttons. Play / Pause controls the animation.',
    'Switch the gate to see what changes: only the decision box differs between the three versions.',
    'Simplified: the gate’s actual rule, the replay buffer and what “tiers” change are not drawn — they are in the paper draft.',
  ],
};
