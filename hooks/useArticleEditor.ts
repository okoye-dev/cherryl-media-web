import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { fetchArticleBySlug, saveArticle, patchArticle } from "@/services/articles";
import { changedFields, isEmpty } from "@/lib/diff";
import type {
  ContentBlock,
  PillarCategory,
  PublishingStatus,
  CanonicalArticle,
  RelatedStory,
} from "@/lib/types";

/** How long the person must stop typing before a draft is saved on its own. */
const AUTOSAVE_IDLE_MS = 20000;

export interface SourceItem {
  url: string;
  publisher: string;
  claimSummary?: string;
}

export const MAX_TAGS = 12;
export const MAX_TAG_LENGTH = 40;

/** Tags never carry a "#" and stay short. */
export function cleanTag(raw: string): string {
  return raw.replace(/#/g, "").trim().slice(0, MAX_TAG_LENGTH);
}

/** The payload as a string, without fields that change by themselves (publish time, read time). */
function snapshotOf(p: Partial<CanonicalArticle>): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { publishedAt, readTime, ...rest } = p;
  return JSON.stringify(rest);
}

export function useArticleEditor(initialSlug?: string | null) {
  const [selectedSlug, setSelectedSlug] = useState<string>(initialSlug || "__new__");
  const [currentArticleId, setCurrentArticleId] = useState<string>("");

  // Metadata
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [kicker, setKicker] = useState("NEWSROOM · DESK DISPATCH");
  const [category, setCategory] = useState<PillarCategory>("state-affairs-environs");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [status, setStatus] = useState<PublishingStatus>("draft");
  const [sendWebpushr, setSendWebpushr] = useState(false);
  const [tags, setTags] = useState<string[]>(["Nigeria"]);

  // Media & Cover
  const [coverUrl, setCoverUrl] = useState("");
  const [coverCaption, setCoverCaption] = useState("");
  const [coverCredit, setCoverCredit] = useState("Cherryl Media");
  const [inFlightUploads, setInFlightUploads] = useState(0);

  // Blocks & More Stories
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    {
      order_id: 1,
      type: "paragraph",
      text: "",
      isDropCap: true,
    },
  ]);
  const [relatedStories, setRelatedStories] = useState<RelatedStory[]>([]);

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoSlug, setSeoSlug] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  // Social & Sources
  const [xPost, setXPost] = useState("");
  const [fbPost, setFbPost] = useState("");
  const [liPost, setLiPost] = useState("");
  const [nlPost, setNlPost] = useState("");
  const [sources, setSources] = useState<SourceItem[]>([]);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastAutosavedTime, setLastAutosavedTime] = useState<string | null>(null);

  // Save state: one snapshot of what is stored. "Dirty" means the editor differs from it.
  const [baseline, setBaseline] = useState<string | null>(null);
  const rebaseNext = useRef(true);
  // The address the story is stored under. Empty until the story has been saved once.
  const [savedSlug, setSavedSlugState] = useState("");
  const savedSlugRef = useRef("");
  const storedRef = useRef<Partial<CanonicalArticle> | null>(null);
  const savingRef = useRef(false);
  const setSavedSlug = useCallback((v: string) => {
    savedSlugRef.current = v;
    setSavedSlugState(v);
  }, []);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Populate data when selecting a story
  const populateArticleData = useCallback((art: Partial<CanonicalArticle> & Record<string, unknown>) => {
    rebaseNext.current = true;
    setSaveError(null);
    setSavedSlug(typeof art.slug === "string" ? art.slug : "");
    setCurrentArticleId(typeof art.id === "string" ? art.id : "");
    setTitle(typeof art.title === "string" ? art.title : "");
    setSubtitle(typeof art.subtitle === "string" ? art.subtitle : "");
    setExcerpt(typeof art.excerpt === "string" && art.excerpt ? art.excerpt : (typeof art.deck === "string" ? art.deck : ""));
    setKicker(typeof art.kicker === "string" ? art.kicker : "NEWSROOM · DESK DISPATCH");
    setSlug(typeof art.slug === "string" ? art.slug : "");
    setSlugManual(true);
    setCategory((art.category as PillarCategory) || "state-affairs-environs");

    const authorObj = art.author as { name?: string; role?: string } | undefined;
    setAuthorName(authorObj?.name || "");
    setAuthorRole(authorObj?.role || "");
    setStatus((art.status as PublishingStatus) || "published");

    const featImg = art.featuredImage as { url?: string; caption?: string; credit?: string } | undefined;
    setCoverUrl(featImg?.url || "");
    setCoverCaption(featImg?.caption || "");
    setCoverCredit(featImg?.credit || "Cherryl Media");

    setSendWebpushr(Boolean(art.send_webpushr));
    setTags(Array.isArray(art.tags) ? art.tags.map(cleanTag).filter(Boolean).slice(0, MAX_TAGS) : []);

    const rawBlocks = Array.isArray(art.body) ? (art.body as ContentBlock[]) : [];
    setBlocks(rawBlocks.map((b, i) => ({ ...b, order_id: b.order_id || i + 1 })));

    const rawRelated = Array.isArray(art.related_stories) ? (art.related_stories as RelatedStory[]) : [];
    setRelatedStories(rawRelated.map((b, i) => ({ ...b, order_id: b.order_id || i + 1 })));

    setSeoTitle(typeof art.seo_title === "string" ? art.seo_title : "");
    setSeoSlug(typeof art.seo_slug === "string" ? art.seo_slug : "");
    setSeoDescription(typeof art.seo_description === "string" ? art.seo_description : "");

    const social = (art.socialVariants || art.channelVariants) as Record<string, string> | undefined;
    setXPost(social?.x || "");
    setFbPost(social?.facebook || "");
    setLiPost(social?.linkedin || "");
    setNlPost(social?.newsletter || "");

    const rawSources = ((art.sources || art.sourceLinks) as Array<{
      url?: string;
      publisher?: string;
      sourceName?: string;
      claimSummary?: string;
    }>) || [];
    setSources(
      rawSources.map((s) => ({
        url: s.url || "",
        publisher: s.publisher || s.sourceName || "Source Gazette",
        claimSummary: s.claimSummary || "",
      }))
    );
  }, [setSavedSlug]);

  const handleCreateNewStory = useCallback(() => {
    rebaseNext.current = true;
    setSaveError(null);
    setSavedSlug("");
    setSelectedSlug("__new__");
    setCurrentArticleId("");
    setTitle("");
    setSubtitle("");
    setExcerpt("");
    setKicker("NEWSROOM · DESK DISPATCH");
    setSlug("");
    setSlugManual(false);
    setCategory("state-affairs-environs");
    setAuthorName("");
    setAuthorRole("");
    setStatus("draft");
    setCoverUrl("");
    setCoverCaption("");
    setCoverCredit("Cherryl Media");
    setSendWebpushr(false);
    setTags(["Nigeria"]);
    setBlocks([
      {
        order_id: 1,
        type: "paragraph",
        isDropCap: true,
        text: "Draft your opening paragraph here...",
      },
    ]);
    setRelatedStories([]);
    setSeoTitle("");
    setSeoSlug("");
    setSeoDescription("");
    setXPost("");
    setFbPost("");
    setLiPost("");
    setNlPost("");
    setSources([]);
    setSaveMessage("Started new story draft");
    setTimeout(() => setSaveMessage(null), 3000);
  }, [setSavedSlug]);

  // Load a saved snapshot (the same shape as currentPayload) back into the editor.
  // Additive: used by the Versions panel to restore a draft.
  const applyPayload = useCallback((p: Partial<CanonicalArticle>) => {
    const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
    const nextTitle = str(p.title);
    const nextSlug = str(p.slug);
    const nextExcerpt = str(p.excerpt) || str(p.deck);
    setTitle(nextTitle);
    setSubtitle(str(p.subtitle));
    setExcerpt(nextExcerpt === str(p.subtitle) ? "" : nextExcerpt);
    setKicker(str(p.kicker, "NEWSROOM · DESK DISPATCH"));
    setSlug(nextSlug);
    setSlugManual(Boolean(nextSlug));
    setCategory((p.category as PillarCategory) || "state-affairs-environs");
    setAuthorName(p.author?.name || "");
    setAuthorRole(p.author?.role || "");
    setCoverUrl(p.featuredImage?.url || "");
    setCoverCaption(p.featuredImage?.caption || "");
    setCoverCredit(p.featuredImage?.credit || "Cherryl Media");
    setSendWebpushr(Boolean(p.send_webpushr));
    setTags(Array.isArray(p.tags) ? p.tags.map(cleanTag).filter(Boolean).slice(0, MAX_TAGS) : []);
    const rawBlocks = Array.isArray(p.body) ? p.body : [];
    setBlocks(
      rawBlocks.length > 0
        ? rawBlocks.map((b, i) => ({ ...b, order_id: i + 1 }))
        : [{ order_id: 1, type: "paragraph", text: "", isDropCap: true }]
    );
    const rawRelated = Array.isArray(p.related_stories) ? p.related_stories : [];
    setRelatedStories(rawRelated.map((b, i) => ({ ...b, order_id: i + 1 })));
    // Payload SEO fields fall back to the title, slug and excerpt, so only keep real overrides
    setSeoTitle(p.seo_title && p.seo_title !== p.title ? p.seo_title : "");
    setSeoSlug(p.seo_slug && p.seo_slug !== p.slug ? p.seo_slug : "");
    setSeoDescription(
      p.seo_description && p.seo_description !== (p.excerpt || p.subtitle) ? p.seo_description : ""
    );
    const social = p.socialVariants;
    setXPost(social?.x || "");
    setFbPost(social?.facebook || "");
    setLiPost(social?.linkedin || "");
    setNlPost(social?.newsletter || "");
    setSources(
      (p.sources || []).map((s) => ({
        url: s.url || "",
        publisher: s.sourceName || "",
        claimSummary: s.claimSummary || "",
      }))
    );
  }, []);

  // Load article by selected slug
  useEffect(() => {
    if (!selectedSlug || selectedSlug === "__new__") return;

    fetchArticleBySlug(selectedSlug)
      .then((art) => {
        if (art && art.title) {
          populateArticleData(art);
        }
      })
      .catch((err) => {
        console.warn("fetchArticleBySlug failed:", err);
      });
  }, [selectedSlug, populateArticleData]);

  // Title sync to slug
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setTitle(newTitle);
      if (!slugManual) {
        const auto = newTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 90)
          .replace(/-+$/g, "");
        setSlug(auto);
      }
    },
    [slugManual]
  );

  // Build Payload
  const currentPayload = useMemo<Partial<CanonicalArticle>>(() => {
    const sequencedBlocks = blocks.map((b, i) => ({ ...b, order_id: i + 1 }));
    const sequencedRelated = relatedStories.map((b, i) => ({ ...b, order_id: i + 1 }));

    return {
      id: currentArticleId || undefined,
      title,
      subtitle,
      excerpt: excerpt || subtitle,
      deck: excerpt || subtitle,
      kicker,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category,
      categoryName: category.replace(/-/g, " ").toUpperCase(),
      author: {
        name: authorName,
        role: authorRole,
      },
      featuredImage: {
        url: coverUrl,
        caption: coverCaption,
        credit: coverCredit,
      },
      readTime: "4 min read",
      status,
      send_webpushr: sendWebpushr,
      tags,
      seo_title: seoTitle || title,
      seo_slug: seoSlug || slug,
      seo_description: seoDescription || excerpt || subtitle,
      body: sequencedBlocks,
      related_stories: sequencedRelated,
      socialVariants: {
        x: xPost,
        facebook: fbPost,
        linkedin: liPost,
        newsletter: nlPost,
      },
      sources: sources.map((s) => ({
        sourceName: s.publisher,
        url: s.url,
        claimSummary: s.claimSummary || "",
      })),
      publishedAt: new Date().toISOString(),
    };
  }, [
    currentArticleId,
    title,
    subtitle,
    excerpt,
    kicker,
    slug,
    category,
    authorName,
    authorRole,
    status,
    coverUrl,
    coverCaption,
    coverCredit,
    sendWebpushr,
    tags,
    seoTitle,
    seoSlug,
    seoDescription,
    blocks,
    relatedStories,
    xPost,
    fbPost,
    liPost,
    nlPost,
    sources,
  ]);

  // Autosave only starts once the person has typed something. Opening a story, or filling it in from
  // an AI lead, must never write to the database by itself.
  const touchedRef = useRef(false);
  useEffect(() => {
    const mark = () => {
      touchedRef.current = true;
    };
    const events = ["input", "change", "keydown"] as const;
    events.forEach((e) => document.addEventListener(e, mark, true));
    return () => events.forEach((e) => document.removeEventListener(e, mark, true));
  }, []);

  // Take the first snapshot after a load or a new story
  useEffect(() => {
    if (rebaseNext.current) {
      rebaseNext.current = false;
      storedRef.current = currentPayload;
      setBaseline(snapshotOf(currentPayload));
    }
  }, [currentPayload]);

  const isDirty = useMemo(
    () => baseline !== null && snapshotOf(currentPayload) !== baseline,
    [baseline, currentPayload]
  );

  const messageOf = (err: unknown) => (err instanceof Error && err.message ? err.message : "The server did not answer");

  /** Remember that this payload is what the server now holds. */
  const markStored = useCallback(
    (payload: Partial<CanonicalArticle>, newId?: string) => {
      if (newId && !currentArticleId) setCurrentArticleId(newId);
      if (payload.status) setStatus(payload.status);
      const stored = { ...payload, id: payload.id || newId || undefined };
      storedRef.current = stored;
      setBaseline(snapshotOf(stored));
      setLastSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setSaveError(null);
    },
    [currentArticleId]
  );

  /**
   * Save to the server. A story never saved before is created in full. After that only the fields that
   * changed since the last stored copy are sent. Nothing is sent when nothing changed.
   * Throws the server's message on failure. Returns the story's address.
   */
  const runSave = useCallback(
    async (wanted: PublishingStatus, verify: boolean): Promise<{ slug: string; sent: boolean }> => {
      if (savingRef.current) throw new Error("A save is already running.");
      savingRef.current = true;
      try {
        const payload = { ...currentPayload, status: wanted };
        const titleOk = (t?: string) => (t || "").trim() === (payload.title || "").trim();

        if (!savedSlugRef.current) {
          // First save of a new story: create it. A story always starts as a draft.
          const created = await saveArticle({ ...payload, status: wanted === "published" ? "draft" : wanted });
          const slug = created?.slug || String(payload.slug);
          if (verify) {
            const fresh = created?.title ? created : await fetchArticleBySlug(slug);
            if (!titleOk(fresh?.title)) throw new Error("The server did not return the title you saved. Your text is still here, try saving again.");
          }
          setSavedSlug(slug);
          // From now on the address stays put, even if the title changes
          setSlugManual(true);
          if (slug !== payload.slug) setSlug(slug);
          markStored({ ...payload, slug, status: wanted === "published" ? "draft" : wanted }, created?.id);
          return { slug, sent: true };
        }

        const changes = changedFields(storedRef.current, payload, ["publishedAt"]) as Record<string, unknown>;
        delete changes.id;
        delete changes.createdAt;
        delete changes.publishedAt;
        if (changes.status === "published") delete changes.status; // going live is the publish step
        if (isEmpty(changes)) return { slug: savedSlugRef.current, sent: false };

        const res = await patchArticle(savedSlugRef.current, changes as Partial<CanonicalArticle>);
        if (verify && res.article && !titleOk(res.article.title)) {
          throw new Error("The server did not return the title you saved. Your text is still here, try saving again.");
        }
        const slug = res.article?.slug || (typeof changes.slug === "string" ? changes.slug : savedSlugRef.current);
        setSavedSlug(slug);
        markStored({ ...(storedRef.current || {}), ...changes, id: storedRef.current?.id } as Partial<CanonicalArticle>);
        return { slug, sent: true };
      } finally {
        savingRef.current = false;
      }
    },
    [currentPayload, markStored, setSavedSlug]
  );

  // Debounced autosave: drafts only, only when something changed, only after the person typed.
  // It saves once the person has stopped for this long (the timer restarts with every change).
  useEffect(() => {
    if (!title.trim() || !touchedRef.current || !isDirty || status !== "draft" || isSubmitting) return;

    const timer = setTimeout(async () => {
      setAutosaveStatus("saving");
      try {
        await runSave("draft", false);
        setAutosaveStatus("saved");
      } catch (err) {
        setSaveError(messageOf(err));
        setAutosaveStatus("idle");
      }
    }, AUTOSAVE_IDLE_MS);

    return () => clearTimeout(timer);
  }, [title, status, isDirty, isSubmitting, runSave]);

  // Autosave waits a while, so warn before leaving with changes that are not stored yet.
  useEffect(() => {
    if (!isDirty || !touchedRef.current) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  // Explicit save. A live story stays live. The server's reply is checked against what was sent.
  const handleSaveDraft = useCallback(
    async (opts?: { forceDraft?: boolean }): Promise<boolean> => {
      setIsSubmitting(true);
      setSaveError(null);
      setSaveMessage(null);
      const keepLive = status === "published" && opts?.forceDraft !== true;
      try {
        await runSave(keepLive ? "published" : "draft", true);
        return true;
      } catch (err) {
        setSaveError(messageOf(err));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [status, runSave]
  );

  /** Used by publishing: store any unsaved changes first and give back the story's address. */
  const persistForPublish = useCallback(async (): Promise<string> => {
    const { slug } = await runSave(status === "published" ? "published" : "draft", false);
    return slug;
  }, [status, runSave]);

  // Block Manipulation Handlers
  const addBlock = useCallback((block: ContentBlock, atIndex?: number) => {
    setBlocks((prev) => {
      const copy = [...prev];
      if (typeof atIndex === "number" && atIndex >= 0 && atIndex <= prev.length) {
        copy.splice(atIndex, 0, block);
      } else {
        copy.push(block);
      }
      return copy.map((b, i) => ({ ...b, order_id: i + 1 }));
    });
  }, []);

  const updateBlock = useCallback((index: number, updated: ContentBlock) => {
    setBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...updated, order_id: index + 1 } : b))
    );
  }, []);

  const moveBlock = useCallback((index: number, direction: "up" | "down") => {
    setBlocks((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((b, i) => ({ ...b, order_id: i + 1 }));
    });
  }, []);

  const removeBlock = useCallback((index: number) => {
    setBlocks((prev) =>
      prev.filter((_, i) => i !== index).map((b, i) => ({ ...b, order_id: i + 1 }))
    );
  }, []);

  // Related Stories Handlers
  const addRelatedStory = useCallback((story: RelatedStory) => {
    setRelatedStories((prev) => [...prev, { ...story, order_id: prev.length + 1 }]);
  }, []);

  const updateRelatedStory = useCallback((index: number, updated: Partial<RelatedStory>) => {
    setRelatedStories((prev) =>
      prev.map((b, i) => (i === index ? { ...b, ...updated, order_id: index + 1 } : b))
    );
  }, []);

  const removeRelatedStory = useCallback((index: number) => {
    setRelatedStories((prev) =>
      prev.filter((_, i) => i !== index).map((b, i) => ({ ...b, order_id: i + 1 }))
    );
  }, []);

  // Tag Handlers
  const addTag = useCallback((newTag: string) => {
    const clean = cleanTag(newTag);
    if (clean) {
      setTags((prev) => (prev.includes(clean) || prev.length >= MAX_TAGS ? prev : [...prev, clean]));
    }
  }, []);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  }, []);

  // AI Review Brief Generator
  const generateAIContext = useCallback(() => {
    return `# EDITORIAL CONTEXT & SOURCE BRIEF FOR FACT-CHECKING / REFINEMENT

## TITLE: ${title}
## SUBTITLE: ${subtitle}
## EXCERPT / DECK: ${excerpt}
## CATEGORY: ${category}
## AUTHOR: ${authorName} (${authorRole})
## TAGS: ${tags.join(", ") || "None"}

### PRIMARY SOURCES & CITATIONS:
${sources.map((s, i) => `${i + 1}. **${s.publisher}**\n   - URL: ${s.url}\n   - Verified Claim: ${s.claimSummary || "Primary report"}`).join("\n\n") || "No external sources attached yet."}

### FULL ARTICLE BODY:
${blocks.map((b) => {
  if (b.type === "paragraph") return `[#${b.order_id}] ${b.text}`;
  if (b.type === "heading") return `[#${b.order_id}] ### ${b.text}`;
  if (b.type === "quote") return `[#${b.order_id}] > "${b.quote}"\n> — ${b.author} (${b.context})`;
  if (b.type === "external_link") return `[#${b.order_id}] [Link: ${b.title} - ${b.url}]`;
  if (b.type === "internal_link") return `[#${b.order_id}] [Internal Story: ${b.title} - ${b.slug}]`;
  if (b.type === "image") return `[#${b.order_id}] [Photo: ${b.caption || b.alt} (${b.src})]`;
  return "";
}).filter(Boolean).join("\n\n")}

### SOCIAL MEDIA CHANNELS DRAFTS:
- X / Twitter: ${xPost || "None drafted yet"}
- Facebook: ${fbPost || "None drafted yet"}
- LinkedIn: ${liPost || "None drafted yet"}
- Newsletter: ${nlPost || "None drafted yet"}
`;
  }, [title, subtitle, excerpt, category, authorName, authorRole, tags, sources, blocks, xPost, fbPost, liPost, nlPost]);

  return {
    // Catalogue
    selectedSlug,
    setSelectedSlug,
    currentArticleId,
    handleCreateNewStory,

    // Core Fields
    title,
    handleTitleChange,
    subtitle,
    setSubtitle,
    excerpt,
    setExcerpt,
    category,
    setCategory,
    kicker,
    setKicker,
    slug,
    setSlug,
    setSlugManual,
    authorName,
    setAuthorName,
    authorRole,
    setAuthorRole,
    status,
    setStatus,
    sendWebpushr,
    setSendWebpushr,

    // Tags
    tags,
    addTag,
    removeTag,

    // Cover
    coverUrl,
    setCoverUrl,
    coverCaption,
    setCoverCaption,
    coverCredit,
    setCoverCredit,
    inFlightUploads,
    setInFlightUploads,

    // Blocks
    blocks,
    setBlocks,
    addBlock,
    updateBlock,
    moveBlock,
    removeBlock,

    // More Stories
    relatedStories,
    addRelatedStory,
    updateRelatedStory,
    removeRelatedStory,

    // SEO
    seoTitle,
    setSeoTitle,
    seoSlug,
    setSeoSlug,
    seoDescription,
    setSeoDescription,

    // Social & Sources
    xPost,
    setXPost,
    fbPost,
    setFbPost,
    liPost,
    setLiPost,
    nlPost,
    setNlPost,
    sources,
    setSources,

    // Status & Actions
    isSubmitting,
    saveMessage,
    autosaveStatus,
    lastAutosavedTime,
    isDirty,
    lastSavedAt,
    saveError,
    markStored,
    savedSlug,
    persistForPublish,
    handleSaveDraft,
    currentPayload,
    generateAIContext,
    applyPayload,
  };
}
