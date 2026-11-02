import type { ExplainerMeta } from '../types';

export const meta: ExplainerMeta = {
  id: 'demo-toy-2d',
  dim: '2d',
  animated: false,
  illustrative: true,
  description:
    'A line chart of 60 noisy toy points around a sine wave (blue dots) and a pink line showing their trailing moving average. A slider sets the averaging window from 1 to 15 points; wider windows give a smoother line.',
  howToRead: [
    'Blue circles are toy data points; the pink line is the moving average.',
    'Move the "Window" slider: a larger window averages more points and smooths the line.',
    'Simplified: the data are generated, not measured — this demo only shows how the explainer system works.',
  ],
};
