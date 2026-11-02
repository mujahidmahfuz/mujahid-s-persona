/** Static facts about an explainer. Lives in <id>/meta.ts — never imports three/react-three. */
export interface ExplainerMeta {
  id: string;
  dim: '2d' | '3d';
  /** Animated explainers do not mount under prefers-reduced-motion (poster stays). */
  animated: boolean;
  /** Toy data → the visible "Illustrative example" label (EXPLAINERS §2.2). */
  illustrative: boolean;
  /** Full text description for screen readers. */
  description: string;
  /** "How to read this" panel, including what is simplified. */
  howToRead: string[];
}

export interface ExplainerProps {
  /** Called once the interactive version is drawn, so the poster can be hidden. */
  onReady?: () => void;
}
