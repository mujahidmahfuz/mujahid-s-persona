import type { ExplainerMeta } from '../types';

export const meta: ExplainerMeta = {
  id: 'qgan-loop',
  dim: '2d',
  // Handles reduced motion itself (no autoplay, final step, transitions off), so it stays interactive.
  animated: false,
  illustrative: true,
  description:
    'A diagram of one training round of a generative adversarial network with quantum parts. Noise goes into a generator, which produces a sample; the discriminator receives that sample and a real one, scores whether each is real, and both networks are updated in opposite directions. A switch chooses where the quantum part sits: a quantum generator with a classical discriminator, a classical generator with a quantum discriminator, or both quantum. Quantum blocks are drawn with a pink outline and a small circuit symbol.',
  howToRead: [
    'Follow the moving dots: pink is a generated sample, white is real data. Step buttons and Play / Pause control the animation.',
    'Use the switch to move the quantum part between generator and discriminator.',
    'General concept, not a figure from the paper: the survey’s own taxonomy and the details of each architecture are in the paper.',
  ],
};
