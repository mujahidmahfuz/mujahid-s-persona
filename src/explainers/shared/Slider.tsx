import { useId } from 'react';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}

/** Native range input with a visible label; value text is announced politely. */
export function Slider({ label, value, min, max, step = 1, onChange, format = String }: Props) {
  const id = useId();
  return (
    <div className="flex min-w-48 flex-1 flex-col gap-1">
      <label htmlFor={id} className="flex justify-between text-sm font-semibold text-blue">
        <span>{label}</span>
        <output htmlFor={id} aria-live="polite" className="font-mono font-normal text-ink">
          {format(value)}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={format(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#09318d]"
      />
    </div>
  );
}
