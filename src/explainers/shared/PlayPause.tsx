interface Props {
  playing: boolean;
  onToggle: () => void;
  atEnd: boolean;
}

/** WCAG 2.2.2: anything that moves on its own can be paused. */
export function PlayPause({ playing, onToggle, atEnd }: Props) {
  const label = playing ? 'Pause' : atEnd ? 'Replay' : 'Play';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={playing}
      className="inline-flex items-center gap-1.5 rounded-chip border-2 border-blue bg-white px-3 py-1 text-sm font-semibold text-blue transition-colors duration-150 hover:bg-blue-050"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        {playing ? (
          <path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" />
        ) : atEnd ? (
          <path d="M6 1a5 5 0 1 0 5 5h-1.6A3.4 3.4 0 1 1 6 2.6V5l3-3-3-3z" fill="currentColor" />
        ) : (
          <path d="M2 1l9 5-9 5z" fill="currentColor" />
        )}
      </svg>
      {label}
    </button>
  );
}
