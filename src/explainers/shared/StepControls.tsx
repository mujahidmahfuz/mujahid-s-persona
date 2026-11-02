interface Props {
  steps: { label: string; caption: string }[];
  current: number;
  onChange: (i: number) => void;
}

/** Step-through mode (EXPLAINERS §1): buttons + caption, instead of scroll-jacking. */
export function StepControls({ steps, current, onChange }: Props) {
  return (
    <div>
      <div role="group" aria-label="Steps" className="flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <button
            key={s.label}
            type="button"
            aria-pressed={i === current}
            onClick={() => onChange(i)}
            className={`rounded-chip border-2 border-blue px-3 py-1 text-sm font-semibold ${i === current ? 'bg-blue text-white' : 'bg-white text-blue'}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="mt-2 text-sm text-ink">
        {steps[current]?.caption}
      </p>
    </div>
  );
}
