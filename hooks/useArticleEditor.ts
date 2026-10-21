import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchArticleBySlug } from "@/services/articles";
import {
  NEW_STORY_FIELDS,
  buildAIBrief,
  buildPayload,
  fieldsFromArticle,
  fieldsFromPayload,
  slugFromTitle,
} from "@/lib/editor/fields";
import type { CanonicalArticle } from "@/lib/types";
import { useEditorFields } from "./editor/useEditorFields";
import { useBlockEditing } from "./editor/useBlockEditing";
import { useSavePipeline } from "./editor/useSavePipeline";

export { MAX_TAGS, cleanTag } from "@/lib/editor/tags";
export type { SourceItem } from "@/lib/editor/fields";

export function useArticleEditor(initialSlug?: string | null) {
  const [selectedSlug, setSelectedSlug] = useState<string>(initialSlug || "__new__");
  const [inFlightUploads, setInFlightUploads] = useState(0);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const { fields, setFields, set, slugManual, setSlugManual } = useEditorFields();
  const payload = useMemo(() => buildPayload(fields), [fields]);
  const blockEditing = useBlockEditing(set);
  const save = useSavePipeline({ payload, status: fields.status, storyId: fields.id, set, setSlugManual });
  const { resetForLoad, handleSaveDraft: saveDraft } = save;

  const populateArticleData = useCallback(
    (art: Partial<CanonicalArticle> & Record<string, unknown>) => {
      resetForLoad(typeof art.slug === "string" ? art.slug : "");
      setFields(fieldsFromArticle(art));
      setSlugManual(true);
    },
    [resetForLoad, setFields, setSlugManual]
  );

  useEffect(() => {
    if (!selectedSlug || selectedSlug === "__new__") return;
    fetchArticleBySlug(selectedSlug)
      .then((art) => {
        if (art && art.title) populateArticleData(art);
      })
      .catch((err) => console.warn("fetchArticleBySlug failed:", err));
  }, [selectedSlug, populateArticleData]);

  const handleCreateNewStory = useCallback(() => {
    resetForLoad("");
    setSelectedSlug("__new__");
    setFields(NEW_STORY_FIELDS);
    setSlugManual(false);
    setSaveMessage("Started new story draft");
    setTimeout(() => setSaveMessage(null), 3000);
  }, [resetForLoad, setFields, setSlugManual]);

  const applyPayload = useCallback(
    (p: Partial<CanonicalArticle>) => {
      setFields((prev) => fieldsFromPayload(p, prev.id, prev.status));
      setSlugManual(Boolean(p.slug));
    },
    [setFields, setSlugManual]
  );

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      set.title(newTitle);
      if (!slugManual) set.slug(slugFromTitle(newTitle));
    },
    [set, slugManual]
  );

  const handleSaveDraft = useCallback(
    (opts?: { forceDraft?: boolean }) => {
      setSaveMessage(null);
      return saveDraft(opts);
    },
    [saveDraft]
  );

  const generateAIContext = useCallback(() => buildAIBrief(fields), [fields]);

  return {
    selectedSlug,
    setSelectedSlug,
    currentArticleId: fields.id,
    handleCreateNewStory,

    title: fields.title,
    handleTitleChange,
    subtitle: fields.subtitle,
    setSubtitle: set.subtitle,
    excerpt: fields.excerpt,
    setExcerpt: set.excerpt,
    category: fields.category,
    setCategory: set.category,
    kicker: fields.kicker,
    setKicker: set.kicker,
    slug: fields.slug,
    setSlug: set.slug,
    setSlugManual,
    authorName: fields.authorName,
    setAuthorName: set.authorName,
    authorRole: fields.authorRole,
    setAuthorRole: set.authorRole,
    status: fields.status,
    setStatus: set.status,
    sendWebpushr: fields.sendWebpushr,
    setSendWebpushr: set.sendWebpushr,

    tags: fields.tags,
    addTag: blockEditing.addTag,
    removeTag: blockEditing.removeTag,

    coverUrl: fields.coverUrl,
    setCoverUrl: set.coverUrl,
    coverCaption: fields.coverCaption,
    setCoverCaption: set.coverCaption,
    coverCredit: fields.coverCredit,
    setCoverCredit: set.coverCredit,
    inFlightUploads,
    setInFlightUploads,

    blocks: fields.blocks,
    setBlocks: set.blocks,
    addBlock: blockEditing.addBlock,
    updateBlock: blockEditing.updateBlock,
    moveBlock: blockEditing.moveBlock,
    removeBlock: blockEditing.removeBlock,

    relatedStories: fields.relatedStories,
    addRelatedStory: blockEditing.addRelatedStory,
    updateRelatedStory: blockEditing.updateRelatedStory,
    removeRelatedStory: blockEditing.removeRelatedStory,

    seoTitle: fields.seoTitle,
    setSeoTitle: set.seoTitle,
    seoSlug: fields.seoSlug,
    setSeoSlug: set.seoSlug,
    seoDescription: fields.seoDescription,
    setSeoDescription: set.seoDescription,

    xPost: fields.xPost,
    setXPost: set.xPost,
    fbPost: fields.fbPost,
    setFbPost: set.fbPost,
    liPost: fields.liPost,
    setLiPost: set.liPost,
    nlPost: fields.nlPost,
    setNlPost: set.nlPost,
    sources: fields.sources,
    setSources: set.sources,

    isSubmitting: save.isSubmitting,
    saveMessage,
    autosaveStatus: save.autosaveStatus,
    isDirty: save.isDirty,
    lastSavedAt: save.lastSavedAt,
    saveError: save.saveError,
    markStored: save.markStored,
    savedSlug: save.savedSlug,
    persistForPublish: save.persistForPublish,
    handleSaveDraft,
    currentPayload: payload,
    generateAIContext,
    applyPayload,
  };
}
