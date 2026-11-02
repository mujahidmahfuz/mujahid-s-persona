import type { ExplainerMeta } from '../types';

export const meta: ExplainerMeta = {
  id: 'demo-lattice-3d',
  dim: '3d',
  animated: true,
  illustrative: true,
  description:
    'A slowly rotating cube of white spheres arranged in a regular 3D grid, with the centre sphere highlighted in pink and labelled. A slider changes the number of spheres per side from 2 to 6.',
  howToRead: [
    'Each white sphere is a lattice site; the pink sphere is the centre site.',
    'Drag to rotate, scroll or use + / − to zoom, arrow keys to rotate, R to reset.',
    'Simplified: a geometric toy for the styleguide — it does not represent any experiment.',
  ],
};
