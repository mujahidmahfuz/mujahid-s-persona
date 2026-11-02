/**
 * Generic QGAN training loop (standard formulation: Lloyd & Weedbrook, PRL 121, 040502 (2018);
 * Dallaire-Demers & Killoran, PRA 98, 012324 (2018)). The QIP survey categorises QGANs by
 * where the quantum part sits (Semantic Scholar summary of the paper). Concept only — no data.
 */
export const CONFIGS = {
  qg: { name: 'Quantum generator', generator: 'quantum', discriminator: 'classical' },
  qd: { name: 'Quantum discriminator', generator: 'classical', discriminator: 'quantum' },
  both: { name: 'Fully quantum', generator: 'quantum', discriminator: 'quantum' },
} as const;
export type ConfigId = keyof typeof CONFIGS;

export const STEPS = [
  {
    label: '1 Generate',
    caption:
      'The generator turns random noise into a candidate sample. In a quantum generator this is a parameterised quantum circuit whose measured output is the sample.',
  },
  { label: '2 Compare', caption: 'The discriminator also sees real samples from the training data.' },
  {
    label: '3 Judge',
    caption: 'The discriminator scores each sample: real or generated? Its accuracy is the signal both players learn from.',
  },
  {
    label: '4 Update',
    caption:
      'Both are updated in opposite directions: the discriminator to tell them apart, the generator to fool it. Repeat until the generated data look real.',
  },
] as const;

/** Which blocks are quantum for a configuration. */
export function quantumParts(c: ConfigId): { generator: boolean; discriminator: boolean } {
  return { generator: CONFIGS[c].generator === 'quantum', discriminator: CONFIGS[c].discriminator === 'quantum' };
}
