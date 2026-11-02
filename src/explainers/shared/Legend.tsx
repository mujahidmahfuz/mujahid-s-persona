export interface LegendItem {
  label: string;
  color: string;
  /** Shape carries meaning too — never colour alone (DESIGN §1). */
  shape: 'circle' | 'square' | 'line' | 'dashed';
}

export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="flex flex-wrap gap-4 text-sm text-ink" aria-label="Legend">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          <svg width="18" height="12" aria-hidden="true">
            {i.shape === 'circle' && <circle cx="9" cy="6" r="5" fill={i.color} />}
            {i.shape === 'square' && <rect x="3" y="1" width="10" height="10" fill={i.color} />}
            {i.shape === 'line' && <line x1="0" y1="6" x2="18" y2="6" stroke={i.color} strokeWidth="3" />}
            {i.shape === 'dashed' && <line x1="0" y1="6" x2="18" y2="6" stroke={i.color} strokeWidth="3" strokeDasharray="4 3" />}
          </svg>
          {i.label}
        </li>
      ))}
    </ul>
  );
}
