/**
 * Placeholder handling — docs/SPEC.md §7.
 * A value is a placeholder if it contains "TODO(muja):". In dev it is shown as a badge;
 * in production builds the element holding it is omitted.
 */
export const TODO_MARK = 'TODO(muja):';

export const IS_PROD: boolean = import.meta.env.PROD;

export function isTodo(value: unknown): boolean {
  if (typeof value === 'string') return value.includes(TODO_MARK);
  if (Array.isArray(value)) return value.some(isTodo);
  if (value && typeof value === 'object') return Object.values(value).some(isTodo);
  return false;
}

/** Text after the marker, for the dev badge. */
export function todoText(value: string): string {
  const i = value.indexOf(TODO_MARK);
  return i === -1 ? value : value.slice(i + TODO_MARK.length).trim();
}

/** Should a field be rendered? False for empty values, and for placeholders in production. */
export function show(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (IS_PROD && isTodo(value)) return false;
  return true;
}

/** Drops placeholder items from a list in production. */
export function visible<T>(items: readonly T[]): T[] {
  return IS_PROD ? items.filter((i) => !isTodo(i)) : [...items];
}
