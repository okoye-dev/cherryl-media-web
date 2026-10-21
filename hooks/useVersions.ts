import { useCallback, useEffect, useRef, useState } from "react";
import type { CanonicalArticle } from "@/lib/types";

export interface StoryVersion {
  id: string;
  label: string;
  kind: "ai" | "mine";
  savedAt: string;
  payload: Partial<CanonicalArticle>;
}

export const MAX_VERSIONS = 10;
const PREFIX = "cherryl:versions:";

function read(key: string): StoryVersion[] {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data.filter((v) => v && typeof v.id === "string" && v.payload) : [];
  } catch {
    return [];
  }
}

function write(key: string, list: StoryVersion[]): boolean {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

function trim(list: StoryVersion[]): StoryVersion[] {
  const next = [...list];
  while (next.length > MAX_VERSIONS) {
    let idx = -1;
    let oldest = Infinity;
    next.forEach((v, i) => {
      const t = Date.parse(v.savedAt) || 0;
      if (v.kind === "mine" && t < oldest) {
        oldest = t;
        idx = i;
      }
    });
    if (idx < 0) break;
    next.splice(idx, 1);
  }
  return next;
}

export function useVersions(storeKey: string) {
  const [versions, setVersions] = useState<StoryVersion[]>([]);
  const [storageFailed, setStorageFailed] = useState(false);
  const listRef = useRef<StoryVersion[]>([]);
  const keyRef = useRef(storeKey);

  useEffect(() => {
    keyRef.current = storeKey;
    const list = read(storeKey);
    listRef.current = list;
    setVersions(list);
  }, [storeKey]);

  const commit = useCallback((next: StoryVersion[]) => {
    listRef.current = next;
    setVersions(next);
    setStorageFailed(!write(keyRef.current, next));
  }, []);

  const save = useCallback(
    (kind: StoryVersion["kind"], label: string, payload: Partial<CanonicalArticle>) => {
      const snapshot: StoryVersion = {
        id: `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        label,
        kind,
        savedAt: new Date().toISOString(),
        payload: JSON.parse(JSON.stringify(payload)),
      };
      commit(trim([snapshot, ...listRef.current]));
      return snapshot;
    },
    [commit]
  );

  const remove = useCallback(
    (id: string) => commit(listRef.current.filter((v) => v.id !== id)),
    [commit]
  );

  const hasAi = versions.some((v) => v.kind === "ai");
  const hasAiNow = useCallback(() => listRef.current.some((v) => v.kind === "ai"), []);
  return { versions, hasAi, hasAiNow, save, remove, storageFailed };
}
