"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "@/components/admin/ui";
import { LIMITS, normalizeSlug } from "@/components/admin/editor/limits";
import EditorPublishChecklist from "@/components/admin/editor/EditorPublishChecklist";
import EditorTopBar from "@/components/admin/editor/EditorTopBar";
import EditorMetadata from "@/components/admin/editor/EditorMetadata";
import EditorTags from "@/components/admin/editor/EditorTags";
import EditorCoverImage from "@/components/admin/editor/EditorCoverImage";
import EditorBlockList from "@/components/admin/editor/EditorBlockList";
import EditorMoreStories from "@/components/admin/editor/EditorMoreStories";
import EditorSeoPanel from "@/components/admin/editor/EditorSeoPanel";
import EditorAIPanel from "@/components/admin/editor/EditorAIPanel";
import EditorVersions from "@/components/admin/editor/EditorVersions";
import EditorPublishModal from "@/components/admin/editor/EditorPublishModal";
import EditorSocialPanel, { type Channel } from "@/components/admin/editor/EditorSocialPanel";
import EditorSourcesPanel from "@/components/admin/editor/EditorSourcesPanel";
import { useArticleEditor } from "@/hooks/useArticleEditor";
import { useEditorRoute } from "@/hooks/editor/useEditorRoute";
import { usePublishChecklist } from "@/hooks/editor/usePublishChecklist";
import { useSlugAvailability } from "@/hooks/useSlugAvailability";
import { usePublishPipeline } from "@/hooks/usePublishPipeline";
import { useAiFilled } from "@/hooks/useAiFilled";
import { useLead } from "@/hooks/useLead";
import { useVersions } from "@/hooks/useVersions";
import { useAiAssist } from "@/hooks/useAiAssist";
import { blockKey } from "@/hooks/aiFill";
import { slugFromTitle } from "@/lib/editor/fields";

type EditorTab = "story" | "seo" | "social" | "sources";

function AdminEditorContent() {
  const router = useRouter();
  const editor = useArticleEditor(useSearchParams().get("slug"));
  const { contextSlug, candidateId } = useEditorRoute(editor.savedSlug);
  const slugCheck = useSlugAvailability(editor.slug, editor.currentArticleId);
  const publish = usePublishPipeline();

  const ai = useAiFilled();
  const { lead, status: leadStatus } = useLead(candidateId);
  const storeKey = contextSlug
    ? `slug:${contextSlug}`
    : candidateId
    ? `lead:${candidateId}`
    : editor.currentArticleId
    ? `id:${editor.currentArticleId}`
    : "new";
  const versions = useVersions(storeKey);
  const assist = useAiAssist(editor, ai, versions, lead);

  const [activeTab, setActiveTab] = useState<EditorTab>("story");
  const [channel, setChannel] = useState<Channel>("x");
  const [copiedAI, setCopiedAI] = useState(false);
  const [coverImageError, setCoverImageError] = useState(false);

  const checklist = usePublishChecklist(editor, publish, {
    showStoryTab: () => setActiveTab("story"),
    flagCoverError: setCoverImageError,
  });

  // Editing a field counts as reviewing it, so its AI mark goes away.
  const edited = <T,>(key: string, fn: (v: T) => void) => (v: T) => {
    ai.clear(key);
    fn(v);
  };
  const setSourcesEdited: typeof editor.setSources = (action) => {
    ai.clear("sources");
    editor.setSources(action);
  };
  const setChannelText = (c: Channel, value: string) => {
    ai.clear(c);
    ({ x: editor.setXPost, facebook: editor.setFbPost, linkedin: editor.setLiPost, newsletter: editor.setNlPost })[c](value);
  };

  const handleSaveMine = (name: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    versions.save("mine", name || `My draft, ${time}`, editor.currentPayload);
  };

  const handleCopyAI = () => {
    navigator.clipboard.writeText(editor.generateAIContext());
    setCopiedAI(true);
    setTimeout(() => setCopiedAI(false), 3500);
  };

  const trackUpload = (isUploading: boolean) =>
    editor.setInFlightUploads((prev) => Math.max(0, prev + (isUploading ? 1 : -1)));

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-24 lg:pb-0">
      <EditorTopBar
        savedSlug={editor.savedSlug}
        title={editor.title}
        onOpenStory={(slug) => {
          editor.setSelectedSlug(slug);
          router.push(`/admin/editor?slug=${encodeURIComponent(slug)}`);
        }}
        onNewStory={() => {
          editor.handleCreateNewStory();
          router.push("/admin/editor");
        }}
        category={editor.category}
        status={editor.status}
        isDirty={editor.isDirty}
        isSaving={editor.isSubmitting || editor.autosaveStatus === "saving"}
        lastSavedAt={editor.lastSavedAt}
        saveError={editor.saveError}
        copiedAI={copiedAI}
        onCopyAI={handleCopyAI}
        isSubmitting={editor.isSubmitting}
        inFlightUploads={editor.inFlightUploads}
        onSaveDraft={() => void editor.handleSaveDraft()}
        onPublishClick={checklist.handlePublishClick}
      />

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { id: "story", label: "Story" },
          { id: "seo", label: "SEO", dot: Boolean(editor.seoTitle || editor.seoDescription) },
          { id: "social", label: "Social" },
          { id: "sources", label: "Sources", count: editor.sources.length },
        ]}
      />

      {activeTab === "story" && (
        <div className="space-y-4">
          <EditorAIPanel
            lead={lead}
            leadStatus={leadStatus}
            leadApplied={assist.leadApplied}
            aiCount={ai.keys.size}
            onUseDraft={assist.applyLead}
            onStartBlank={assist.clearAiFields}
            onPaste={assist.applyPaste}
            onCopyContext={handleCopyAI}
            copiedAI={copiedAI}
          />

          <EditorVersions
            versions={versions.versions}
            storageFailed={versions.storageFailed}
            onSaveMine={handleSaveMine}
            onWriteMyOwn={assist.writeMyOwn}
            onRestore={(v) => {
              editor.applyPayload(v.payload);
              ai.reset();
            }}
            onDelete={versions.remove}
          />

          <EditorMetadata
            title={editor.title}
            onTitleChange={edited("title", editor.handleTitleChange)}
            subtitle={editor.subtitle}
            onSubtitleChange={edited("subtitle", editor.setSubtitle)}
            excerpt={editor.excerpt}
            onExcerptChange={edited("excerpt", editor.setExcerpt)}
            category={editor.category}
            onCategoryChange={edited("category", editor.setCategory)}
            kicker={editor.kicker}
            onKickerChange={edited("kicker", editor.setKicker)}
            slug={editor.slug}
            onSlugChange={(val) => {
              editor.setSlugManual(true);
              editor.setSlug(normalizeSlug(val));
            }}
            onSyncSlugFromTitle={() => {
              editor.setSlug(slugFromTitle(editor.title, LIMITS.slug));
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
            isAi={ai.has}
          >
            <EditorTags
              tags={editor.tags}
              onAddTag={edited("tags", editor.addTag)}
              onRemoveTag={edited("tags", editor.removeTag)}
              aiFilled={ai.has("tags")}
            />
          </EditorMetadata>

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
            onUploadStateChange={trackUpload}
            hasError={coverImageError}
          />

          <EditorBlockList
            blocks={editor.blocks}
            onAddBlock={editor.addBlock}
            onUpdateBlock={(i, updated) => {
              const b = editor.blocks[i];
              if (b) ai.clear(blockKey(b));
              editor.updateBlock(i, updated);
            }}
            isAiBlock={(b) => ai.has(blockKey(b))}
            onMoveBlock={editor.moveBlock}
            onRemoveBlock={editor.removeBlock}
            onUploadStateChange={trackUpload}
          />

          <EditorMoreStories
            relatedStories={editor.relatedStories}
            onAddRelatedStory={editor.addRelatedStory}
            onUpdateRelatedStory={editor.updateRelatedStory}
            onRemoveRelatedStory={editor.removeRelatedStory}
          />
        </div>
      )}

      {activeTab === "seo" && (
        <EditorSeoPanel
          seoTitle={editor.seoTitle}
          onSeoTitleChange={edited("seoTitle", editor.setSeoTitle)}
          defaultTitle={editor.title}
          seoSlug={editor.seoSlug}
          onSeoSlugChange={editor.setSeoSlug}
          defaultSlug={editor.slug}
          seoDescription={editor.seoDescription}
          onSeoDescriptionChange={edited("seoDescription", editor.setSeoDescription)}
          isAi={ai.has}
          defaultDescription={editor.excerpt || editor.subtitle}
        />
      )}

      {activeTab === "social" && (
        <EditorSocialPanel
          channel={channel}
          onChannelChange={setChannel}
          values={{ x: editor.xPost, facebook: editor.fbPost, linkedin: editor.liPost, newsletter: editor.nlPost }}
          onChange={setChannelText}
          isAi={ai.has}
        />
      )}

      {activeTab === "sources" && (
        <EditorSourcesPanel
          sources={editor.sources}
          onChange={setSourcesEdited}
          isAi={ai.has("sources")}
          copiedAI={copiedAI}
          onCopyAI={handleCopyAI}
        />
      )}

      <EditorPublishChecklist
        items={checklist.missing}
        onClose={checklist.closeChecklist}
        onGo={checklist.goToField}
        onSaveDraft={() => void editor.handleSaveDraft()}
        canSaveDraft={editor.isDirty}
        isSaving={editor.isSubmitting}
      />

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
        onSaveDraft={async () => {
          if (await editor.handleSaveDraft({ forceDraft: true })) publish.close();
        }}
        isSaving={editor.isSubmitting}
      />
    </div>
  );
}

export default function AdminEditorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px] text-sm text-zinc-400">Loading editor</div>}>
      <AdminEditorContent />
    </Suspense>
  );
}
