import { useState, useEffect, useCallback } from "react";
import { searchTags } from "@/services/articles";

export function useTagSearch(selectedTags: string[], onAddTag: (tag: string) => void) {
  const [tagInput, setTagInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const query = tagInput.trim();
    if (!query) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const list = await searchTags(query);
        setSuggestions(list.filter((t) => !selectedTags.includes(t)));
        setIsOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [tagInput, selectedTags]);

  const addTag = useCallback(
    (tag: string) => {
      const clean = tag.trim().replace(/^#/, "");
      if (clean && !selectedTags.includes(clean)) {
        onAddTag(clean);
      }
      setTagInput("");
      setIsOpen(false);
    },
    [selectedTags, onAddTag]
  );

  return {
    tagInput,
    setTagInput,
    suggestions,
    isOpen,
    setIsOpen,
    addTag,
  };
}
