import { useCallback, useState } from "react";

export function useAiFilled() {
  const [keys, setKeys] = useState<ReadonlySet<string>>(() => new Set());

  const mark = useCallback((list: string[]) => {
    if (list.length === 0) return;
    setKeys((prev) => {
      const next = new Set(prev);
      list.forEach((k) => next.add(k));
      return next;
    });
  }, []);

  const clear = useCallback((key: string) => {
    setKeys((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const reset = useCallback(() => setKeys(new Set()), []);
  const has = useCallback((key: string) => keys.has(key), [keys]);

  return { keys, has, mark, clear, reset };
}

export type AiFilled = ReturnType<typeof useAiFilled>;
