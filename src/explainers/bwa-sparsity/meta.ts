import type { ExplainerMeta } from '../types';

export const meta: ExplainerMeta = {
  id: 'bwa-sparsity',
  dim: '2d',
  // Handles reduced motion itself (no autoplay, final step, transitions off), so it stays interactive.
  animated: false,
  illustrative: false,
  description:
    'Horizontal bar chart of attribution sparsity (Gini coefficient; higher means sparser), from the BWA preprint. MNIST saliency: BWA-v2 0.645, Vanilla Mean 0.613, budget-matched SmoothGrad 0.584. Golub gene expression with 500 features: BWA-v2 0.417, Vanilla Mean 0.397. With 2000 features: BWA-v2 0.427, Vanilla Mean 0.405. All differences reported as significant after Bonferroni correction.',
  howToRead: [
    'Each bar is one method on one dataset; longer means a sparser, more focused attribution map. Bars start at zero.',
    'BWA-v2 bars are solid deep blue; baselines are light blue with a dashed outline.',
    'Scope: these are the sparse-signal domains. On dense tabular UCI data the paper reports that BWA-v2 ties Vanilla Mean on every metric.',
  ],
};
