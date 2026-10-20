"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AutoTextarea from "@/components/admin/AutoTextarea";
import EditorTopBar from "@/components/admin/editor/EditorTopBar";
import EditorMetadata from "@/components/admin/editor/EditorMetadata";
import EditorTags from "@/components/admin/editor/EditorTags";
import EditorCoverImage from "@/components/admin/editor/EditorCoverImage";
import EditorBlockList from "@/components/admin/editor/EditorBlockList";
import EditorMoreStories from "@/components/admin/editor/EditorMoreStories";
import EditorSeoPanel from "@/components/admin/editor/EditorSeoPanel";
import EditorPublishModal from "@/components/admin/editor/EditorPublishModal";
import { useArticleEditor } from "@/hooks/useArticleEditor";
import { useSlugAvailability } from "@/hooks/useSlugAvailability";
import { usePublishPipeline } from "@/hooks/usePublishPipeline";

function AdminEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlSlug = searchParams.get("slug");

  // Domain state and operations managed cleanly by custom hook
  const editor = useArticleEditor(urlSlug);

  // Debounced slug check managed cleanly by custom hook
  const slugCheck = useSlugAvailability(editor.slug, editor.currentArticleId);

  // Publishing verification pipeline managed cleanly by custom hook
  const publish = usePublishPipeline();

  // Tab & feedback UI states
  const [activeTab, setActiveTab] = useState<"story" | "seo" | "social" | "sources">("story");
  const [socialTab, setSocialTab] = useState<"x" | "facebook" | "linkedin" | "newsletter">("x");
  const [copiedAI, setCopiedAI] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);

  const handleCopyAI = () => {
    navigator.clipboard.writeText(editor.generateAIContext());
    setCopiedAI(true);
    setTimeout(() => setCopiedAI(false), 3500);
  };

  const handlePublishClick = async () => {
    if (!editor.coverUrl.trim()) {
      setCoverImageError(true);
    }
    await publish.startPublish(editor.currentPayload, {
      inFlightUploads: editor.inFlightUploads,
      coverUrl: editor.coverUrl,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top action bar */}
      <EditorTopBar
        articlesList={editor.articlesList}
        selectedSlug={editor.selectedSlug}
        onSelectStory={(newSlug) => {
          editor.setSelectedSlug(newSlug);
          if (newSlug === "__new__") {
            editor.handleCreateNewStory();
            router.push("/admin/editor");
          } else {
            router.push(`/admin/editor?slug=${newSlug}`);
          }
        }}
        category={editor.category}
        status={editor.status}
        autosaveStatus={editor.autosaveStatus}
        lastAutosavedTime={editor.lastAutosavedTime}
        saveMessage={editor.saveMessage}
        copiedAI={copiedAI}
        onCopyAI={handleCopyAI}
        isSubmitting={editor.isSubmitting}
        inFlightUploads={editor.inFlightUploads}
        onSaveDraft={editor.handleSaveDraft}
        onPublishClick={handlePublishClick}
      />

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
          1. Story &amp; Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "seo"
              ? "bg-brand-red text-white"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <span>2. SEO &amp; Meta</span>
          {(editor.seoTitle || editor.seoDescription) && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          )}
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
          3. Social Media Channels
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
          <span>4. Sources &amp; Citations</span>
          <span className="rounded-full bg-white/15 px-1.5 py-0.2 text-[0.65rem]">
            {editor.sources.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Story & Content Flow */}
      {activeTab === "story" && (
        <div className="space-y-6">
          <EditorMetadata
            title={editor.title}
            onTitleChange={editor.handleTitleChange}
            subtitle={editor.subtitle}
            onSubtitleChange={editor.setSubtitle}
            excerpt={editor.excerpt}
            onExcerptChange={editor.setExcerpt}
            category={editor.category}
            onCategoryChange={editor.setCategory}
            kicker={editor.kicker}
            onKickerChange={editor.setKicker}
            slug={editor.slug}
            onSlugChange={(val) => {
              editor.setSlugManual(true);
              editor.setSlug(val);
            }}
            onSyncSlugFromTitle={() => {
              const auto = editor.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
              editor.setSlug(auto);
              editor.setSlugManual(true);
            }}
            slugStatus={slugCheck.status}
            slugMessage={slugCheck.message}
            authorName={editor.authorName}
            onAuthorNameChange={editor.setAuthorName}
            authorRole={editor.authorRole}
            onAuthorRoleChange={editor.setAuthorRole}
            sendWebpushr={editor.sendWebpushr}
            onSendWebpushrChange={editor.setSendWebpushr}
          />

          <EditorTags
            tags={editor.tags}
            onAddTag={editor.addTag}
            onRemoveTag={editor.removeTag}
          />

          <EditorCoverImage
            coverUrl={editor.coverUrl}
            onCoverUrlChange={(url) => {
              editor.setCoverUrl(url);
              if (url) setCoverImageError(false);
            }}
            coverCaption={editor.coverCaption}
            onCoverCaptionChange={editor.setCoverCaption}
            coverCredit={editor.coverCredit}
            onCoverCreditChange={editor.setCoverCredit}
            onUploadStateChange={(isUploading) =>
              editor.setInFlightUploads((prev) => Math.max(0, prev + (isUploading ? 1 : -1)))
            }
            hasError={coverImageError}
          />

          <EditorBlockList
            blocks={editor.blocks}
            articlesList={editor.articlesList}
            onAddBlock={editor.addBlock}
            onUpdateBlock={editor.updateBlock}
            onMoveBlock={editor.moveBlock}
            onRemoveBlock={editor.removeBlock}
            onUploadStateChange={(isUploading) =>
              editor.setInFlightUploads((prev) => Math.max(0, prev + (isUploading ? 1 : -1)))
            }
          />

          <EditorMoreStories
            relatedStories={editor.relatedStories}
            articlesList={editor.articlesList}
            onAddRelatedStory={editor.addRelatedStory}
            onUpdateRelatedStory={editor.updateRelatedStory}
            onRemoveRelatedStory={editor.removeRelatedStory}
          />
        </div>
      )}

      {/* TAB 2: SEO & Meta */}
      {activeTab === "seo" && (
        <EditorSeoPanel
          seoTitle={editor.seoTitle}
          onSeoTitleChange={editor.setSeoTitle}
          defaultTitle={editor.title}
          seoSlug={editor.seoSlug}
          onSeoSlugChange={editor.setSeoSlug}
          defaultSlug={editor.slug}
          seoDescription={editor.seoDescription}
          onSeoDescriptionChange={editor.setSeoDescription}
          defaultDescription={editor.excerpt || editor.subtitle}
        />
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
                value={editor.xPost}
                onChange={(e) => editor.setXPost(e.target.value)}
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
                value={editor.fbPost}
                onChange={(e) => editor.setFbPost(e.target.value)}
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
                value={editor.liPost}
                onChange={(e) => editor.setLiPost(e.target.value)}
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
                value={editor.nlPost}
                onChange={(e) => editor.setNlPost(e.target.value)}
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
                  Copy this story&apos;s full brief (headline, deck, verified sources, body text, and social drafts) into your clipboard to paste into ChatGPT, Claude, or Gemini to fact-check and refine.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyAI}
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
                  editor.setSources((prev) => [
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
              {editor.sources.map((s, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-[#1A1D24] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-red">Source #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => editor.setSources((prev) => prev.filter((_, i) => i !== idx))}
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
                          editor.setSources((prev) =>
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
                          editor.setSources((prev) =>
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
                        editor.setSources((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, claimSummary: val } : item))
                        );
                      }}
                      className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-xs text-white focus:border-brand-red focus:outline-none"
                      placeholder="e.g. Official confirmation of tariff stabilization"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Publishing Flow Modal */}
      <EditorPublishModal
        isOpen={publish.isOpen}
        onClose={publish.close}
        step={publish.step}
        stepStates={publish.stepStates}
        errorMessage={publish.errorMessage}
        publishedSlug={publish.publishedSlug}
        title={editor.title}
        authorName={editor.authorName}
        category={editor.category}
        blockCount={editor.blocks.length}
        onRetry={handlePublishClick}
      />
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
