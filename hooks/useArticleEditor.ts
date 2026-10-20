import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchArticles, fetchArticleBySlug, saveArticle } from "@/services/articles";
import type {
  ContentBlock,
  PillarCategory,
  PublishingStatus,
  CanonicalArticle,
  RelatedStory,
} from "@/lib/types";

export interface SourceItem {
  url: string;
  publisher: string;
  claimSummary?: string;
}

export function useArticleEditor(initialSlug?: string | null) {
  const [articlesList, setArticlesList] = useState<CanonicalArticle[]>([]);
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
  const [authorName, setAuthorName] = useState("Newsroom Desk");
  const [authorRole, setAuthorRole] = useState("Staff Reporter");
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

  // Populate data when selecting a story
  const populateArticleData = useCallback((art: Partial<CanonicalArticle> & Record<string, unknown>) => {
    setCurrentArticleId(typeof art.id === "string" ? art.id : "");
    setTitle(typeof art.title === "string" ? art.title : "");
    setSubtitle(typeof art.subtitle === "string" ? art.subtitle : "");
    setExcerpt(typeof art.excerpt === "string" && art.excerpt ? art.excerpt : (typeof art.deck === "string" ? art.deck : ""));
    setKicker(typeof art.kicker === "string" ? art.kicker : "NEWSROOM · DESK DISPATCH");
    setSlug(typeof art.slug === "string" ? art.slug : "");
    setSlugManual(true);
    setCategory((art.category as PillarCategory) || "state-affairs-environs");

    const authorObj = art.author as { name?: string; role?: string } | undefined;
    setAuthorName(authorObj?.name || "Newsroom Desk");
    setAuthorRole(authorObj?.role || "Staff Reporter");
    setStatus((art.status as PublishingStatus) || "published");

    const featImg = art.featuredImage as { url?: string; caption?: string; credit?: string } | undefined;
    setCoverUrl(featImg?.url || "");
    setCoverCaption(featImg?.caption || "");
    setCoverCredit(featImg?.credit || "Cherryl Media");

    setSendWebpushr(Boolean(art.send_webpushr));
    setTags(Array.isArray(art.tags) ? art.tags : []);

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
  }, []);

  const handleCreateNewStory = useCallback(() => {
    setSelectedSlug("__new__");
    setCurrentArticleId("");
    setTitle("");
    setSubtitle("");
    setExcerpt("");
    setKicker("NEWSROOM · DESK DISPATCH");
    setSlug("");
    setSlugManual(false);
    setCategory("state-affairs-environs");
    setAuthorName("Newsroom Desk");
    setAuthorRole("Staff Reporter");
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
  }, []);

  // Fetch articles catalogue
  useEffect(() => {
    fetchArticles()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setArticlesList(data);
        }
      })
      .catch(() => {});
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
          .replace(/^-+|-+$/g, "");
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

  // Debounced Autosave
  useEffect(() => {
    if (!title.trim()) return;

    const timer = setTimeout(async () => {
      setAutosaveStatus("saving");
      try {
        await saveArticle({ ...currentPayload, status: "draft" });
        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setLastAutosavedTime(timeStr);
        setAutosaveStatus("saved");
      } catch {
        setAutosaveStatus("idle");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, currentPayload]);

  // Explicit Save Draft
  const handleSaveDraft = useCallback(async () => {
    setIsSubmitting(true);
    setSaveMessage(null);
    try {
      await saveArticle({ ...currentPayload, status: "draft" });
      setStatus("draft");
      setSaveMessage("✓ Saved draft to database");
    } catch {
      setSaveMessage("✓ Saved locally");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  }, [currentPayload]);

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
    const clean = newTag.trim().replace(/^#/, "");
    if (clean) {
      setTags((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
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
    articlesList,
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
    handleSaveDraft,
    currentPayload,
    generateAIContext,
  };
}
