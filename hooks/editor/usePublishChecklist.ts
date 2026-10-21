import { useState } from "react";
import type { MissingItem } from "@/components/admin/editor/EditorPublishChecklist";
import type { useArticleEditor } from "@/hooks/useArticleEditor";
import type { usePublishPipeline } from "@/hooks/usePublishPipeline";

type Editor = ReturnType<typeof useArticleEditor>;
type Publish = ReturnType<typeof usePublishPipeline>;

const FIELD_TARGETS: Record<string, string> = {
  title: "story-title",
  category: "story-category",
  cover: "cover-section",
  body: "body-section",
};

const PLACEHOLDER_BODY = "Draft your opening paragraph here...";

function findMissing(editor: Editor): MissingItem[] {
  const list: MissingItem[] = [];
  if (!editor.title.trim()) list.push({ id: "title", problem: "The story has no headline.", action: "Write a headline" });
  if (!editor.category) list.push({ id: "category", problem: "No category is chosen.", action: "Choose a category" });
  if (!editor.coverUrl.trim()) list.push({ id: "cover", problem: "The story has no cover photo.", action: "Add a cover photo" });
  const hasBody = editor.blocks.some((b) => b.type === "paragraph" && b.text.trim() && b.text.trim() !== PLACEHOLDER_BODY);
  if (!hasBody) list.push({ id: "body", problem: "The body has no paragraph with text.", action: "Write a paragraph" });
  return list;
}

export function usePublishChecklist(
  editor: Editor,
  publish: Publish,
  { showStoryTab, flagCoverError }: { showStoryTab: () => void; flagCoverError: (on: boolean) => void }
) {
  const [missing, setMissing] = useState<MissingItem[] | null>(null);

  const goToField = (item: MissingItem) => {
    setMissing(null);
    showStoryTab();
    window.setTimeout(() => {
      const el = document.getElementById(FIELD_TARGETS[item.id]);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = el.matches("input,textarea,select,button")
        ? el
        : el.querySelector<HTMLElement>(item.id === "body" ? "textarea" : "button");
      window.setTimeout(() => (focusable as HTMLElement | null)?.focus({ preventScroll: true }), 350);
    }, 120);
  };

  const handlePublishClick = async () => {
    const problems = findMissing(editor);
    if (problems.length > 0) {
      flagCoverError(!editor.coverUrl.trim());
      setMissing(problems);
      return;
    }
    const ok = await publish.startPublish(editor.currentPayload, {
      inFlightUploads: editor.inFlightUploads,
      coverUrl: editor.coverUrl,
      persist: editor.persistForPublish,
      alreadyLive: editor.status === "published",
    });
    if (ok) editor.markStored({ ...editor.currentPayload, status: "published" });
  };

  return { missing, closeChecklist: () => setMissing(null), goToField, handlePublishClick };
}
