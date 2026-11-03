import type { ExplainerMeta } from '../types';

export const meta: ExplainerMeta = {
  id: 'council-table',
  dim: '2d',
  // Handles reduced motion itself (no autoplay, final step, transitions off), so it stays interactive.
  animated: false,
  illustrative: true,
  description:
    'A round table with five numbered seats and a chairman above it, stepping through one LLM Council session. Step 1: a question at the centre goes to every seat. Step 2: each seat writes its own answer. Step 3: each seat is shown the other four answers with their authors hidden, shuffled and labelled Response A to D; its own answer is left out, and a seat picker shows each seat’s ballot. Step 4: a table lists each reviewer’s ranking of the letters and the seats they map back to; a switch makes Seat 4’s reply unreadable, which removes its review. Step 5: a leaderboard gives every seat a score from 0% to 100%, its average rank and number of votes, plus the reviewers’ agreement as Kendall tau. Step 6: the answers travel to the chairman, best first, who writes the ruling; a switch makes the chairman fail, and the top answer is returned marked as a fallback.',
  howToRead: [
    'Use the step buttons, or Play / Pause. In step 3 pick a seat to see its ballot; in steps 4–6 the switches show what happens when a review cannot be read or the chairman fails.',
    'The seats, ballots and rankings are made up; no real model is shown winning. The arithmetic is the project’s own: scores, average ranks, votes and agreement are computed with a line-for-line port of backend/council/ranking.py and tested against it.',
    'Simplified: answers are drawn as blank cards, and failed members (retried with backoff in the real code) are not shown.',
  ],
};
