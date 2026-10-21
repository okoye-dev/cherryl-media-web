/**
 * Works out what changed between the last saved version of something and the current one,
 * so a save can send just the changes instead of the whole object.
 */

function same(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => same(v, b[i]));
  }
  const ao = a as Record<string, unknown>;
  const bo = b as Record<string, unknown>;
  const keys = new Set([...Object.keys(ao), ...Object.keys(bo)]);
  for (const k of keys) if (!same(ao[k], bo[k])) return false;
  return true;
}

/**
 * Top level changes: every key whose value differs, with the whole new value (so a changed list is sent whole).
 * Keys named in `ignore` are never compared (for example a timestamp that changes on every render).
 */
export function changedFields<T extends object>(prev: T | null | undefined, next: T, ignore: string[] = []): Partial<T> {
  const out: Record<string, unknown> = {};
  const p = (prev ?? {}) as Record<string, unknown>;
  for (const [k, v] of Object.entries(next as Record<string, unknown>)) {
    if (ignore.includes(k)) continue;
    if (!same(p[k], v)) out[k] = v;
  }
  return out as Partial<T>;
}

/** Nested changes: for objects of objects (like the site text), only the leaf fields that differ. */
export function changedNested<T extends Record<string, Record<string, unknown>>>(
  prev: T | null | undefined,
  next: T
): { [K in keyof T]?: Partial<T[K]> } {
  const out: Record<string, Record<string, unknown>> = {};
  for (const [group, fields] of Object.entries(next)) {
    for (const [k, v] of Object.entries(fields)) {
      if (!same(prev?.[group]?.[k], v)) (out[group] ??= {})[k] = v;
    }
  }
  return out as { [K in keyof T]?: Partial<T[K]> };
}

export const isEmpty = (o: object) => Object.keys(o).length === 0;
export { same as deepEqual };
