"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AIChip, Btn, Label, Panel, Tabs, TextInput } from "@/components/admin/ui";
import { LIMITS, normalizeSlug } from "@/components/admin/editor/limits";
import EditorPublishChecklist, { type MissingItem } from "@/components/admin/editor/EditorPublishChecklist";
import { PlusIcon, SparkIcon, TrashIcon } from "@/components/admin/editor/icons";
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
import { useArticleEditor } from "@/hooks/useArticleEditor";
import { useSlugAvailability } from "@/hooks/useSlugAvailability";
import { usePublishPipeline } from "@/hooks/usePublishPipeline";
import { useAiFilled } from "@/hooks/useAiFilled";
import { useLead } from "@/hooks/useLead";
import { useVersions } from "@/hooks/useVersions";
import { useAiAssist } from "@/hooks/useAiAssist";
import { blockKey } from "@/hooks/aiFill";

function SocialField({
  ai,
  label,
  id,
  value,
  onChange,
  placeholder,
  max,
}: {
  max: number;
  ai?: boolean;
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>
        {label} {ai && <AIChip className="ml-1" />}
      </Label>
      <TextInput
        id={id}
        multiline
        alwaysCount
        value={value}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-24 leading-relaxed"
      />
    </div>
  );
}

function AdminEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlSlug = searchParams.get("slug");

  // Which story or lead this page was opened for. Our own address updates after a save do not change it.
  const ownSlug = useRef<string | null>(null);
  const [ctx, setCtx] = useState({ slug: urlSlug, cand: urlSlug ? null : searchParams.get("candidate") });
  useEffect(() => {
    const s = searchParams.get("slug");
    if (s && s === ownSlug.current) return;
    setCtx((prev) => {
      const next = { slug: s, cand: s ? null : searchParams.get("candidate") };
      return prev.slug === next.slug && prev.cand === next.cand ? prev : next;
    });
  }, [searchParams]);
  const candidateId = ctx.cand;

  // Domain state and operations managed cleanly by custom hook
  const editor = useArticleEditor(urlSlug);

  // Debounced slug check managed cleanly by custom hook
  const slugCheck = useSlugAvailability(editor.slug, editor.currentArticleId);

  // Publishing verification pipeline managed cleanly by custom hook
  const publish = usePublishPipeline();

  // AI help: which fields AI filled, the lead we started from, and saved versions
  const ai = useAiFilled();
  const { lead, status: leadStatus } = useLead(candidateId);
  const storeKey = ctx.slug
    ? `slug:${ctx.slug}`
    : candidateId
    ? `lead:${candidateId}`
    : editor.currentArticleId
    ? `id:${editor.currentArticleId}`
    : "new";
  const versions = useVersions(storeKey);
  const assist = useAiAssist(editor, ai, versions, lead);

  // Editing a field counts as reviewing it, so its AI mark goes away
  const edited = <T,>(key: string, fn: (v: T) => void) => (v: T) => {
    ai.clear(key);
    fn(v);
  };
  const setSourcesEdited: typeof editor.setSources = (action) => {
    ai.clear("sources");
    editor.setSources(action);
  };

  const handleSaveMine = (name: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    versions.save("mine", name || `My draft, ${time}`, editor.currentPayload);
  };

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

  // When the story's address changes (first save, or a new slug), show it in the URL without reloading
  useEffect(() => {
    if (!editor.savedSlug) return;
    const wanted = `/admin/editor?slug=${encodeURIComponent(editor.savedSlug)}`;
    ownSlug.current = editor.savedSlug;
    if (`${window.location.pathname}${window.location.search}` !== wanted) {
      window.history.replaceState(window.history.state, "", wanted);
    }
  }, [editor.savedSlug]);

  // Publish checklist: what is missing, and a way to jump straight to it
  const [missing, setMissing] = useState<MissingItem[] | null>(null);

  const findMissing = (): MissingItem[] => {
    const list: MissingItem[] = [];
    if (!editor.title.trim()) list.push({ id: "title", problem: "The story has no headline.", action: "Write a headline" });
    if (!editor.category) list.push({ id: "category", problem: "No category is chosen.", action: "Choose a category" });
    if (!editor.coverUrl.trim()) list.push({ id: "cover", problem: "The story has no cover photo.", action: "Add a cover photo" });
    const hasBody = editor.blocks.some(
      (b) => b.type === "paragraph" && b.text.trim() && b.text.trim() !== "Draft your opening paragraph here...",
    );
    if (!hasBody) list.push({ id: "body", problem: "The body has no paragraph with text.", action: "Write a paragraph" });
    return list;
  };

  const goToField = (item: MissingItem) => {
    setMissing(null);
    setActiveTab("story");
    const targets: Record<string, string> = {
      title: "story-title",
      category: "story-category",
      cover: "cover-section",
      body: "body-section",
    };
    window.setTimeout(() => {
      const el = document.getElementById(targets[item.id]);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const focusable = el.matches("input,textarea,select,button")
        ? el
        : el.querySelector<HTMLElement>(item.id === "body" ? "textarea" : "button");
      window.setTimeout(() => (focusable as HTMLElement | null)?.focus({ preventScroll: true }), 350);
    }, 120);
  };

  const handlePublishClick = async () => {
    const problems = findMissing();
    if (problems.length > 0) {
      setCoverImageError(!editor.coverUrl.trim());
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

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-24 lg:pb-0">
      {/* Top action bar */}
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
        onPublishClick={handlePublishClick}
      />

      {/* Section switcher. It scrolls sideways on narrow screens. */}
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

      {/* TAB 1: Story & Content Flow */}
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
              const auto = editor.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .slice(0, LIMITS.slug)
                .replace(/-+$/g, "");
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
            onUploadStateChange={(isUploading) =>
              editor.setInFlightUploads((prev) => Math.max(0, prev + (isUploading ? 1 : -1)))
            }
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
            onUploadStateChange={(isUploading) =>
              editor.setInFlightUploads((prev) => Math.max(0, prev + (isUploading ? 1 : -1)))
            }
          />

          <EditorMoreStories
            relatedStories={editor.relatedStories}
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

      {/* TAB 3: Social */}
      {activeTab === "social" && (
        <Panel title="Social posts" description="Write a version of this story for each channel.">
          <div className="space-y-4">
            <Tabs
              value={socialTab}
              onChange={setSocialTab}
              items={[
                { id: "x", label: "X" },
                { id: "facebook", label: "Facebook" },
                { id: "linkedin", label: "LinkedIn" },
                { id: "newsletter", label: "Newsletter" },
              ]}
            />
            {socialTab === "x" && (
              <SocialField label="X post" id="social-x" max={LIMITS.x} ai={ai.has("x")} value={editor.xPost} onChange={edited("x", editor.setXPost)} placeholder="Key facts and the link" />
            )}
            {socialTab === "facebook" && (
              <SocialField label="Facebook post" id="social-fb" max={LIMITS.facebook} ai={ai.has("facebook")} value={editor.fbPost} onChange={edited("facebook", editor.setFbPost)} placeholder="Context and headline" />
            )}
            {socialTab === "linkedin" && (
              <SocialField label="LinkedIn post" id="social-li" max={LIMITS.linkedin} ai={ai.has("linkedin")} value={editor.liPost} onChange={edited("linkedin", editor.setLiPost)} placeholder="The business or policy angle" />
            )}
            {socialTab === "newsletter" && (
              <SocialField label="Newsletter summary" id="social-nl" max={LIMITS.newsletter} ai={ai.has("newsletter")} value={editor.nlPost} onChange={edited("newsletter", editor.setNlPost)} placeholder="A short summary for subscribers" />
            )}
          </div>
        </Panel>
      )}

      {/* TAB 4: Sources */}
      {activeTab === "sources" && (
        <div className="space-y-4">
          <Panel
            tone="ai"
            title="Check this story with AI"
            description="Copies the headline, sources, body and social drafts so you can paste them into an AI tool to fact-check."
            actions={
              <Btn onClick={handleCopyAI} block>
                <SparkIcon />
                {copiedAI ? "Copied" : "Copy for AI"}
              </Btn>
            }
          />

          <Panel
            title="Sources"
            description="Every claim should trace back to an official or public record."
            actions={
              <>
                {ai.has("sources") && <AIChip />}
              <Btn
                block
                onClick={() =>
                  setSourcesEdited((prev) => [...prev, { url: "", publisher: "", claimSummary: "" }])
                }
              >
                <PlusIcon />
                Add source
              </Btn>
              </>
            }
          >
            {editor.sources.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
                No sources yet.
              </div>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {editor.sources.map((s, idx) => (
                  <div key={idx} className="space-y-3 rounded-xl border border-white/10 bg-[#1A1D24] p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-300">Source {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setSourcesEdited((prev) => prev.filter((_, i) => i !== idx))}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-red-400 sm:h-9 sm:w-9"
                        aria-label={`Remove source ${idx + 1}`}
                        title="Remove source"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    <div>
                      <Label>Publisher</Label>
                      <TextInput
                        maxLength={LIMITS.sourcePublisher}
                        value={s.publisher}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSourcesEdited((prev) => prev.map((item, i) => (i === idx ? { ...item, publisher: val } : item)));
                        }}
                        placeholder="e.g. State House Official Gazette"
                      />
                    </div>
                    <div>
                      <Label>Link</Label>
                      <TextInput
                        maxLength={LIMITS.sourceUrl}
                        value={s.url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSourcesEdited((prev) => prev.map((item, i) => (i === idx ? { ...item, url: val } : item)));
                        }}
                        className="font-mono"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label>What it confirms</Label>
                      <TextInput
                        multiline
                        maxLength={LIMITS.claimSummary}
                        value={s.claimSummary || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSourcesEdited((prev) => prev.map((item, i) => (i === idx ? { ...item, claimSummary: val } : item)));
                        }}
                        placeholder="e.g. Official confirmation of the new tariff"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}

      <EditorPublishChecklist
        items={missing}
        onClose={() => setMissing(null)}
        onGo={goToField}
        onSaveDraft={() => void editor.handleSaveDraft()}
        canSaveDraft={editor.isDirty}
        isSaving={editor.isSubmitting}
      />

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
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px] text-sm text-zinc-400">
          Loading editor
        </div>
      }
    >
      <AdminEditorContent />
    </Suspense>
  );
}
