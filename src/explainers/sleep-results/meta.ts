import type { ExplainerMeta } from '../types';

export const meta: ExplainerMeta = {
  id: 'sleep-results',
  dim: '2d',
  // Handles reduced motion itself (no autoplay, final step, transitions off), so it stays interactive.
  animated: false,
  illustrative: false,
  description:
    'Two bar charts. First: on Binary-MNIST, the fixed-interval schedule used 555 sleep events and the heuristic gate used 239 — about 57% fewer — with accuracy maintained. Second: on Split CIFAR-10 (multi-head), average accuracy was 0.7926 with no sleep, 0.8665 with fixed deep sleep and 0.8733 with adaptive graduated sleep. These are single-run numbers; a 5-seed confirmation is pending.',
  howToRead: [
    'Each bar is one schedule; the solid deep-blue bar is the adaptive / heuristic schedule. Bars start at zero.',
    'Top: fewer sleep events for the same accuracy is better. Bottom: higher average accuracy across tasks is better.',
    'Caution: single-run results; the 5-seed run may change them. Fixed deep sleep and adaptive differ by less than one point.',
  ],
};
