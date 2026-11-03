import type { ExplainerMeta } from '../types';

export const meta: ExplainerMeta = {
  id: 'bwa-collapse',
  dim: '2d',
  // Handles reduced motion itself (no autoplay, final step, transitions off), so it stays interactive.
  animated: false,
  illustrative: true,
  description:
    'A four-step animation with toy numbers. Step 1: six bootstrap replicates each give an attribution over eight features, shown as rows of bars above or below a baseline; four features change sign between replicates. Step 2: averaging the rows (the Euclidean mean) leaves the stable features but shrinks the sign-flipping ones to almost nothing, so the averaged explanation is much shorter than a typical replicate. Step 3: BWA treats each replicate’s magnitudes as a probability distribution over features and keeps the signs separately. Step 4: the distributions are combined into one consensus profile by an entropic Wasserstein barycenter and each feature’s sign is put to a binomial sign test; features whose sign is not consistent are marked as abstained instead of silently shrinking.',
  howToRead: [
    'Bars above the line are positive attributions, bars below are negative. Abstained features are drawn as dashed outlines with a question mark.',
    'Use the step buttons, or Play / Pause. Each step’s caption explains what changed.',
    'The numbers are made up, but the arithmetic is the method’s. Step 4’s profile is the entropic Wasserstein barycenter of the six replicates, computed with the paper’s Algorithm 1 (ε = 0.01, as in the reference code) and checked against the POT library’s ot.barycenter. The toy has no feature data, so the ground cost is the reference code’s “euclidean” option (distance between feature positions) instead of its default correlation cost. The consensus is rescaled to the replicates’ average L2 norm, as in the reference code. The sign test uses α = 0.05 and abstains on inconsistent features. BWA-v2 replaces the hard sign test with a magnitude-weighted Bayesian soft sign; that variant is described in the text, not drawn.',
  ],
};
