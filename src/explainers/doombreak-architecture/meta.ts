import type { ExplainerMeta } from '../types';

export const meta: ExplainerMeta = {
  id: 'doombreak-architecture',
  dim: '2d',
  animated: false,
  illustrative: false,
  description:
    'Two diagrams. Top: the DoomBreak session flow in four steps — session timer, escalating reminders, full-screen lock overlay, and “Save Me” — with the current step highlighted. Bottom: the architecture — the Flutter app exchanges usage data with a Kotlin native layer, and sends coaching requests to a FastAPI service, which calls Llama 3.3 70B on Groq. Selecting a block shows what it does.',
  howToRead: [
    'Use the step buttons to walk through a session; the highlighted box (pink outline, bold label) is the current step.',
    'Select an architecture block to read what it does. Arrows show which parts talk to each other.',
    'Simplified: only components and links listed in the project notes are drawn; internal modules, storage and error paths are omitted.',
  ],
};
