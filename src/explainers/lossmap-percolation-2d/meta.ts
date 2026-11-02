import type { ExplainerMeta } from '../types';

export const meta: ExplainerMeta = {
  id: 'lossmap-percolation-2d',
  dim: '2d',
  // Handles reduced motion itself (the sweep is skipped), so it stays interactive.
  animated: false,
  illustrative: true,
  description:
    'A 20 by 20 square lattice of nodes joined by bonds. Each bond is open with probability p, set with a slider. Open bonds are drawn dark blue, closed bonds faint. When a connected cluster of open bonds reaches from the left edge to the right edge, that cluster is drawn in pink and the readout says the lattice spans. Spanning appears around p = 0.5, the exact threshold of the infinite square lattice.',
  howToRead: [
    'Move the slider, or press Sweep to raise p from 0.30 to 0.70. Watch for the pink spanning cluster to appear.',
    'Each bond keeps the same random number, so raising p only ever opens more bonds. New lattice draws fresh random numbers.',
    'Simplified: a 20 × 20 toy lattice, not the engine or the loss maps from the project. On a small lattice the crossing point varies from draw to draw around 0.5; E001 estimated the threshold precisely with the project’s own engine.',
  ],
};
