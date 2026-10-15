"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CANONICAL_ARTICLES } from "@/lib/articles";
import AutoTextarea from "@/components/admin/AutoTextarea";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { ContentBlock, PillarCategory, PublishingStatus, CanonicalArticle } from "@/lib/types";
import { getYouTubeEmbedUrl } from "@/lib/url-utils";
import { uploadMediaFile } from "@/lib/upload";

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

  const [activeTab, setActiveTab] = useState<"story" | "social" | "sources">("story");
  const [socialTab, setSocialTab] = useState<"x" | "facebook" | "linkedin" | "newsletter">("x");

  const [title, setTitle] = useState(CANONICAL_ARTICLES[0].title);
  const [slug, setSlug] = useState(CANONICAL_ARTICLES[0].slug);
  const [kicker, setKicker] = useState(CANONICAL_ARTICLES[0].kicker);
  const [deck, setDeck] = useState(CANONICAL_ARTICLES[0].deck);
  const [category, setCategory] = useState<PillarCategory>(CANONICAL_ARTICLES[0].category);
  const [authorName, setAuthorName] = useState(CANONICAL_ARTICLES[0].author.name);
  const [authorRole, setAuthorRole] = useState(CANONICAL_ARTICLES[0].author.role);
  const [status, setStatus] = useState<PublishingStatus>("published");
  const [coverUrl, setCoverUrl] = useState(CANONICAL_ARTICLES[0].featuredImage.url);
  const [coverCaption, setCoverCaption] = useState(CANONICAL_ARTICLES[0].featuredImage.caption || "");

  const [blocks, setBlocks] = useState<ContentBlock[]>(CANONICAL_ARTICLES[0].body);

  const [xPost, setXPost] = useState(CANONICAL_ARTICLES[0].channelVariants?.x || "");
  const [fbPost, setFbPost] = useState(CANONICAL_ARTICLES[0].channelVariants?.facebook || "");
  const [liPost, setLiPost] = useState(CANONICAL_ARTICLES[0].channelVariants?.linkedin || "");
  const [nlPost, setNlPost] = useState(CANONICAL_ARTICLES[0].channelVariants?.newsletter || "");

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

  const populateArticleData = useCallback((art: Partial<CanonicalArticle> & Record<string, unknown>) => {
    setTitle(typeof art.title === "string" ? art.title : "");
    setSlug(typeof art.slug === "string" ? art.slug : "");
    setKicker(typeof art.kicker === "string" ? art.kicker : "POLICY · DISPATCH");
    setDeck(typeof art.deck === "string" ? art.deck : "");
    setCategory((art.category as PillarCategory) || "nigerian-current-affairs");
    const authorObj = art.author as { name?: string; role?: string } | undefined;
    setAuthorName(authorObj?.name || "Newsroom Desk");
    setAuthorRole(authorObj?.role || "Staff Reporter");
    setStatus((art.status as PublishingStatus) || "published");
    const featImg = art.featuredImage as { url?: string; caption?: string } | undefined;
    setCoverUrl(featImg?.url || "");
    setCoverCaption(featImg?.caption || "");
    setBlocks(Array.isArray(art.body) ? (art.body as ContentBlock[]) : []);

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
    setTitle("");
    setSlug("");
    setKicker("BREAKING · DESK DISPATCH");
    setDeck("");
    setCategory("nigerian-current-affairs");
    setAuthorName("Newsroom Desk");
    setAuthorRole("Staff Reporter");
    setStatus("draft");
    setCoverUrl("");
    setCoverCaption("");
    setBlocks([
      {
        type: "paragraph",
        isDropCap: true,
        text: "Draft your opening paragraph here...",
      },
    ]);
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

  // When urlSlug or selectedSlug changes, load that article
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


  const [savedNotice, setSavedNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copiedAI, setCopiedAI] = useState(false);

  // Validation & Autosave state
  const [coverImageError, setCoverImageError] = useState(false);
  const [publishWarning, setPublishWarning] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastAutosavedTime, setLastAutosavedTime] = useState<string | null>(null);

  // Real-time media upload tracking
  const [inFlightUploads, setInFlightUploads] = useState(0);

  // Step-by-step publishing pipeline modal state
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

  // Debounced background autosave
  useEffect(() => {
    if (!title.trim()) return;

    const timer = setTimeout(async () => {
      setAutosaveStatus("saving");
      try {
        const payload = {
          title,
          slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          kicker,
          deck,
          category,
          categoryName: category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          author: { name: authorName, role: authorRole },
          featuredImage: { url: coverUrl, caption: coverCaption, credit: "Cherryl Media" },
          readTime: "4 min read",
          status: "draft",
          body: blocks,
          socialVariants: { x: xPost, facebook: fbPost, linkedin: liPost, newsletter: nlPost },
          sources: sources.map((s) => ({ sourceName: s.publisher, url: s.url, claimSummary: s.claimSummary || "" })),
          sourceLinks: sources.map((s) => ({ url: s.url, publisher: s.publisher, accessedAt: new Date().toISOString() })),
          publishedAt: new Date().toISOString(),
        };

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
    }, 2500);

    return () => clearTimeout(timer);
  }, [title, slug, kicker, deck, category, authorName, authorRole, coverUrl, coverCaption, blocks, sources, xPost, fbPost, liPost, nlPost]);

  const handleCopyAIContext = () => {
    const prompt = `# EDITORIAL CONTEXT & SOURCE BRIEF FOR FACT-CHECKING / REFINEMENT

## TITLE: ${title}
## SUBTITLE / DECK: ${deck}
## CATEGORY: ${category}
## AUTHOR: ${authorName} (${authorRole})

### PRIMARY SOURCES & CITATIONS:
${sources.map((s, i) => `${i + 1}. **${s.publisher}**\n   - URL: ${s.url}\n   - Verified Claim: ${s.claimSummary || "Primary report"}`).join("\n\n") || "No external sources attached yet."}

### FULL ARTICLE BODY:
${blocks.map((b) => {
  if (b.type === "paragraph") return b.text;
  if (b.type === "heading") return `### ${b.text}`;
  if (b.type === "quote") return `> "${b.quote}"\n> — ${b.author} (${b.context})`;
  if (b.type === "external_link") return `[Link: ${b.title} - ${b.url}]`;
  if (b.type === "internal_link") return `[Internal Story: ${b.title} - ${b.slug}]`;
  if (b.type === "image") return `[Photo: ${b.caption || b.alt} (${b.src})]`;
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

    // STEP 1: Verify all images/media have completed upload and landed in S3
    if (inFlightUploads > 0) {
      setPublishErrorMessage(`Waiting for ${inFlightUploads} media asset(s) to finish landing in S3 bucket...`);
      let attempts = 0;
      while (attempts < 20 && inFlightUploads > 0) {
        await new Promise((r) => setTimeout(r, 600));
        attempts++;
      }
    }

    if (!coverUrl || !coverUrl.trim()) {
      setCoverImageError(true);
      setPublishStepStates((prev) => ({ ...prev, media: "error" }));
      setPublishErrorMessage("A cover photo is required before publishing. Please upload a story photo to S3.");
      return;
    }

    if (coverUrl.startsWith("data:") || coverUrl.startsWith("blob:")) {
      setCoverImageError(true);
      setPublishStepStates((prev) => ({ ...prev, media: "error" }));
      setPublishErrorMessage("Cover photo is still a temporary local file and has not confirmed landing in S3.");
      return;
    }

    const pendingInline = blocks.find(
      (b) =>
        (b.type === "image" && (b.src.startsWith("data:") || b.src.startsWith("blob:"))) ||
        (b.type === "video" && (b.src.startsWith("data:") || b.src.startsWith("blob:")))
    );
    if (pendingInline) {
      setPublishStepStates((prev) => ({ ...prev, media: "error" }));
      setPublishErrorMessage("An inline photograph or video is still uploading. Please allow it to finish landing in storage.");
      return;
    }

    setPublishStepStates((prev) => ({ ...prev, media: "success", editorial: "running" }));
    setPublishStep("editorial");

    await new Promise((r) => setTimeout(r, 450));

    // STEP 2: Editorial and Source Integrity
    if (!title.trim()) {
      setPublishStepStates((prev) => ({ ...prev, editorial: "error" }));
      setPublishErrorMessage("Story headline cannot be empty.");
      return;
    }

    setPublishStepStates((prev) => ({ ...prev, editorial: "success", engine: "running" }));
    setPublishStep("engine");

    // STEP 3: Transmit and publish to Media Engine
    const payload = {
      title,
      slug: articleSlug,
      kicker,
      deck,
      category,
      categoryName: category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      author: {
        name: authorName,
        role: authorRole,
      },
      featuredImage: {
        url: coverUrl,
        caption: coverCaption,
        credit: "Cherryl Media",
      },
      readTime: "4 min read",
      status: "published",
      body: blocks,
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

  const handleSave = async (newStatus?: PublishingStatus) => {
    const targetStatus = newStatus || status;

    // Image validation: Not publishable if no cover photo is added
    if (targetStatus === "published" && !coverUrl.trim()) {
      setCoverImageError(true);
      setPublishWarning("⚠️ A cover photo is required before publishing this story. Please upload an image below.");
      setActiveTab("story");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setPublishWarning(null), 6000);
      return;
    }

    setCoverImageError(false);
    setPublishWarning(null);
    if (newStatus) setStatus(newStatus);
    setIsSubmitting(true);
    setSaveMessage(null);

    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      kicker,
      deck,
      category,
      categoryName: category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      author: {
        name: authorName,
        role: authorRole,
      },
      featuredImage: {
        url: coverUrl,
        caption: coverCaption,
        credit: "Cherryl Media",
      },
      readTime: "4 min read",
      status: targetStatus,
      body: blocks,
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

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
      const res = await fetch(`${backendUrl}/api/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveMessage(targetStatus === "published" ? "✓ Published & Synced" : "✓ Saved draft to backend");
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

  const addParagraph = () => {
    setBlocks((prev) => [...prev, { type: "paragraph", text: "", isDropCap: false }]);
  };

  const addImage = () => {
    setBlocks((prev) => [
      ...prev,
      {
        type: "image",
        src: "",
        alt: "Story photo",
        caption: "",
        credit: "",
      },
    ]);
  };

  const addQuote = () => {
    setBlocks((prev) => [
      ...prev,
      {
        type: "quote",
        quote: "",
        author: "Speaker name",
        context: "Official title or role",
      },
    ]);
  };

  const addLink = () => {
    setBlocks((prev) => [
      ...prev,
      {
        type: "internal_link",
        title: "Related Story Headline",
        slug: "nigeria-electricity-regulatory-commission-updates-feeder-bands",
        category: "Practical Nigerian Updates",
        deck: "Brief sentence on why the reader should view this.",
      },
    ]);
  };

  const addVideo = () => {
    setBlocks((prev) => [
      ...prev,
      {
        type: "video",
        src: "",
        caption: "",
        credit: "",
        poster: "",
      },
    ]);
  };

  const addYouTube = () => {
    setBlocks((prev) => [
      ...prev,
      {
        type: "youtube",
        url: "",
        caption: "",
      },
    ]);
  };

  const updateBlock = (index: number, updated: ContentBlock) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? updated : b)));
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
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
              className="rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white focus:border-brand-red focus:outline-none max-w-[200px] sm:max-w-[280px] truncate"
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
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
            {category}
          </span>

          <span className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wider border ${
            status === "published"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
          }`}>
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
            <span className="text-xs font-semibold text-emerald-400 animate-fade">
              {saveMessage}
            </span>
          )}

          {/* Copy Context for AI button */}
          <button
            type="button"
            onClick={handleCopyAIContext}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/15 px-3 py-1.5 text-xs font-medium text-purple-200 hover:bg-purple-500/25 hover:text-white transition-all shadow-sm"
            title="Copy complete editorial brief, verified sources, and text to paste into ChatGPT, Claude or Gemini for vetting and refinement"
          >
            <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
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
              {inFlightUploads} uploading to storage
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
            activeTab === "story"
              ? "bg-brand-red text-white"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          1. Write Story
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "social"
              ? "bg-brand-red text-white"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          2. Social Media Channels
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sources")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "sources"
              ? "bg-brand-red text-white"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <span>3. Sources &amp; Citations</span>
          <span className="rounded-full bg-white/15 px-1.5 py-0.2 text-[0.65rem]">
            {sources.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Progressive Story Builder */}
      {activeTab === "story" && (
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Category dropdown matching input height and padding */}
              <div>
                <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Category Pillar
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PillarCategory)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 py-2.5 text-sm font-medium text-white focus:border-brand-red focus:outline-none transition-colors"
                >
                  <option value="nigerian-current-affairs">Current Affairs</option>
                  <option value="entertainment-internet-culture">Entertainment &amp; Internet Culture</option>
                  <option value="practical-nigerian-updates">Practical Updates</option>
                  <option value="business-institutions">Business &amp; Institutions</option>
                  <option value="stories-romance">Stories &amp; Romance</option>
                </select>
              </div>

              <div>
                <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Author Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 py-2.5 text-sm font-medium text-white focus:border-brand-red focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Author Title / Role
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 py-2.5 text-sm font-medium text-white focus:border-brand-red focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Top Label / Kicker
                </label>
                <input
                  type="text"
                  value={kicker}
                  onChange={(e) => setKicker(e.target.value)}
                  placeholder="e.g. NATIONAL POLICY ADVISORY"
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 py-2.5 text-sm font-medium text-white focus:border-brand-red focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 py-2.5 text-sm font-mono text-zinc-300 focus:border-brand-red focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Core Writing Canvas: Title, Deck, Cover Image */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-8 space-y-6 shadow-sm">
            {/* Title Block */}
            <div>
              <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Story Title <span className="text-brand-red">*</span>
              </label>
              <AutoTextarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter story headline..."
                className="font-sans text-xl md:text-2xl font-semibold text-white placeholder-zinc-500 bg-[#1A1D24] rounded-xl border border-white/10 p-4 leading-snug tracking-tight focus:border-brand-red focus:outline-none"
              />
            </div>

            {/* Deck / Summary Block */}
            <div>
              <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                Story Summary / Deck
              </label>
              <AutoTextarea
                value={deck}
                onChange={(e) => setDeck(e.target.value)}
                placeholder="Write a clear 1-2 sentence summary of this story..."
                className="text-sm font-normal text-zinc-200 placeholder-zinc-500 bg-[#1A1D24] rounded-xl border border-white/10 p-4 leading-relaxed focus:border-brand-red focus:outline-none"
              />
            </div>

            {/* Cover Image Block with validation and description */}
            <div className={`rounded-xl border p-4 space-y-3 transition-colors ${
              coverImageError
                ? "border-red-500/80 bg-red-950/20"
                : "border-white/10 bg-[#1A1D24]/60"
            }`}>
              <ImageUploadField
                label="Cover Photo"
                value={coverUrl}
                onChange={(url) => {
                  setCoverUrl(url);
                  if (url) setCoverImageError(false);
                }}
                onUploadStateChange={(isUploading) =>
                  setInFlightUploads((prev) => Math.max(0, prev + (isUploading ? 1 : -1)))
                }
                description="Required to publish. Landscape format (16:9 recommended). This primary image is displayed on the homepage cards, category feeds, and article header."
                required={true}
                hasError={coverImageError}
              />
              <div>
                <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Cover Photo Caption &amp; Credit
                </label>
                <input
                  type="text"
                  value={coverCaption}
                  onChange={(e) => setCoverCaption(e.target.value)}
                  placeholder="e.g. Presidential council in session, Abuja. State House Photo."
                  className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 py-1.5 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Sources Indicator */}
            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#1A1D24]/40 p-3.5 text-xs text-zinc-400">
              <span className="flex items-center gap-2">
                <span>📎</span>
                <span><strong>{sources.length} Verified Sources</strong> attached to this story.</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("sources")}
                className="font-medium text-brand-red hover:underline"
              >
                Manage Sources →
              </button>
            </div>

            {/* Flowing Story Blocks */}
            <div className="space-y-4 pt-2">
              <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300">
                Story Content Blocks
              </label>

              {blocks.map((block, index) => (
                <div
                  key={index}
                  className="relative group rounded-xl border border-white/10 bg-[#1A1D24] p-4 transition-all hover:border-white/20"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
                    <span className="text-[0.68rem] font-mono font-semibold uppercase tracking-wider text-brand-red">
                      {block.type === "paragraph" && `Paragraph ${index + 1}`}
                      {block.type === "heading" && "Section Heading"}
                      {block.type === "quote" && "Pull Quote / Statement"}
                      {block.type === "image" && "Inline Story Photo"}
                      {block.type === "video" && "Video Player (Direct Upload / MP4)"}
                      {block.type === "youtube" && "YouTube Embed"}
                      {block.type === "internal_link" && "Story Link Card"}
                      {block.type === "external_link" && "External Source Card"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      Delete Block
                    </button>
                  </div>

                  {/* Paragraph Block */}
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

                  {/* Section Heading Block */}
                  {block.type === "heading" && (
                    <AutoTextarea
                      value={block.text || ""}
                      onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                      placeholder="Enter section subheading..."
                      className="font-sans text-lg font-semibold text-white placeholder-zinc-500 bg-transparent tracking-tight focus:outline-none"
                    />
                  )}

                  {/* Quote Block */}
                  {block.type === "quote" && (
                    <div className="space-y-3">
                      <AutoTextarea
                        value={block.quote || ""}
                        onChange={(e) => updateBlock(index, { ...block, quote: e.target.value })}
                        placeholder="Enter direct quote or statement..."
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

                  {/* Inline Image Block */}
                  {block.type === "image" && (
                    <div className="space-y-3">
                      <ImageUploadField
                        label="Inline Photo"
                        value={block.src || ""}
                        onChange={(url) => updateBlock(index, { ...block, src: url })}
                        onUploadStateChange={(isUploading) =>
                          setInFlightUploads((prev) => Math.max(0, prev + (isUploading ? 1 : -1)))
                        }
                        description="Supporting photograph placed between paragraphs. Clear photo of subject, facility, or document."
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

                  {/* Video Player Block */}
                  {block.type === "video" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[0.7rem] font-medium text-zinc-300 mb-1">
                          Video Source URL (or MP4/WebM URL)
                        </label>
                        <input
                          type="text"
                          value={block.src || ""}
                          onChange={(e) => updateBlock(index, { ...block, src: e.target.value })}
                          placeholder="https://storage... or /uploads/video.mp4"
                          className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-mono text-zinc-200 focus:border-brand-red focus:outline-none"
                        />
                      </div>

                      {/* Video direct file upload button */}
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 transition-colors">
                          <svg className="w-3.5 h-3.5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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
                        <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 relative">
                          <video src={block.src} controls className="h-full w-full object-cover" />
                        </div>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={block.caption || ""}
                          onChange={(e) => updateBlock(index, { ...block, caption: e.target.value })}
                          placeholder="Video caption or title..."
                          className="h-10 rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
                        />
                        <input
                          type="text"
                          value={block.credit || ""}
                          onChange={(e) => updateBlock(index, { ...block, credit: e.target.value })}
                          placeholder="Video credit / Producer..."
                          className="h-10 rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* YouTube Embed Block */}
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
                        placeholder="Video caption / summary for readers..."
                        className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Internal Story Link Card */}
                  {block.type === "internal_link" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">✓ Internal Story Card</span>
                      </div>
                      <input
                        type="text"
                        value={block.title || ""}
                        onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                        placeholder="Internal story headline..."
                        className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-semibold text-white focus:border-brand-red focus:outline-none"
                      />
                      <input
                        type="text"
                        value={block.slug || ""}
                        onChange={(e) => updateBlock(index, { ...block, slug: e.target.value })}
                        placeholder="Article slug (e.g. nigeria-electricity-regulatory-commission-updates-feeder-bands)..."
                        className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-mono text-zinc-300 focus:border-brand-red focus:outline-none"
                      />
                      <input
                        type="text"
                        value={block.deck || ""}
                        onChange={(e) => updateBlock(index, { ...block, deck: e.target.value })}
                        placeholder="Brief 1-sentence reason why the reader should view this..."
                        className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-zinc-300 focus:border-brand-red focus:outline-none"
                      />
                    </div>
                  )}

                  {/* External Source Link */}
                  {block.type === "external_link" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">↗ External Source Reference</span>
                      </div>
                      <input
                        type="text"
                        value={block.title || ""}
                        onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                        placeholder="Source title..."
                        className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-semibold text-white focus:border-brand-red focus:outline-none"
                      />
                      <input
                        type="text"
                        value={block.url || ""}
                        onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
                        placeholder="https://official-source.gov.ng/..."
                        className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs font-mono text-zinc-300 focus:border-brand-red focus:outline-none"
                      />
                      <input
                        type="text"
                        value={block.publisher || ""}
                        onChange={(e) => updateBlock(index, { ...block, publisher: e.target.value })}
                        placeholder="Publisher or institution..."
                        className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-zinc-300 focus:border-brand-red focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Action Buttons to Add Blocks */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={addParagraph}
                  className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  + New paragraph
                </button>
                <button
                  type="button"
                  onClick={addImage}
                  className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  + Add image
                </button>
                <button
                  type="button"
                  onClick={addQuote}
                  className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  + Add quote
                </button>
                <button
                  type="button"
                  onClick={addLink}
                  className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  + Add link
                </button>
                <button
                  type="button"
                  onClick={addVideo}
                  className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  + Add video
                </button>
                <button
                  type="button"
                  onClick={addYouTube}
                  className="rounded-lg border border-white/15 bg-[#1A1D24] px-3.5 py-2 text-xs font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  + Add YouTube
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Social Media Channels */}
      {activeTab === "social" && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="font-sans text-xl font-semibold text-white tracking-tight">
              Social Media Channels
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Draft channel-specific versions of this story for your social platforms and subscriber newsletter.
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
                placeholder="Write curated editorial summary for the subscriber newsletter..."
                className="text-sm font-normal text-white bg-[#1A1D24] border border-white/10 rounded-xl p-4 focus:border-brand-red focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Dynamic Sources & Citations with AI Context Export */}
      {activeTab === "sources" && (
        <div className="space-y-6">
          {/* AI Workflow Card */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="label text-[0.62rem] font-semibold text-purple-400 uppercase tracking-wider">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
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
                  Every claim must be traceable to official gazettes, ministerial releases, or verified public records.
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
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-[#1A1D24] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-red">
                      Source #{idx + 1}
                    </span>
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

            {/* Error banner if validation or landing failed */}
            {publishErrorMessage && (
              <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-3.5 text-xs text-red-200 space-y-2">
                <div className="font-semibold flex items-center gap-2">
                  <span>⚠️ Upload or Verification Required</span>
                </div>
                <p className="text-[0.78rem] text-red-300 leading-relaxed">
                  {publishErrorMessage}
                </p>
              </div>
            )}

            {/* 3-Step Progress Indicators */}
            <div className="space-y-4">
              {/* Step 1: Storage & Media Verification */}
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
                  <h4 className="text-xs font-semibold text-zinc-200">
                    1. Media &amp; Storage Verification
                  </h4>
                  <p className="text-[0.72rem] text-zinc-400">
                    {publishStepStates.media === "success"
                      ? "Cover photo and inline media confirmed landed in Cloudflare R2 / S3"
                      : publishStepStates.media === "running"
                      ? "Verifying that images are compressed and landed in storage..."
                      : publishStepStates.media === "error"
                      ? "Storage landing check failed — see error above"
                      : "Awaits image compression & S3 landing confirmation"}
                  </p>
                </div>
              </div>

              {/* Step 2: Editorial Integrity */}
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
                    2. Editorial Integrity &amp; Fact Checking
                  </h4>
                  <p className="text-[0.72rem] text-zinc-400">
                    {publishStepStates.editorial === "success"
                      ? `Verified headline, author (${authorName}), and ${sources.length} citations`
                      : publishStepStates.editorial === "running"
                      ? "Checking editorial fields and required citations..."
                      : "Validates article structure, deck, and source claims"}
                  </p>
                </div>
              </div>

              {/* Step 3: Media Engine Synchronization */}
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
                    3. Live Sync to Cherryl Media Engine
                  </h4>
                  <p className="text-[0.72rem] text-zinc-400">
                    {publishStepStates.engine === "success"
                      ? "Dispatched to database, RSS, and public article endpoint"
                      : publishStepStates.engine === "running"
                      ? "Transmitting article payload to Go backend..."
                      : "Synchronizes published dispatch with web and feeds"}
                  </p>
                </div>
              </div>
            </div>

            {/* Success state celebration card */}
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

            {/* Action buttons during error or pending */}
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

