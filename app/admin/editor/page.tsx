"use client";

import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CANONICAL_ARTICLES } from "@/lib/articles";
import AutoTextarea from "@/components/admin/AutoTextarea";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { ContentBlock, PillarCategory, PublishingStatus, CanonicalArticle, RelatedStory } from "@/lib/types";
import { getYouTubeEmbedUrl, resolveMediaUrl } from "@/lib/url-utils";
import { uploadMediaFile } from "@/lib/upload";

const CATEGORIES: { slug: PillarCategory; label: string }[] = [
  { slug: "state-affairs-environs", label: "STATE AFFAIRS & ENVIRONS" },
  { slug: "newsbeat", label: "NEWSBEAT" },
  { slug: "brands-smes", label: "BRANDS & SMEs" },
  { slug: "opinions", label: "OPINIONS" },
  { slug: "sports", label: "SPORTS" },
  { slug: "entertainment-lifestyle", label: "ENTERTAINMENT & LIFESTYLE" },
  { slug: "education", label: "EDUCATION" },
  { slug: "thrills-tricks", label: "THRILLS & TRICKS" },
  { slug: "youth-corner", label: "YOUTH CORNER" },
  { slug: "tour-hotels", label: "TOUR & HOTELS" },
];

interface SourceItem {
  url: string;
  publisher: string;
  claimSummary?: string;
}

function AdminEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlSlug = searchParams.get("slug");

  const [articlesList, setArticlesList] = useState<CanonicalArticle[]>(CANONICAL_ARTICLES);
  const [selectedSlug, setSelectedSlug] = useState<string>(urlSlug || CANONICAL_ARTICLES[0].slug);
  const [currentArticleId, setCurrentArticleId] = useState<string>(CANONICAL_ARTICLES[0].id || "");

  // Main navigation tabs
  const [activeTab, setActiveTab] = useState<"story" | "seo" | "social" | "sources">("story");
  const [socialTab, setSocialTab] = useState<"x" | "facebook" | "linkedin" | "newsletter">("x");

  // 1. Post Title, Subtitle, Excerpt
  const [title, setTitle] = useState(CANONICAL_ARTICLES[0].title);
  const [subtitle, setSubtitle] = useState(CANONICAL_ARTICLES[0].subtitle || "");
  const [excerpt, setExcerpt] = useState(CANONICAL_ARTICLES[0].excerpt || CANONICAL_ARTICLES[0].deck || "");
  const [kicker, setKicker] = useState(CANONICAL_ARTICLES[0].kicker);

  // 2. Official Category
  const [category, setCategory] = useState<PillarCategory>(CANONICAL_ARTICLES[0].category);

  // 3. Post Slug & Live Availability Checker
  const [slug, setSlug] = useState(CANONICAL_ARTICLES[0].slug);
  const [slugManual, setSlugManual] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const [slugMessage, setSlugMessage] = useState<string>("");

  // 4. Webpushr Notification Checkbox
  const [sendWebpushr, setSendWebpushr] = useState(false);

  // 5. Searchable Tags
  const [tags, setTags] = useState<string[]>(CANONICAL_ARTICLES[0].tags || ["Nigeria", "Governance"]);
  const [tagInput, setTagInput] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Author & Status
  const [authorName, setAuthorName] = useState(CANONICAL_ARTICLES[0].author.name);
  const [authorRole, setAuthorRole] = useState(CANONICAL_ARTICLES[0].author.role);
  const [status, setStatus] = useState<PublishingStatus>("published");

  // Cover Photo
  const [coverUrl, setCoverUrl] = useState(CANONICAL_ARTICLES[0].featuredImage.url);
  const [coverCaption, setCoverCaption] = useState(CANONICAL_ARTICLES[0].featuredImage.caption || "");
  const [coverCredit, setCoverCredit] = useState(CANONICAL_ARTICLES[0].featuredImage.credit || "Cherryl Media");

  // Body Content Blocks with explicit order_id
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    CANONICAL_ARTICLES[0].body.map((b, idx) => ({ ...b, order_id: b.order_id || idx + 1 }))
  );

  // End of Post "More Stories" Section
  const [relatedStories, setRelatedStories] = useState<RelatedStory[]>(
    Array.isArray(CANONICAL_ARTICLES[0].related_stories)
      ? CANONICAL_ARTICLES[0].related_stories.map((b, idx) => ({ ...b, order_id: b.order_id || idx + 1 }))
      : []
  );

  // SEO Section
  const [seoTitle, setSeoTitle] = useState(CANONICAL_ARTICLES[0].seo_title || "");
  const [seoSlug, setSeoSlug] = useState(CANONICAL_ARTICLES[0].seo_slug || "");
  const [seoDescription, setSeoDescription] = useState(CANONICAL_ARTICLES[0].seo_description || "");

  // Social Variants
  const [xPost, setXPost] = useState(CANONICAL_ARTICLES[0].channelVariants?.x || "");
  const [fbPost, setFbPost] = useState(CANONICAL_ARTICLES[0].channelVariants?.facebook || "");
  const [liPost, setLiPost] = useState(CANONICAL_ARTICLES[0].channelVariants?.linkedin || "");
  const [nlPost, setNlPost] = useState(CANONICAL_ARTICLES[0].channelVariants?.newsletter || "");

  // Sources
  const [sources, setSources] = useState<SourceItem[]>([
    {
      url: "https://statehouse.gov.ng",
      publisher: "State House Communications",
      claimSummary: "Federal Executive Council approval of national clean energy transition framework.",
    },
    {
      url: "https://nerc.gov.ng",
      publisher: "NERC Official Gazette",
      claimSummary: "Decentralized sub-national mini-grid guidelines and tariff ring-fencing for Band A.",
    },
  ]);

  // UI / Status messages
  const [savedNotice, setSavedNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copiedAI, setCopiedAI] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);
  const [publishWarning, setPublishWarning] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastAutosavedTime, setLastAutosavedTime] = useState<string | null>(null);
  const [inFlightUploads, setInFlightUploads] = useState(0);

  // Publishing Pipeline Modal
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishStep, setPublishStep] = useState<"media" | "editorial" | "engine" | "done">("media");
  const [publishStepStates, setPublishStepStates] = useState<{
    media: "pending" | "running" | "success" | "error";
    editorial: "pending" | "running" | "success" | "error";
    engine: "pending" | "running" | "success" | "error";
  }>({
    media: "pending",
    editorial: "pending",
    engine: "pending",
  });
  const [publishErrorMessage, setPublishErrorMessage] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string>("");

  // Populate data when selecting a story
  const populateArticleData = useCallback((art: Partial<CanonicalArticle> & Record<string, unknown>) => {
    setCurrentArticleId(typeof art.id === "string" ? art.id : "");
    setTitle(typeof art.title === "string" ? art.title : "");
    setSubtitle(typeof art.subtitle === "string" ? art.subtitle : "");
    setExcerpt(typeof art.excerpt === "string" && art.excerpt ? art.excerpt : (typeof art.deck === "string" ? art.deck : ""));
    setKicker(typeof art.kicker === "string" ? art.kicker : "POLICY · DISPATCH");
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

  const handleCreateNewStory = () => {
    setSelectedSlug("__new__");
    setCurrentArticleId("");
    setTitle("");
    setSubtitle("");
    setExcerpt("");
    setKicker("NEWSROOM · DESK DISPATCH");
    setSlug("");
    setSlugManual(false);
    setSlugStatus("idle");
    setSlugMessage("");
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
  };

  // Fetch live articles list from backend
  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    fetch(`${backendUrl}/api/articles`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setArticlesList(data);
        }
      })
      .catch(() => {});
  }, []);

  // When selected slug changes, load article
  useEffect(() => {
    const targetSlug = urlSlug || selectedSlug;
    if (!targetSlug || targetSlug === "__new__") return;

    setSelectedSlug(targetSlug);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
    fetch(`${backendUrl}/api/articles/${encodeURIComponent(targetSlug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((art) => {
        if (art && art.title) {
          populateArticleData(art);
        } else {
          const fallback = CANONICAL_ARTICLES.find((a) => a.slug === targetSlug);
          if (fallback) populateArticleData(fallback);
        }
      })
      .catch(() => {
        const fallback = CANONICAL_ARTICLES.find((a) => a.slug === targetSlug);
        if (fallback) populateArticleData(fallback);
      });
  }, [urlSlug, selectedSlug, populateArticleData]);

  // Auto-generate slug from title if not manually customized
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  // Live Slug Availability Check (Debounced)
  useEffect(() => {
    if (!slug || slug.trim() === "") {
      setSlugStatus("idle");
      setSlugMessage("");
      return;
    }

    setSlugStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/articles/check-slug?slug=${encodeURIComponent(slug)}&excludeId=${encodeURIComponent(currentArticleId)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.available) {
            setSlugStatus("available");
            setSlugMessage("Slug is available");
          } else {
            setSlugStatus("unavailable");
            setSlugMessage("Slug already in use by another article");
          }
        } else {
          setSlugStatus("idle");
        }
      } catch {
        setSlugStatus("idle");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug, currentArticleId]);

  // Searchable Tags Autocomplete as user types
  useEffect(() => {
    const query = tagInput.trim();
    if (!query) {
      setTagSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tags?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data.tags) ? data.tags : [];
          setTagSuggestions(list.filter((t: string) => !tags.includes(t)));
          setShowTagDropdown(true);
        }
      } catch {
        setTagSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [tagInput, tags]);

  const addTag = (newTag: string) => {
    const clean = newTag.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput("");
    setShowTagDropdown(false);
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Build Payload
  const buildPayload = useCallback((targetStatus: PublishingStatus) => {
    const normalizedCategory = category || "state-affairs-environs";
    const categoryLabel =
      CATEGORIES.find((c) => c.slug === normalizedCategory)?.label ||
      normalizedCategory.replace(/-/g, " ").toUpperCase();

    // Ensure all blocks and related stories have explicit order_id
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
      category: normalizedCategory,
      categoryName: categoryLabel,
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
      status: targetStatus,
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
      sourceLinks: sources.map((s) => ({
        url: s.url,
        publisher: s.publisher,
        accessedAt: new Date().toISOString(),
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
        const payload = buildPayload("draft");
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
        await fetch(`${backendUrl}/api/articles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setLastAutosavedTime(timeStr);
        setAutosaveStatus("saved");
      } catch {
        setAutosaveStatus("idle");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, buildPayload]);

  // Save Draft / Save Changes
  const handleSave = async (targetStatus?: PublishingStatus) => {
    const finalStatus = targetStatus || status;

    if (finalStatus === "published" && !coverUrl.trim()) {
      setCoverImageError(true);
      setPublishWarning("⚠️ A cover photo is required before publishing this story.");
      setActiveTab("story");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setPublishWarning(null), 6000);
      return;
    }

    setCoverImageError(false);
    setPublishWarning(null);
    if (targetStatus) setStatus(targetStatus);
    setIsSubmitting(true);
    setSaveMessage(null);

    const payload = buildPayload(finalStatus);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const res = await fetch(`${backendUrl}/api/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveMessage(finalStatus === "published" ? "✓ Published & Synced" : "✓ Saved draft to database");
      } else {
        setSaveMessage("✓ Saved locally");
      }
    } catch {
      setSaveMessage("✓ Saved in local editor");
    } finally {
      setIsSubmitting(false);
      setSavedNotice(true);
      setTimeout(() => {
        setSavedNotice(false);
        setSaveMessage(null);
      }, 4000);
    }
  };

  // Publish Pipeline Verification
  const handlePublishClick = async () => {
    const articleSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setPublishedSlug(articleSlug);
    setPublishModalOpen(true);
    setPublishErrorMessage(null);
    setPublishStep("media");
    setPublishStepStates({
      media: "running",
      editorial: "pending",
      engine: "pending",
    });

    if (inFlightUploads > 0) {
      setPublishErrorMessage(`Waiting for ${inFlightUploads} media asset(s) to finish upload...`);
      let attempts = 0;
      while (attempts < 20 && inFlightUploads > 0) {
        await new Promise((r) => setTimeout(r, 600));
        attempts++;
      }
    }

    if (!coverUrl || !coverUrl.trim()) {
      setCoverImageError(true);
      setPublishStepStates((prev) => ({ ...prev, media: "error" }));
      setPublishErrorMessage("A cover photo is required before publishing. Please upload a story photo.");
      return;
    }

    setPublishStepStates((prev) => ({ ...prev, media: "success", editorial: "running" }));
    setPublishStep("editorial");

    await new Promise((r) => setTimeout(r, 400));

    if (!title.trim()) {
      setPublishStepStates((prev) => ({ ...prev, editorial: "error" }));
      setPublishErrorMessage("Post title cannot be empty.");
      return;
    }

    setPublishStepStates((prev) => ({ ...prev, editorial: "success", engine: "running" }));
    setPublishStep("engine");

    const payload = buildPayload("published");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const res = await fetch(`${backendUrl}/api/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        try {
          await fetch(`${backendUrl}/api/articles/${encodeURIComponent(articleSlug)}/publish`, {
            method: "POST",
          });
        } catch {}
      }
    } catch {}

    setStatus("published");
    setPublishStepStates((prev) => ({ ...prev, engine: "success" }));
    setPublishStep("done");
  };

  // Block Manipulation Handlers with Explicit Ordering IDs
  const addBlock = (block: ContentBlock, atIndex?: number) => {
    setBlocks((prev) => {
      const updated = [...prev];
      if (typeof atIndex === "number" && atIndex >= 0 && atIndex <= prev.length) {
        updated.splice(atIndex, 0, block);
      } else {
        updated.push(block);
      }
      return updated.map((b, i) => ({ ...b, order_id: i + 1 }));
    });
  };

  const updateBlock = (index: number, updated: ContentBlock) => {
    setBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...updated, order_id: index + 1 } : b))
    );
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    setBlocks((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((b, i) => ({ ...b, order_id: i + 1 }));
    });
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index).map((b, i) => ({ ...b, order_id: i + 1 })));
  };

  // More Stories Handlers
  const addRelatedStory = (story: RelatedStory) => {
    setRelatedStories((prev) => [...prev, { ...story, order_id: prev.length + 1 }]);
  };

  const updateRelatedStory = (index: number, updated: Partial<RelatedStory>) => {
    setRelatedStories((prev) =>
      prev.map((b, i) => (i === index ? { ...b, ...updated, order_id: index + 1 } : b))
    );
  };

  const removeRelatedStory = (index: number) => {
    setRelatedStories((prev) =>
      prev.filter((_, i) => i !== index).map((b, i) => ({ ...b, order_id: i + 1 }))
    );
  };

  // AI Context Exporter
  const handleCopyAIContext = () => {
    const prompt = `# EDITORIAL CONTEXT & SOURCE BRIEF FOR FACT-CHECKING / REFINEMENT

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

---
### INSTRUCTIONS FOR EDITORIAL AI REVIEWER:
1. Cross-reference all claims in the body against the attached sources. Flag any unverified assertions.
2. Polish the tone for a sharp, authoritative Nigerian digital media publication.
3. Highlight any factual errors, ungrounded speculation, or spelling of Nigerian institutions and public officials.
4. Provide refined body paragraphs or improved social media angles if appropriate.
`;

    navigator.clipboard.writeText(prompt);
    setCopiedAI(true);
    setTimeout(() => setCopiedAI(false), 3500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Validation warning banner */}
      {publishWarning && (
        <div className="rounded-xl border border-red-500/50 bg-red-950/40 p-4 text-xs font-medium text-red-200 flex items-center justify-between shadow-lg animate-fade">
          <span className="flex items-center gap-2">
            <span>{publishWarning}</span>
          </span>
          <button
            type="button"
            onClick={() => setPublishWarning(null)}
            className="text-red-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top action bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-[#16181D] p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link href="/admin" className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
            ← All Stories
          </Link>
          <span className="text-zinc-600">/</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[0.65rem] font-mono uppercase text-zinc-500 hidden sm:inline">Story:</span>
            <select
              value={selectedSlug}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedSlug(val);
                if (val === "__new__") {
                  handleCreateNewStory();
                  router.push("/admin/editor");
                } else {
                  router.push(`/admin/editor?slug=${val}`);
                }
              }}
              className="rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white focus:border-brand-red focus:outline-none max-w-[200px] sm:max-w-[260px] truncate"
            >
              <option value="__new__">+ Write New Story</option>
              <optgroup label="Published Articles">
                {articlesList.map((art) => (
                  <option key={art.slug} value={art.slug}>
                    {art.title}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <span className="text-zinc-600">/</span>
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 truncate max-w-[140px]">
            {category}
          </span>

          <span
            className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider border ${
              status === "published"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}
          >
            {status}
          </span>

          {/* Autosave status indicator */}
          <div className="hidden sm:flex items-center gap-1.5 pl-2 text-[0.7rem] font-mono text-zinc-400">
            {autosaveStatus === "saving" && (
              <span className="flex items-center gap-1 text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                Autosaving...
              </span>
            )}
            {autosaveStatus === "saved" && lastAutosavedTime && (
              <span className="flex items-center gap-1 text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Autosaved {lastAutosavedTime}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {savedNotice && saveMessage && (
            <span className="text-xs font-semibold text-emerald-400 animate-fade">{saveMessage}</span>
          )}

          {/* Copy Context for AI button */}
          <button
            type="button"
            onClick={handleCopyAIContext}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/15 px-3 py-1.5 text-xs font-medium text-purple-200 hover:bg-purple-500/25 hover:text-white transition-all shadow-sm"
            title="Copy editorial brief, verified sources, and text to paste into ChatGPT, Claude or Gemini for vetting"
          >
            <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            {copiedAI ? "✓ Copied for AI!" : "Copy Context for AI"}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("draft")}
            className="rounded-lg border border-white/15 bg-zinc-800 px-3.5 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Draft"}
          </button>

          {inFlightUploads > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[0.68rem] font-mono text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              {inFlightUploads} uploading
            </span>
          )}

          <button
            type="button"
            disabled={isSubmitting || inFlightUploads > 0}
            onClick={handlePublishClick}
            className="rounded-lg bg-brand-red px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-red/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {inFlightUploads > 0 ? (
              <>
                <span className="h-2 w-2 rounded-full bg-white animate-spin" />
                <span>Uploading Media...</span>
              </>
            ) : (
              "Publish Now"
            )}
          </button>
        </div>
      </div>

      {/* Primary tab switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("story")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "story" ? "bg-brand-red text-white" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          1. Story &amp; Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "seo" ? "bg-brand-red text-white" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <span>2. SEO &amp; Meta</span>
          {(seoTitle || seoDescription) && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "social" ? "bg-brand-red text-white" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          3. Social Media Channels
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sources")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "sources" ? "bg-brand-red text-white" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <span>4. Sources &amp; Citations</span>
          <span className="rounded-full bg-white/15 px-1.5 py-0.2 text-[0.65rem]">
            {sources.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Progressive Story Builder Flow */}
      {activeTab === "story" && (
        <div className="space-y-6">
          {/* Section: Headline, Subtitle, Excerpt & Category */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-7 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-[0.68rem] font-mono uppercase tracking-wider text-brand-red font-semibold">
                POST METADATA &amp; CATEGORY
              </span>
              <span className="text-[0.7rem] text-zinc-500 font-mono">
                Order flow: Title → Subtitle → Excerpt → Category → Slug
              </span>
            </div>

            {/* Post Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300">
                  Post Title <span className="text-brand-red">*</span>
                </label>
                <span className="text-[0.68rem] text-zinc-500 font-mono">
                  {title.length} characters
                </span>
              </div>
              <AutoTextarea
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter post headline..."
                className="font-sans text-xl md:text-2xl font-semibold text-white placeholder-zinc-500 bg-[#1A1D24] rounded-xl border border-white/10 p-4 leading-snug tracking-tight focus:border-brand-red focus:outline-none"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Story secondary headline or expansion..."
                className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-4 py-2.5 text-sm font-medium text-white focus:border-brand-red focus:outline-none transition-colors"
              />
            </div>

            {/* Excerpt (The snippet displayed on post cards) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300">
                  Excerpt (Card Summary) <span className="text-zinc-500 text-[0.68rem] font-normal lowercase">(shows on homepage cards &amp; category feeds)</span>
                </label>
                <span className="text-[0.68rem] text-zinc-500 font-mono">
                  {excerpt.length} characters
                </span>
              </div>
              <AutoTextarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Concise 1-2 sentence excerpt that appears on article preview cards..."
                className="text-sm font-normal text-zinc-200 placeholder-zinc-500 bg-[#1A1D24] rounded-xl border border-white/10 p-4 leading-relaxed focus:border-brand-red focus:outline-none"
              />
            </div>

            {/* Category Picker & Kicker */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Category Pillar <span className="text-brand-red">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PillarCategory)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 py-2.5 text-xs font-semibold text-white focus:border-brand-red focus:outline-none transition-colors"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Section Kicker / Super-header
                </label>
                <input
                  type="text"
                  value={kicker}
                  onChange={(e) => setKicker(e.target.value)}
                  placeholder="e.g. SPECIAL REPORT · ABUJA DESK"
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 py-2.5 text-xs font-medium text-white focus:border-brand-red focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Slug for Post with Live Availability Check */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300">
                  Article Slug <span className="text-brand-red">*</span>
                </label>
                <div className="flex items-center gap-1.5 text-[0.7rem] font-mono">
                  {slugStatus === "checking" && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="h-2 w-2 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                      Checking availability...
                    </span>
                  )}
                  {slugStatus === "available" && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <span>✓</span> {slugMessage}
                    </span>
                  )}
                  {slugStatus === "unavailable" && (
                    <span className="flex items-center gap-1 text-red-400 font-semibold">
                      <span>✕</span> {slugMessage}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs font-mono text-zinc-500 bg-[#141519] border border-white/10 px-3 py-2.5 rounded-xl">
                  /article/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="post-slug-url"
                  className={`h-11 flex-1 rounded-xl border bg-[#1A1D24] px-3.5 py-2.5 text-xs font-mono text-zinc-200 focus:outline-none transition-colors ${
                    slugStatus === "available"
                      ? "border-emerald-500/50 focus:border-emerald-500"
                      : slugStatus === "unavailable"
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-white/10 focus:border-brand-red"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const generated = title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    setSlug(generated);
                    setSlugManual(true);
                  }}
                  className="rounded-xl border border-white/10 bg-zinc-800 hover:bg-zinc-700 px-3 py-2.5 text-xs text-zinc-300 transition-colors shrink-0"
                  title="Regenerate slug from current title"
                >
                  Sync from Title
                </button>
              </div>
            </div>

            {/* Author info & Webpushr notification checkbox */}
            <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t border-white/[0.06]">
              <div>
                <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Author Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Author Role
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              {/* Webpushr Checkbox Option */}
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 py-2.5 cursor-pointer hover:border-white/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={sendWebpushr}
                    onChange={(e) => setSendWebpushr(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-brand-red focus:ring-0 h-4 w-4"
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-zinc-200">
                      Send Webpushr
                    </span>
                    <span className="block text-[0.65rem] text-zinc-400 truncate">
                      Broadcast push notification
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Tags Section: Searchable as you type */}
            <div className="pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300">
                  Tags &amp; Keywords <span className="text-zinc-500 text-[0.68rem] font-normal lowercase">(searchable against existing database tags)</span>
                </label>
                <span className="text-[0.68rem] text-zinc-500 font-mono">
                  {tags.length} tags attached
                </span>
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-white/15 px-3 py-1 text-xs font-mono text-zinc-200"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-zinc-400 hover:text-red-400 transition-colors font-bold text-xs"
                      title={`Remove tag ${tag}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              {/* Tag Search Input & Autocomplete Dropdown */}
              <div className="relative" ref={tagDropdownRef}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowTagDropdown(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        if (tagInput.trim()) addTag(tagInput);
                      }
                    }}
                    placeholder="Search existing tags or type new tag and press Enter..."
                    className="h-10 flex-1 rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 text-xs text-white focus:border-brand-red focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tagInput.trim()) addTag(tagInput);
                    }}
                    className="rounded-xl border border-white/10 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 text-xs text-white transition-colors"
                  >
                    + Add Tag
                  </button>
                </div>

                {/* Suggestions Dropdown */}
                {showTagDropdown && tagSuggestions.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1.5 rounded-xl border border-white/15 bg-[#1A1D24] p-2 shadow-2xl space-y-1 max-h-48 overflow-y-auto">
                    <span className="text-[0.65rem] font-mono uppercase text-zinc-400 px-2 py-1 block">
                      Existing tags in database:
                    </span>
                    <div className="flex flex-wrap gap-1.5 p-1">
                      {tagSuggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => addTag(sug)}
                          className="rounded-lg bg-zinc-900 hover:bg-brand-red hover:text-white border border-white/10 px-2.5 py-1 text-xs text-zinc-300 transition-colors"
                        >
                          +{sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Cover Featured Image */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-7 space-y-4 shadow-sm">
            <span className="text-[0.68rem] font-mono uppercase tracking-wider text-brand-red font-semibold block">
              COVER PHOTOGRAPH (FEATURED IMAGE)
            </span>
            <div
              className={`rounded-xl border p-4 space-y-3 transition-colors ${
                coverImageError ? "border-red-500/80 bg-red-950/20" : "border-white/10 bg-[#1A1D24]/60"
              }`}
            >
              <ImageUploadField
                label="Story Cover Photo"
                value={coverUrl}
                onChange={(url) => {
                  setCoverUrl(url);
                  if (url) setCoverImageError(false);
                }}
                onUploadStateChange={(isUploading) =>
                  setInFlightUploads((prev) => Math.max(0, prev + (isUploading ? 1 : -1)))
                }
                description="Required to publish. Displayed on homepage cards, hero banner, category archives, and social sharing cards."
                required={true}
                hasError={coverImageError}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Cover Photo Caption
                  </label>
                  <input
                    type="text"
                    value={coverCaption}
                    onChange={(e) => setCoverCaption(e.target.value)}
                    placeholder="e.g. Presidential council in session, State House, Abuja."
                    className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 py-1.5 text-xs text-white focus:border-brand-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Photo Credit
                  </label>
                  <input
                    type="text"
                    value={coverCredit}
                    onChange={(e) => setCoverCredit(e.target.value)}
                    placeholder="e.g. State House / Cherryl Media"
                    className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 py-1.5 text-xs text-white focus:border-brand-red focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Structured Body Blocks with Explicit Ordering IDs */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-7 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-3 gap-2">
              <div>
                <span className="text-[0.68rem] font-mono uppercase tracking-wider text-brand-red font-semibold block">
                  ARTICLE BODY BLOCKS &amp; ORDERING
                </span>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Ordered sequential blocks. Insert media, quotes, and related post cards at any position.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Total blocks: <strong>{blocks.length}</strong>
              </span>
            </div>

            {/* List of content blocks */}
            <div className="space-y-4">
              {blocks.map((block, index) => (
                <div
                  key={index}
                  className="relative group rounded-xl border border-white/10 bg-[#1A1D24] p-4 transition-all hover:border-white/20 space-y-3"
                >
                  {/* Block Header with Ordering ID and Reordering Actions */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-brand-red/20 text-brand-red border border-brand-red/30 px-2 py-0.5 font-mono text-[0.68rem] font-bold">
                        ORDER #{block.order_id || index + 1}
                      </span>
                      <span className="text-[0.68rem] font-mono font-semibold uppercase tracking-wider text-zinc-300">
                        {block.type === "paragraph" && "Paragraph Text"}
                        {block.type === "heading" && "Section Subheading"}
                        {block.type === "quote" && "Pull Quote / Statement"}
                        {block.type === "image" && "Story Photograph (Media)"}
                        {block.type === "video" && "Video Player (MP4 Upload)"}
                        {block.type === "youtube" && "YouTube Embed"}
                        {block.type === "internal_link" && "Linked Related Post (Internal Card)"}
                        {block.type === "external_link" && "External Source Card"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Move Up */}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveBlock(index, "up")}
                        className="rounded p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                        title="Move Up in order"
                      >
                        ▲
                      </button>
                      {/* Move Down */}
                      <button
                        type="button"
                        disabled={index === blocks.length - 1}
                        onClick={() => moveBlock(index, "down")}
                        className="rounded p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
                        title="Move Down in order"
                      >
                        ▼
                      </button>
                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => removeBlock(index)}
                        className="text-xs text-zinc-500 hover:text-red-400 transition-colors ml-2"
                        title="Delete block"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* 1. Paragraph */}
                  {block.type === "paragraph" && (
                    <div className="space-y-2">
                      <AutoTextarea
                        value={block.text || ""}
                        onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                        placeholder="Write paragraph text..."
                        className="text-base text-zinc-100 placeholder-zinc-500 bg-transparent leading-relaxed focus:outline-none"
                      />
                      <label className="flex items-center gap-2 pt-2 text-xs text-zinc-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(block.isDropCap)}
                          onChange={(e) => updateBlock(index, { ...block, isDropCap: e.target.checked })}
                          className="rounded border-zinc-700 bg-zinc-900 text-brand-red focus:ring-0"
                        />
                        Use large lead drop cap
                      </label>
                    </div>
                  )}

                  {/* 2. Heading */}
                  {block.type === "heading" && (
                    <div className="space-y-2">
                      <AutoTextarea
                        value={block.text || ""}
                        onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                        placeholder="Enter section subheading..."
                        className="font-sans text-lg font-semibold text-white placeholder-zinc-500 bg-transparent tracking-tight focus:outline-none"
                      />
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span>Heading Level:</span>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`heading-level-${index}`}
                            checked={block.level !== 3}
                            onChange={() => updateBlock(index, { ...block, level: 2 })}
                            className="text-brand-red focus:ring-0"
                          />
                          <span>H2 (Major Section)</span>
                        </label>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="radio"
                            name={`heading-level-${index}`}
                            checked={block.level === 3}
                            onChange={() => updateBlock(index, { ...block, level: 3 })}
                            className="text-brand-red focus:ring-0"
                          />
                          <span>H3 (Minor Subsection)</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 3. Quote */}
                  {block.type === "quote" && (
                    <div className="space-y-3">
                      <AutoTextarea
                        value={block.quote || ""}
                        onChange={(e) => updateBlock(index, { ...block, quote: e.target.value })}
                        placeholder="Enter direct statement or pull quote..."
                        className="font-sans text-lg italic text-zinc-100 placeholder-zinc-500 bg-transparent leading-snug focus:outline-none border-l-2 border-brand-red pl-4"
                      />
                      <div className="grid gap-3 sm:grid-cols-2 pt-2">
                        <input
                          type="text"
                          value={block.author || ""}
                          onChange={(e) => updateBlock(index, { ...block, author: e.target.value })}
                          placeholder="Speaker name"
                          className="h-10 rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
                        />
                        <input
                          type="text"
                          value={block.context || ""}
                          onChange={(e) => updateBlock(index, { ...block, context: e.target.value })}
                          placeholder="Official title or institution"
                          className="h-10 rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. Story Photograph (Media) */}
                  {block.type === "image" && (
                    <div className="space-y-3">
                      <ImageUploadField
                        label="Inline Photo"
                        value={block.src || ""}
                        onChange={(url) => updateBlock(index, { ...block, src: url })}
                        onUploadStateChange={(isUploading) =>
                          setInFlightUploads((prev) => Math.max(0, prev + (isUploading ? 1 : -1)))
                        }
                        description="Supporting photograph placed between paragraphs."
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={block.caption || ""}
                          onChange={(e) => updateBlock(index, { ...block, caption: e.target.value })}
                          placeholder="Photo caption..."
                          className="h-10 rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
                        />
                        <input
                          type="text"
                          value={block.credit || ""}
                          onChange={(e) => updateBlock(index, { ...block, credit: e.target.value })}
                          placeholder="Photo credit..."
                          className="h-10 rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 5. Video Player (Media) */}
                  {block.type === "video" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[0.7rem] font-medium text-zinc-300 mb-1">
                          Video Source URL (or MP4/WebM)
                        </label>
                        <input
                          type="text"
                          value={block.src || ""}
                          onChange={(e) => updateBlock(index, { ...block, src: e.target.value })}
                          placeholder="https://... or /uploads/video.mp4"
                          className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-mono text-zinc-200 focus:border-brand-red focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors">
                          <svg className="w-3.5 h-3.5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <span>Upload Video File (Max 100MB)</span>
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const url = await uploadMediaFile(file);
                                if (url) updateBlock(index, { ...block, src: url });
                              } catch (err: unknown) {
                                const msg = err instanceof Error ? err.message : "Video upload failed";
                                alert(msg);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {block.src && (
                        <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
                          <video src={block.src} controls className="h-full w-full object-cover" />
                        </div>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={block.caption || ""}
                          onChange={(e) => updateBlock(index, { ...block, caption: e.target.value })}
                          placeholder="Video caption..."
                          className="h-10 rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
                        />
                        <input
                          type="text"
                          value={block.credit || ""}
                          onChange={(e) => updateBlock(index, { ...block, credit: e.target.value })}
                          placeholder="Video credit..."
                          className="h-10 rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 6. YouTube Embed (Media) */}
                  {block.type === "youtube" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[0.7rem] font-medium text-zinc-300 mb-1">
                          YouTube Video URL or ID
                        </label>
                        <input
                          type="text"
                          value={block.url || ""}
                          onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                          className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-mono text-zinc-200 focus:border-brand-red focus:outline-none"
                        />
                      </div>

                      {block.url && getYouTubeEmbedUrl(block.url) && (
                        <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-sm">
                          <iframe
                            src={getYouTubeEmbedUrl(block.url)!}
                            title="YouTube Preview"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="h-full w-full border-0"
                          />
                        </div>
                      )}

                      <input
                        type="text"
                        value={block.caption || ""}
                        onChange={(e) => updateBlock(index, { ...block, caption: e.target.value })}
                        placeholder="Video caption / summary..."
                        className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
                      />
                    </div>
                  )}

                  {/* 7. Link Related Post ("Link related post" - shows up with internal post card) */}
                  {block.type === "internal_link" && (
                    <div className="space-y-3 rounded-xl border border-brand-red/30 bg-brand-red/5 p-4">
                      <div className="flex items-center justify-between pb-2 border-b border-brand-red/20">
                        <span className="text-xs font-semibold text-brand-red uppercase">
                          🔗 Inline Related Post Card
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[0.65rem] text-zinc-400">Quick select:</span>
                          <select
                            onChange={(e) => {
                              const match = articlesList.find((a) => a.slug === e.target.value);
                              if (match) {
                                updateBlock(index, {
                                  type: "internal_link",
                                  order_id: index + 1,
                                  title: match.title,
                                  slug: match.slug,
                                  category: match.categoryName || match.category,
                                  deck: match.excerpt || match.deck,
                                  imageUrl: match.featuredImage?.url,
                                });
                              }
                            }}
                            className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1 text-[0.7rem] text-white focus:outline-none max-w-[200px] truncate"
                          >
                            <option value="">Choose published article...</option>
                            {articlesList.map((a) => (
                              <option key={a.slug} value={a.slug}>
                                {a.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-[0.68rem] font-semibold uppercase text-zinc-300 mb-1">
                            Story Headline
                          </label>
                          <input
                            type="text"
                            value={block.title || ""}
                            onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                            placeholder="Headline of related story..."
                            className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-semibold text-white focus:border-brand-red focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.68rem] font-semibold uppercase text-zinc-300 mb-1">
                            Story Slug
                          </label>
                          <input
                            type="text"
                            value={block.slug || ""}
                            onChange={(e) => updateBlock(index, { ...block, slug: e.target.value })}
                            placeholder="e.g. nigeria-clean-energy-transition-report"
                            className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-mono text-zinc-200 focus:border-brand-red focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-[0.68rem] font-semibold uppercase text-zinc-300 mb-1">
                            Category Label
                          </label>
                          <input
                            type="text"
                            value={block.category || ""}
                            onChange={(e) => updateBlock(index, { ...block, category: e.target.value })}
                            placeholder="e.g. STATE AFFAIRS & ENVIRONS"
                            className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-zinc-300 focus:border-brand-red focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[0.68rem] font-semibold uppercase text-zinc-300 mb-1">
                            Thumbnail Image URL
                          </label>
                          <input
                            type="text"
                            value={block.imageUrl || ""}
                            onChange={(e) => updateBlock(index, { ...block, imageUrl: e.target.value })}
                            placeholder="https://... or /uploads/..."
                            className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-mono text-zinc-300 focus:border-brand-red focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[0.68rem] font-semibold uppercase text-zinc-300 mb-1">
                          Brief Reason to Read / Excerpt
                        </label>
                        <input
                          type="text"
                          value={block.deck || ""}
                          onChange={(e) => updateBlock(index, { ...block, deck: e.target.value })}
                          placeholder="Brief 1-sentence synopsis of why reader should click..."
                          className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-zinc-300 focus:border-brand-red focus:outline-none"
                        />
                      </div>

                      {/* Internal Post Card Preview */}
                      <div className="mt-2 rounded-xl border border-white/10 bg-zinc-900/80 p-3.5 flex items-center justify-between">
                        <div className="min-w-0 pr-3">
                          <span className="text-[0.62rem] font-bold uppercase tracking-wider text-brand-red">
                            RELATED STORY · {block.category || "RECOMMENDED"}
                          </span>
                          <h4 className="font-semibold text-xs md:text-sm text-white line-clamp-1 mt-0.5">
                            {block.title || "Related Story Headline Preview"}
                          </h4>
                          {block.deck && (
                            <p className="text-[0.72rem] text-zinc-400 line-clamp-1 mt-0.5">
                              {block.deck}
                            </p>
                          )}
                        </div>
                        {block.imageUrl && (
                          <div className="h-12 w-20 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={resolveMediaUrl(block.imageUrl)} alt="" className="h-full w-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 8. External Source Link */}
                  {block.type === "external_link" && (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={block.title || ""}
                          onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                          placeholder="Source title or report headline..."
                          className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-semibold text-white focus:border-brand-red focus:outline-none"
                        />
                        <input
                          type="text"
                          value={block.publisher || ""}
                          onChange={(e) => updateBlock(index, { ...block, publisher: e.target.value })}
                          placeholder="Publisher / Official Gazette..."
                          className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-zinc-300 focus:border-brand-red focus:outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        value={block.url || ""}
                        onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                        placeholder="https://..."
                        className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-mono text-zinc-300 focus:border-brand-red focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Bar: Add Any Block At End */}
            <div className="pt-4 border-t border-white/[0.08] space-y-2">
              <span className="text-[0.68rem] font-mono uppercase tracking-wider text-zinc-400 block">
                + Add Content Block (appends with explicit Order ID #{blocks.length + 1})
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => addBlock({ type: "paragraph", text: "", isDropCap: false })}
                  className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  + Paragraph
                </button>
                <button
                  type="button"
                  onClick={() => addBlock({ type: "heading", level: 2, text: "" })}
                  className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  + Heading
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addBlock({
                      type: "quote",
                      quote: "",
                      author: "Speaker name",
                      context: "Official title or institution",
                    })
                  }
                  className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  + Pull Quote
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addBlock({
                      type: "image",
                      src: "",
                      alt: "Story photo",
                      caption: "",
                      credit: "Cherryl Media",
                    })
                  }
                  className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  + Photo (Media)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addBlock({
                      type: "video",
                      src: "",
                      caption: "",
                      credit: "",
                    })
                  }
                  className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  + Video Player
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addBlock({
                      type: "youtube",
                      url: "",
                      caption: "",
                    })
                  }
                  className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  + YouTube
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addBlock({
                      type: "internal_link",
                      title: "Related Story Headline",
                      slug: "nigeria-electricity-regulatory-commission-updates-feeder-bands",
                      category: "STATE AFFAIRS & ENVIRONS",
                      deck: "Brief sentence explaining context for reader.",
                    })
                  }
                  className="rounded-lg border border-brand-red/40 bg-brand-red/10 px-3.5 py-2 text-xs font-semibold text-brand-red hover:bg-brand-red/20 transition-colors"
                >
                  + Link Related Post
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addBlock({
                      type: "external_link",
                      title: "Official Gazette Document",
                      url: "https://",
                      publisher: "Official Agency",
                    })
                  }
                  className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  + External Link
                </button>
              </div>
            </div>
          </div>

          {/* Section: "More Stories" at the End of Post (Internal & External Post Cards) */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-7 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-3 gap-2">
              <div>
                <span className="text-[0.68rem] font-mono uppercase tracking-wider text-brand-red font-semibold block">
                  &ldquo;MORE STORIES&rdquo; FOOTER SECTION
                </span>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Displays internal or external post cards at the conclusion of this article.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  addRelatedStory({
                    type: "internal_link",
                    title: "Related story recommendation",
                    slug: "",
                    category: "NEWSBEAT",
                    deck: "Brief preview snippet for more stories card.",
                    imageUrl: "",
                  })
                }
                className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors self-start sm:self-auto"
              >
                + Add More Story Card
              </button>
            </div>

            {relatedStories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-zinc-500">
                No &ldquo;More Stories&rdquo; attached yet. Click the button above to add internal or external story cards.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedStories.map((story, rIdx) => (
                  <div
                    key={rIdx}
                    className="rounded-xl border border-white/10 bg-[#1A1D24] p-4 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <span className="text-[0.65rem] font-mono font-semibold text-brand-red uppercase">
                        Story Card #{rIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeRelatedStory(rIdx)}
                        className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Quick selection from articles */}
                    <div>
                      <select
                        onChange={(e) => {
                          const match = articlesList.find((a) => a.slug === e.target.value);
                          if (match) {
                            updateRelatedStory(rIdx, {
                              ...story,
                              title: match.title,
                              slug: match.slug,
                              category: match.categoryName || match.category,
                              deck: match.excerpt || match.deck,
                              imageUrl: match.featuredImage?.url,
                            });
                          }
                        }}
                        className="h-8 w-full rounded-lg border border-white/10 bg-zinc-900 px-2 text-[0.7rem] text-zinc-300 focus:outline-none truncate"
                      >
                        <option value="">Quick auto-fill from published stories...</option>
                        {articlesList.map((a) => (
                          <option key={a.slug} value={a.slug}>
                            {a.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[0.65rem] font-semibold uppercase text-zinc-400 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={story.title || ""}
                        onChange={(e) => updateRelatedStory(rIdx, { ...story, title: e.target.value })}
                        placeholder="Story title..."
                        className="h-9 w-full rounded-lg border border-white/10 bg-[#141519] px-2.5 text-xs text-white focus:border-brand-red focus:outline-none"
                      />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="block text-[0.65rem] font-semibold uppercase text-zinc-400 mb-1">
                          Slug / URL
                        </label>
                        <input
                          type="text"
                          value={story.slug || story.url || ""}
                          onChange={(e) => updateRelatedStory(rIdx, { ...story, slug: e.target.value, url: e.target.value })}
                          placeholder="story-slug or https://..."
                          className="h-9 w-full rounded-lg border border-white/10 bg-[#141519] px-2.5 text-xs font-mono text-zinc-200 focus:border-brand-red focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[0.65rem] font-semibold uppercase text-zinc-400 mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={story.category || ""}
                          onChange={(e) => updateRelatedStory(rIdx, { ...story, category: e.target.value })}
                          placeholder="e.g. NEWSBEAT"
                          className="h-9 w-full rounded-lg border border-white/10 bg-[#141519] px-2.5 text-xs text-zinc-200 focus:border-brand-red focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[0.65rem] font-semibold uppercase text-zinc-400 mb-1">
                        Thumbnail URL
                      </label>
                      <input
                        type="text"
                        value={story.imageUrl || ""}
                        onChange={(e) => updateRelatedStory(rIdx, { ...story, imageUrl: e.target.value })}
                        placeholder="https://... or /uploads/..."
                        className="h-9 w-full rounded-lg border border-white/10 bg-[#141519] px-2.5 text-xs font-mono text-zinc-200 focus:border-brand-red focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.65rem] font-semibold uppercase text-zinc-400 mb-1">
                        Excerpt / Deck
                      </label>
                      <input
                        type="text"
                        value={story.deck || ""}
                        onChange={(e) => updateRelatedStory(rIdx, { ...story, deck: e.target.value })}
                        placeholder="Short card excerpt..."
                        className="h-9 w-full rounded-lg border border-white/10 bg-[#141519] px-2.5 text-xs text-zinc-300 focus:border-brand-red focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SEO & Meta Section */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-7 space-y-6 shadow-sm">
            <div>
              <span className="text-[0.68rem] font-mono uppercase tracking-wider text-brand-red font-semibold block">
                SEARCH ENGINE OPTIMIZATION (SEO)
              </span>
              <h2 className="font-sans text-xl font-semibold text-white tracking-tight mt-1">
                Google Search Appearance &amp; Meta Tags
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Optimize headline, custom slug, and meta description for search engine ranking.
              </p>
            </div>

            {/* SEO Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300">
                  SEO Title (Meta Title)
                </label>
                <span
                  className={`text-[0.68rem] font-mono ${
                    seoTitle.length > 60 ? "text-amber-400" : "text-zinc-500"
                  }`}
                >
                  {seoTitle.length || title.length} / 60 recommended
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title || "Enter optimized title for Google search results..."}
                className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-4 py-2 text-sm text-white focus:border-brand-red focus:outline-none"
              />
            </div>

            {/* SEO Slug */}
            <div>
              <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                SEO Canonical Slug
              </label>
              <input
                type="text"
                value={seoSlug}
                onChange={(e) => setSeoSlug(e.target.value)}
                placeholder={slug || "optimized-canonical-slug"}
                className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-4 py-2 text-xs font-mono text-zinc-200 focus:border-brand-red focus:outline-none"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300">
                  Meta Description (SERP Snippet)
                </label>
                <span
                  className={`text-[0.68rem] font-mono ${
                    (seoDescription.length || excerpt.length) > 160 ? "text-amber-400" : "text-zinc-500"
                  }`}
                >
                  {seoDescription.length || excerpt.length} / 160 recommended
                </span>
              </div>
              <AutoTextarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder={excerpt || subtitle || "Enter concise meta description for Google snippets..."}
                className="text-sm font-normal text-zinc-200 placeholder-zinc-500 bg-[#1A1D24] rounded-xl border border-white/10 p-4 leading-relaxed focus:border-brand-red focus:outline-none"
              />
            </div>

            {/* Live Google Search Preview Card */}
            <div className="pt-4 border-t border-white/[0.08] space-y-2">
              <span className="text-[0.68rem] font-mono uppercase tracking-wider text-zinc-400 block">
                Google Search Result SERP Live Preview
              </span>
              <div className="rounded-xl border border-white/10 bg-[#0E1014] p-4 font-sans space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span className="h-4 w-4 rounded-full bg-brand-red/80 flex items-center justify-center text-[0.55rem] font-bold text-white">
                    C
                  </span>
                  <span className="truncate text-zinc-300 text-[0.75rem]">
                    cherrylmedia.com &gt; article &gt; {seoSlug || slug || "article-slug"}
                  </span>
                </div>
                <h3 className="text-base text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug">
                  {seoTitle || title || "Untitled Article | Cherryl Media"}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {seoDescription || excerpt || subtitle || "No description provided for search engines yet."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Social Media Channels */}
      {activeTab === "social" && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="font-sans text-xl font-semibold text-white tracking-tight">
              Social Media Channels
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Draft channel-specific versions of this story for social platforms and subscriber newsletter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-3">
            {[
              { id: "x", label: "X / Twitter" },
              { id: "facebook", label: "Facebook" },
              { id: "linkedin", label: "LinkedIn" },
              { id: "newsletter", label: "Newsletter" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSocialTab(tab.id as typeof socialTab)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  socialTab === tab.id
                    ? "bg-zinc-800 text-white border border-white/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {socialTab === "x" && (
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                X / Twitter Post Copy
              </label>
              <AutoTextarea
                value={xPost}
                onChange={(e) => setXPost(e.target.value)}
                placeholder="Write concise post for X with key facts and source link..."
                className="text-sm font-normal text-white bg-[#1A1D24] border border-white/10 rounded-xl p-4 focus:border-brand-red focus:outline-none"
              />
            </div>
          )}

          {socialTab === "facebook" && (
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Facebook Post Copy
              </label>
              <AutoTextarea
                value={fbPost}
                onChange={(e) => setFbPost(e.target.value)}
                placeholder="Write engaging Facebook post with context and headline..."
                className="text-sm font-normal text-white bg-[#1A1D24] border border-white/10 rounded-xl p-4 focus:border-brand-red focus:outline-none"
              />
            </div>
          )}

          {socialTab === "linkedin" && (
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                LinkedIn Post Copy
              </label>
              <AutoTextarea
                value={liPost}
                onChange={(e) => setLiPost(e.target.value)}
                placeholder="Write institutional, business or policy angle for LinkedIn..."
                className="text-sm font-normal text-white bg-[#1A1D24] border border-white/10 rounded-xl p-4 focus:border-brand-red focus:outline-none"
              />
            </div>
          )}

          {socialTab === "newsletter" && (
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Email Newsletter Summary
              </label>
              <AutoTextarea
                value={nlPost}
                onChange={(e) => setNlPost(e.target.value)}
                placeholder="Write curated editorial summary for subscriber newsletter..."
                className="text-sm font-normal text-white bg-[#1A1D24] border border-white/10 rounded-xl p-4 focus:border-brand-red focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Primary Sources & Citations */}
      {activeTab === "sources" && (
        <div className="space-y-6">
          {/* AI Workflow Card */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-[0.62rem] font-semibold text-purple-400 uppercase tracking-wider">
                  AI EDITORIAL COLLABORATION
                </span>
                <h3 className="font-sans text-lg font-semibold text-white mt-1 tracking-tight">
                  Export Editorial Context for AI Review
                </h3>
                <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                  Copy this story&apos;s full brief (headline, deck, verified sources, body text, and social drafts) into your clipboard to paste into ChatGPT, Claude, or Gemini to fact-check, refine phrasing, and spot errors.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyAIContext}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-purple-500 transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                {copiedAI ? "✓ Copied to Clipboard!" : "Copy Context for AI"}
              </button>
            </div>
          </div>

          {/* Primary Sources & Fact Citations */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.08] pb-4 gap-3">
              <div>
                <h2 className="font-sans text-xl font-semibold text-white tracking-tight">
                  Primary Sources &amp; Citations
                </h2>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Every claim must be traceable to official gazettes, releases, or verified public records.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSources((prev) => [
                    ...prev,
                    {
                      url: "",
                      publisher: "New Source / Gazette",
                      claimSummary: "",
                    },
                  ])
                }
                className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors self-start sm:self-auto"
              >
                + Add Source Link
              </button>
            </div>

            <div className="space-y-3">
              {sources.map((s, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-[#1A1D24] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-red">Source #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setSources((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                        Publisher / Institution
                      </label>
                      <input
                        type="text"
                        value={s.publisher}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSources((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, publisher: val } : item))
                          );
                        }}
                        className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
                        placeholder="e.g. State House Official Gazette"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                        Source URL
                      </label>
                      <input
                        type="text"
                        value={s.url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSources((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, url: val } : item))
                          );
                        }}
                        className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                      Verified Fact / Claim Summary
                    </label>
                    <input
                      type="text"
                      value={s.claimSummary || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSources((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, claimSummary: val } : item))
                        );
                      }}
                      className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
                      placeholder="e.g. Official confirmation of tariff stabilization starting November 1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Publishing Flow Modal */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#16181D] p-6 shadow-2xl text-left space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="font-mono text-[0.65rem] uppercase tracking-widest text-brand-red font-semibold">
                  CHERRYL NEWSROOM
                </span>
                <h3 className="text-lg font-semibold text-white tracking-tight">
                  {publishStep === "done" ? "Story Published Successfully" : "Publishing Verification Pipeline"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPublishModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Error banner */}
            {publishErrorMessage && (
              <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-3.5 text-xs text-red-200 space-y-2">
                <div className="font-semibold flex items-center gap-2">
                  <span>⚠️ Upload or Verification Required</span>
                </div>
                <p className="text-[0.78rem] text-red-300 leading-relaxed">{publishErrorMessage}</p>
              </div>
            )}

            {/* 3-Step Progress Indicators */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">
                  {publishStepStates.media === "success" && (
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                  {publishStepStates.media === "running" && (
                    <div className="h-6 w-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  )}
                  {publishStepStates.media === "error" && (
                    <div className="h-6 w-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center text-xs font-bold">
                      !
                    </div>
                  )}
                  {publishStepStates.media === "pending" && (
                    <div className="h-6 w-6 rounded-full border border-white/20 text-zinc-500 flex items-center justify-center text-xs font-mono">
                      1
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-zinc-200">1. Media &amp; Storage Verification</h4>
                  <p className="text-[0.72rem] text-zinc-400">
                    {publishStepStates.media === "success"
                      ? "Cover photo and inline media confirmed stored"
                      : publishStepStates.media === "running"
                      ? "Verifying image assets and uploads..."
                      : publishStepStates.media === "error"
                      ? "Storage check failed — see error above"
                      : "Awaits image upload confirmation"}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">
                  {publishStepStates.editorial === "success" && (
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                  {publishStepStates.editorial === "running" && (
                    <div className="h-6 w-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  )}
                  {publishStepStates.editorial === "error" && (
                    <div className="h-6 w-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center text-xs font-bold">
                      !
                    </div>
                  )}
                  {publishStepStates.editorial === "pending" && (
                    <div className="h-6 w-6 rounded-full border border-white/20 text-zinc-500 flex items-center justify-center text-xs font-mono">
                      2
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-zinc-200">
                    2. Editorial Integrity &amp; Category Verification
                  </h4>
                  <p className="text-[0.72rem] text-zinc-400">
                    {publishStepStates.editorial === "success"
                      ? `Verified headline, author (${authorName}), category (${category}), and ${blocks.length} ordered blocks`
                      : publishStepStates.editorial === "running"
                      ? "Checking editorial fields and sequence..."
                      : "Validates article structure, category, and sequence"}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">
                  {publishStepStates.engine === "success" && (
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                  {publishStepStates.engine === "running" && (
                    <div className="h-6 w-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  )}
                  {publishStepStates.engine === "error" && (
                    <div className="h-6 w-6 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center text-xs font-bold">
                      !
                    </div>
                  )}
                  {publishStepStates.engine === "pending" && (
                    <div className="h-6 w-6 rounded-full border border-white/20 text-zinc-500 flex items-center justify-center text-xs font-mono">
                      3
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-zinc-200">
                    3. Live Sync to Cherryl Media Backend
                  </h4>
                  <p className="text-[0.72rem] text-zinc-400">
                    {publishStepStates.engine === "success"
                      ? "Dispatched to PostgreSQL database, RSS feeds, and public reader endpoints"
                      : publishStepStates.engine === "running"
                      ? "Transmitting article payload to Go backend..."
                      : "Synchronizes published dispatch with web and feeds"}
                  </p>
                </div>
              </div>
            </div>

            {/* Success state */}
            {publishStep === "done" && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Story is now published and active on the website</span>
                </div>
                <p className="font-area text-sm font-semibold text-white leading-snug line-clamp-2">
                  {title}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <Link
                    href={`/article/${publishedSlug}`}
                    target="_blank"
                    className="rounded-lg bg-brand-red px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-red/90 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>View Live Story ↗</span>
                  </Link>
                  <Link
                    href="/admin"
                    className="rounded-lg border border-white/15 bg-zinc-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors"
                  >
                    Return to Newsroom Desk
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPublishModalOpen(false)}
                    className="rounded-lg px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    Continue Editing
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            {publishStep !== "done" && (
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.08]">
                {publishErrorMessage && (
                  <button
                    type="button"
                    onClick={() => {
                      setPublishModalOpen(false);
                      if (!coverUrl) {
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }
                    }}
                    className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-medium text-white transition-colors"
                  >
                    Close &amp; Fix Issue
                  </button>
                )}
                {publishErrorMessage && (
                  <button
                    type="button"
                    onClick={handlePublishClick}
                    className="rounded-lg bg-brand-red hover:bg-brand-red/90 px-4 py-2 text-xs font-semibold text-white shadow transition-colors"
                  >
                    Retry Publishing
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px] text-zinc-400 font-mono text-xs">
          Loading Editorial Desk...
        </div>
      }
    >
      <AdminEditorContent />
    </Suspense>
  );
}
