/**
 * Bio text — docs/CONTENT-INVENTORY.md §9 (wording edits only) and §1. No new facts.
 * The long bio must be written by Muja.
 */
export const SHORT_BIO =
  'I am Md Mujahidul Islam, known as Muja — an undergraduate researcher at Tokyo International University working on explainable AI, continual learning and quantum information. My work appears in Knowledge-Based Systems and Quantum Information Processing.';

export const LONG_BIO = 'TODO(muja): 150–250 words in your own voice — why these fields, what question drives you.';

export const INTERESTS = [
  'Machine learning and explainable AI',
  'Quantum computing and quantum networking',
  'Neural networks and neuromorphic computing',
  'Computational biology',
  'Neuroscience and cognitive science',
] as const;

/** From the CV "Technical skills" section. */
export const SKILLS = [
  { label: 'Programming languages', items: ['Python', 'C++', 'JavaScript/TypeScript', 'Dart', 'Rust', 'LaTeX'] },
  { label: 'Machine learning', items: ['PyTorch', 'scikit-learn', 'SHAP', 'optimal transport', 'reinforcement learning'] },
] as const;
