import type { ReactNode } from 'react';

interface Props {
  label: string;
  onReset?: () => void;
  keyboardHelp?: string;
  children: ReactNode;
  controls?: ReactNode;
}

/** Wrapper for 3D scenes: role="img" canvas region, reset button, keyboard help (EXPLAINERS §1). */
export function SceneShell({ label, onReset, keyboardHelp, children, controls }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div role="img" aria-label={label} className="relative min-h-0 flex-1">
        {children}
      </div>
      <div className="flex flex-wrap items-center gap-3 bg-blue-900 px-3 py-2 text-sm text-white" data-surface="dark">
        {controls}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-chip border border-white/60 px-3 py-1 font-semibold hover:border-pink"
          >
            Reset view
          </button>
        )}
        {keyboardHelp && <span className="text-white/85">{keyboardHelp}</span>}
      </div>
    </div>
  );
}
