import { useCallback } from "react";
import type { ContentBlock, RelatedStory } from "@/lib/types";
import { cleanTag, MAX_TAGS } from "@/lib/editor/tags";
import type { EditorFieldSetters } from "./useEditorFields";

const renumber = <T extends { order_id?: number }>(items: T[]) => items.map((b, i) => ({ ...b, order_id: i + 1 }));

export function useBlockEditing(set: EditorFieldSetters) {
  const addBlock = useCallback(
    (block: ContentBlock, atIndex?: number) => {
      set.blocks((prev) => {
        const copy = [...prev];
        if (typeof atIndex === "number" && atIndex >= 0 && atIndex <= prev.length) copy.splice(atIndex, 0, block);
        else copy.push(block);
        return renumber(copy);
      });
    },
    [set]
  );

  const updateBlock = useCallback(
    (index: number, updated: ContentBlock) => {
      set.blocks((prev) => prev.map((b, i) => (i === index ? { ...updated, order_id: index + 1 } : b)));
    },
    [set]
  );

  const moveBlock = useCallback(
    (index: number, direction: "up" | "down") => {
      set.blocks((prev) => {
        const target = direction === "up" ? index - 1 : index + 1;
        if (target < 0 || target >= prev.length) return prev;
        const copy = [...prev];
        [copy[index], copy[target]] = [copy[target], copy[index]];
        return renumber(copy);
      });
    },
    [set]
  );

  const removeBlock = useCallback(
    (index: number) => set.blocks((prev) => renumber(prev.filter((_, i) => i !== index))),
    [set]
  );

  const addRelatedStory = useCallback(
    (story: RelatedStory) => set.relatedStories((prev) => [...prev, { ...story, order_id: prev.length + 1 }]),
    [set]
  );

  const updateRelatedStory = useCallback(
    (index: number, updated: Partial<RelatedStory>) => {
      set.relatedStories((prev) => prev.map((b, i) => (i === index ? { ...b, ...updated, order_id: index + 1 } : b)));
    },
    [set]
  );

  const removeRelatedStory = useCallback(
    (index: number) => set.relatedStories((prev) => renumber(prev.filter((_, i) => i !== index))),
    [set]
  );

  const addTag = useCallback(
    (newTag: string) => {
      const clean = cleanTag(newTag);
      if (clean) set.tags((prev) => (prev.includes(clean) || prev.length >= MAX_TAGS ? prev : [...prev, clean]));
    },
    [set]
  );

  const removeTag = useCallback((tag: string) => set.tags((prev) => prev.filter((t) => t !== tag)), [set]);

  return { addBlock, updateBlock, moveBlock, removeBlock, addRelatedStory, updateRelatedStory, removeRelatedStory, addTag, removeTag };
}
