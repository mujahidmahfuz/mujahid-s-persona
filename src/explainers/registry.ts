/**
 * id → metadata (static) and loader (dynamic import of the island). Only explainer islands
 * import three / @react-three; Astro pages read `metaFor()` only.
 */
import type { ComponentType } from 'react';
import type { ExplainerMeta, ExplainerProps } from './types';

const metaModules = import.meta.glob<{ meta: ExplainerMeta }>('./*/meta.ts', { eager: true });
const loaders = import.meta.glob<{ default: ComponentType<ExplainerProps> }>('./*/index.tsx');

export function metaFor(id: string): ExplainerMeta | undefined {
  return metaModules[`./${id}/meta.ts`]?.meta;
}

export function loaderFor(id: string): (() => Promise<{ default: ComponentType<ExplainerProps> }>) | undefined {
  return loaders[`./${id}/index.tsx`];
}

export const explainerIds = (): string[] => Object.keys(metaModules).map((k) => k.split('/')[1]!);
