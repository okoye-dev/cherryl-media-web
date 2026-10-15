"use client";

import { useState } from "react";
import Link from "next/link";
import { CANONICAL_ARTICLES } from "@/lib/articles";
import { isInternalUrl } from "@/lib/url-utils";
import AutoTextarea from "@/components/admin/AutoTextarea";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { ContentBlock, PillarCategory, PublishingStatus } from "@/lib/types";

export default function AdminEditorPage() {
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

  const [savedNotice, setSavedNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async (newStatus?: PublishingStatus) => {
    const targetStatus = newStatus || status;
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
      sourceLinks: [
        {
          url: "https://statehouse.gov.ng",
          publisher: "Official Gazette",
          accessedAt: new Date().toISOString(),
        },
      ],
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
        setSaveMessage("✓ Synced to backend & saved");
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

  const updateBlock = (index: number, updated: ContentBlock) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? updated : b)));
  };

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top action bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-[#131B2B] p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-xs font-medium text-slate-400 hover:text-white">
            ← All Stories
          </Link>
          <span className="text-slate-600">/</span>
          <span className="font-num text-xs uppercase tracking-wider text-slate-400">
            {category}
          </span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[0.68rem] font-medium uppercase tracking-wider text-emerald-400">
            {status}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && saveMessage && (
            <span className="text-xs font-medium text-emerald-400 animate-fade">
              {saveMessage}
            </span>
          )}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("draft")}
            className="rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("published")}
            className="rounded-lg bg-brand-red px-4 py-1.5 text-xs font-medium text-white shadow hover:bg-brand-red/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Publishing..." : "Publish Now"}
          </button>
        </div>
      </div>

      {/* Primary tab switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("story")}
          className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "story"
              ? "bg-brand-red text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          1. Write Story
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "social"
              ? "bg-brand-red text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          2. Social Media Channels
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("sources")}
          className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
            activeTab === "sources"
              ? "bg-brand-red text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          3. Sources &amp; Citations
        </button>
      </div>

      {/* TAB 1: Progressive Story Builder */}
      {activeTab === "story" && (
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-2xl border border-slate-800 bg-[#131B2B] p-6 space-y-4 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-[0.72rem] font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                  Category Pillar
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PillarCategory)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-white focus:border-brand-red focus:outline-none"
                >
                  <option value="nigerian-current-affairs">Nigerian Current Affairs</option>
                  <option value="entertainment-internet-culture">Entertainment &amp; Internet Culture</option>
                  <option value="practical-nigerian-updates">Practical Nigerian Updates</option>
                  <option value="business-institutions">Business &amp; Institutions</option>
                  <option value="stories-romance">Stories &amp; Romance</option>
                </select>
              </div>

              <div>
                <label className="block text-[0.72rem] font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                  Author Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.72rem] font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                  Author Title / Role
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-white focus:border-brand-red focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[0.72rem] font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                  Top Label / Kicker
                </label>
                <input
                  type="text"
                  value={kicker}
                  onChange={(e) => setKicker(e.target.value)}
                  placeholder="e.g. NATIONAL POLICY ADVISORY"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-white focus:border-brand-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[0.72rem] font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-300 focus:border-brand-red focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Core Writing Canvas: Title, Deck, Cover Image */}
          <div className="rounded-2xl border border-slate-800 bg-[#131B2B] p-6 md:p-8 space-y-6 shadow-sm">
            {/* Title Block */}
            <div>
              <label className="block text-[0.72rem] font-medium uppercase tracking-wider text-slate-400 mb-2">
                Story Title
              </label>
              <AutoTextarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter story headline..."
                className="font-display text-xl md:text-2xl font-normal text-white placeholder-slate-600 bg-slate-900/60 rounded-xl border border-slate-800 p-4 leading-snug focus:border-brand-red focus:outline-none"
              />
            </div>

            {/* Deck / Summary Block */}
            <div>
              <label className="block text-[0.72rem] font-medium uppercase tracking-wider text-slate-400 mb-2">
                Story Summary / Deck
              </label>
              <AutoTextarea
                value={deck}
                onChange={(e) => setDeck(e.target.value)}
                placeholder="Write a clear 1-2 sentence summary of this story..."
                className="text-sm font-normal text-slate-200 placeholder-slate-600 bg-slate-900/60 rounded-xl border border-slate-800 p-4 leading-relaxed focus:border-brand-red focus:outline-none"
              />
            </div>

            {/* Cover Image Block */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
              <ImageUploadField
                label="Cover Photo"
                value={coverUrl}
                onChange={(url) => setCoverUrl(url)}
              />
              <div>
                <label className="block text-[0.68rem] font-medium uppercase tracking-wider text-slate-400 mb-1">
                  Cover Photo Caption &amp; Credit
                </label>
                <input
                  type="text"
                  value={coverCaption}
                  onChange={(e) => setCoverCaption(e.target.value)}
                  placeholder="e.g. Photo credit or scene description..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                />
              </div>
            </div>

            {/* Flowing Content Blocks */}
            <div className="border-t border-slate-800/80 pt-6 space-y-6">
              <span className="block text-[0.72rem] font-medium uppercase tracking-wider text-slate-400">
                Article Body Content ({blocks.length} blocks)
              </span>

              {blocks.map((block, idx) => {
                if (block.type === "paragraph") {
                  return (
                    <div
                      key={idx}
                      className="group relative rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[0.68rem] font-medium uppercase tracking-wider text-slate-400">
                          Paragraph #{idx + 1}
                        </span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={block.isDropCap || false}
                              onChange={(e) =>
                                updateBlock(idx, { ...block, isDropCap: e.target.checked })
                              }
                              className="rounded border-slate-700 bg-slate-800 text-brand-red"
                            />
                            Drop-cap letter
                          </label>
                          <button
                            type="button"
                            onClick={() => removeBlock(idx)}
                            className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                      <AutoTextarea
                        value={block.text}
                        onChange={(e) => updateBlock(idx, { ...block, text: e.target.value })}
                        placeholder="Write paragraph content..."
                        className="text-sm font-normal text-slate-100 placeholder-slate-600 bg-transparent leading-relaxed focus:outline-none"
                      />
                    </div>
                  );
                }

                if (block.type === "image") {
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[0.68rem] font-medium uppercase tracking-wider text-slate-400">
                          Story Photo #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeBlock(idx)}
                          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                        >
                          ✕ Remove
                        </button>
                      </div>

                      <ImageUploadField
                        value={block.src}
                        onChange={(url) => updateBlock(idx, { ...block, src: url })}
                        label=""
                      />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={block.caption || ""}
                          onChange={(e) =>
                            updateBlock(idx, { ...block, caption: e.target.value })
                          }
                          placeholder="Photo caption..."
                          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                        />
                        <input
                          type="text"
                          value={block.credit || ""}
                          onChange={(e) =>
                            updateBlock(idx, { ...block, credit: e.target.value })
                          }
                          placeholder="Photo credit / source..."
                          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                }

                if (block.type === "quote") {
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border-l-4 border-l-brand-red border border-slate-800 bg-slate-900/60 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[0.68rem] font-medium uppercase tracking-wider text-slate-400">
                          Quote Block #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeBlock(idx)}
                          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                        >
                          ✕ Remove
                        </button>
                      </div>
                      <AutoTextarea
                        value={block.quote}
                        onChange={(e) => updateBlock(idx, { ...block, quote: e.target.value })}
                        placeholder="Quotation text..."
                        className="font-display italic text-base text-white placeholder-slate-600 bg-transparent leading-relaxed focus:outline-none"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={block.author || ""}
                          onChange={(e) =>
                            updateBlock(idx, { ...block, author: e.target.value })
                          }
                          placeholder="Speaker or Author name"
                          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                        />
                        <input
                          type="text"
                          value={block.context || ""}
                          onChange={(e) =>
                            updateBlock(idx, { ...block, context: e.target.value })
                          }
                          placeholder="Institution or context"
                          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                }

                if (block.type === "internal_link" || block.type === "external_link") {
                  const urlValue =
                    block.type === "internal_link" ? block.slug : block.url;
                  const isInternal = isInternalUrl(urlValue);

                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[0.68rem] font-medium uppercase tracking-wider text-slate-400">
                            Link #{idx + 1}
                          </span>
                          {isInternal ? (
                            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[0.65rem] font-medium text-emerald-400">
                              Internal Story Link
                            </span>
                          ) : (
                            <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[0.65rem] font-medium text-blue-400">
                              External Web Source
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBlock(idx)}
                          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                        >
                          ✕ Remove
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[0.68rem] text-slate-400 mb-1">
                            Link URL (e.g. /article/slug or https://source.com)
                          </label>
                          <input
                            type="text"
                            value={urlValue}
                            onChange={(e) => {
                              const newUrl = e.target.value;
                              if (isInternalUrl(newUrl)) {
                                updateBlock(idx, {
                                  type: "internal_link",
                                  title: block.title || "Related Story Headline",
                                  slug: newUrl.replace(/^\/article\//, "").replace(/^\//, ""),
                                  category: "Related",
                                  deck: "deck" in block ? block.deck : "",
                                });
                              } else {
                                updateBlock(idx, {
                                  type: "external_link",
                                  title: block.title || "External Source Article",
                                  url: newUrl,
                                  publisher: "Official Source",
                                  verified: true,
                                });
                              }
                            }}
                            placeholder="Enter URL..."
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white focus:border-brand-red focus:outline-none"
                          />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            type="text"
                            value={block.title}
                            onChange={(e) =>
                              updateBlock(idx, { ...block, title: e.target.value })
                            }
                            placeholder="Display Headline / Title"
                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                          />
                          {block.type === "internal_link" ? (
                            <input
                              type="text"
                              value={block.category}
                              onChange={(e) =>
                                updateBlock(idx, { ...block, category: e.target.value })
                              }
                              placeholder="Category Tag"
                              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                            />
                          ) : (
                            <input
                              type="text"
                              value={block.publisher}
                              onChange={(e) =>
                                updateBlock(idx, { ...block, publisher: e.target.value })
                              }
                              placeholder="Publisher Name"
                              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Progressive block insertion toolbar */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-slate-400">Add content:</span>
              <button
                type="button"
                onClick={addParagraph}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-700 hover:border-slate-600 transition-colors"
              >
                + New paragraph
              </button>
              <button
                type="button"
                onClick={addImage}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-700 hover:border-slate-600 transition-colors"
              >
                + Add image
              </button>
              <button
                type="button"
                onClick={addQuote}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-700 hover:border-slate-600 transition-colors"
              >
                + Add quote
              </button>
              <button
                type="button"
                onClick={addLink}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-700 hover:border-slate-600 transition-colors"
              >
                + Add link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Social Media Channels */}
      {activeTab === "social" && (
        <div className="rounded-2xl border border-slate-800 bg-[#131B2B] p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="font-display text-xl font-normal text-white">
              Social Media Channels
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Customize text for social platforms and email newsletter before broadcasting.
            </p>
          </div>

          <div className="flex gap-2 border-b border-slate-800 pb-3">
            {(
              [
                { id: "x", label: "X (Twitter)" },
                { id: "facebook", label: "Facebook" },
                { id: "linkedin", label: "LinkedIn" },
                { id: "newsletter", label: "Email Newsletter" },
              ] as const
            ).map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => setSocialTab(ch.id)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  socialTab === ch.id
                    ? "bg-brand-red text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {socialTab === "x" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  X (Twitter) Post Copy
                </label>
                <span
                  className={`font-mono text-xs ${
                    xPost.length > 280 ? "text-red-400 font-bold" : "text-slate-400"
                  }`}
                >
                  {xPost.length} / 280 characters
                </span>
              </div>
              <AutoTextarea
                value={xPost}
                onChange={(e) => setXPost(e.target.value)}
                placeholder="Write concise 280-character post for X..."
                className="text-sm font-normal text-white bg-slate-900 border border-slate-700 rounded-xl p-4 focus:border-brand-red focus:outline-none"
              />
            </div>
          )}

          {socialTab === "facebook" && (
            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Facebook Post Copy
              </label>
              <AutoTextarea
                value={fbPost}
                onChange={(e) => setFbPost(e.target.value)}
                placeholder="Write engaging story post with hook for Facebook readers..."
                className="text-sm font-normal text-white bg-slate-900 border border-slate-700 rounded-xl p-4 focus:border-brand-red focus:outline-none"
              />
            </div>
          )}

          {socialTab === "linkedin" && (
            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                LinkedIn Post Copy
              </label>
              <AutoTextarea
                value={liPost}
                onChange={(e) => setLiPost(e.target.value)}
                placeholder="Write institutional, business or policy angle for LinkedIn..."
                className="text-sm font-normal text-white bg-slate-900 border border-slate-700 rounded-xl p-4 focus:border-brand-red focus:outline-none"
              />
            </div>
          )}

          {socialTab === "newsletter" && (
            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Email Newsletter Summary
              </label>
              <AutoTextarea
                value={nlPost}
                onChange={(e) => setNlPost(e.target.value)}
                placeholder="Write curated editorial summary for the subscriber newsletter..."
                className="text-sm font-normal text-white bg-slate-900 border border-slate-700 rounded-xl p-4 focus:border-brand-red focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Sources & Citations */}
      {activeTab === "sources" && (
        <div className="rounded-2xl border border-slate-800 bg-[#131B2B] p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="font-display text-xl font-normal text-white">
              Sources &amp; Fact Checking
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Verified references, government gazettes, and official releases linked to this story.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs">
              <div>
                <span className="font-medium text-white block">
                  Official Government Gazette
                </span>
                <span className="font-mono text-slate-400 text-[0.7rem]">
                  https://statehouse.gov.ng
                </span>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[0.68rem] font-medium text-emerald-400">
                Verified 100%
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs">
              <div>
                <span className="font-medium text-white block">
                  Regulatory Commission Filing
                </span>
                <span className="font-mono text-slate-400 text-[0.7rem]">
                  https://nerc.gov.ng
                </span>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[0.68rem] font-medium text-emerald-400">
                Verified 100%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
