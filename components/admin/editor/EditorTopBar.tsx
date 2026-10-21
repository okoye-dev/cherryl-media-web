import { useState } from "react";
import { Badge, Btn } from "@/components/admin/ui";
import StoryPicker from "@/components/admin/StoryPicker";
import EditorPickerSheet from "./EditorPickerSheet";
import { SparkIcon } from "./icons";
import type { PillarCategory, PublishingStatus } from "@/lib/types";

interface EditorTopBarProps {
  /** The address the story is stored under, empty for a story never saved */
  savedSlug: string;
  title: string;
  isDirty: boolean;
  onOpenStory: (slug: string) => void;
  onNewStory: () => void;
  category: PillarCategory;
  status: PublishingStatus;
  isSaving: boolean;
  lastSavedAt: string | null;
  saveError: string | null;
  copiedAI: boolean;
  onCopyAI: () => void;
  isSubmitting: boolean;
  inFlightUploads: number;
  onSaveDraft: () => void;
  onPublishClick: () => void;
}

export default function EditorTopBar({
  savedSlug,
  title,
  onOpenStory,
  onNewStory,
  category,
  status,
  isDirty,
  isSaving,
  lastSavedAt,
  saveError,
  copiedAI,
  onCopyAI,
  isSubmitting,
  inFlightUploads,
  onSaveDraft,
  onPublishClick,
}: EditorTopBarProps) {
  const uploading = inFlightUploads > 0;
  const live = status === "published";
  const saveLabel = isSubmitting ? "Saving" : isDirty ? (live ? "Save changes" : "Save draft") : "Saved";
  const saveDisabled = isSubmitting || isSaving || !isDirty;
  const publishLabel = uploading ? "Uploading media" : live ? "Update live story" : "Publish";
  const isExisting = savedSlug !== "";
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <div className="space-y-3 rounded-xl border border-white/[0.08] bg-[#16181D] p-4">
        {/* Row 1: way back, status, autosave */}
        <div className="flex items-center justify-between gap-3">
          <Btn href="/admin" variant="ghost" arrow="back" className="-ml-2 !h-10 px-2">
            All stories
          </Btn>
          <Badge tone={live ? "green" : "amber"}>{status}</Badge>
        </div>

        {/* The one place that says whether your work is stored */}
        <p
          role="status"
          className={`flex items-start gap-2 text-xs ${
            saveError ? "text-red-300" : isSaving || isDirty ? "text-amber-300" : "text-zinc-400"
          }`}
        >
          <span
            className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
              saveError ? "bg-red-400" : isSaving ? "animate-ping bg-amber-400" : isDirty ? "bg-amber-400" : "bg-emerald-400"
            }`}
          />
          <span className="min-w-0 break-words">
            {saveError
              ? `Not saved. ${saveError}`
              : isSaving
              ? "Saving"
              : isDirty
              ? "Unsaved changes"
              : `All changes saved${lastSavedAt ? ` at ${lastSavedAt}` : ""}`}
          </span>
        </p>

        {/* Row 2: story switcher and secondary actions. Save and Publish join from lg. */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="min-w-0 lg:flex-1">
            <p className="text-[0.7rem] font-medium text-zinc-400">{category}</p>
            <p className="truncate text-sm font-medium text-white">{title.trim() || "New story"}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Btn onClick={() => setPickerOpen(true)}>Open story</Btn>
            <Btn onClick={onCopyAI} className="px-3">
              <SparkIcon />
              {copiedAI ? "Copied" : "Copy for AI"}
            </Btn>
            {isExisting ? (
              <Btn href={`/article/${savedSlug}`} target="_blank" arrow="forward">
                View live
              </Btn>
            ) : (
              <Btn disabled>View live</Btn>
            )}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <Btn variant="primary" disabled={saveDisabled} onClick={onSaveDraft}>
              {saveLabel}
            </Btn>
            <Btn disabled={isSubmitting || uploading} onClick={onPublishClick}>
              {publishLabel}
            </Btn>
          </div>
        </div>
      </div>

      <EditorPickerSheet
        open={pickerOpen}
        title="Open a story"
        notice={isDirty ? "You have unsaved changes. Opening another story replaces them." : undefined}
        onClose={() => setPickerOpen(false)}
        footer={
          <Btn
            variant="primary"
            block
            onClick={() => {
              setPickerOpen(false);
              onNewStory();
            }}
          >
            New story
          </Btn>
        }
      >
        <StoryPicker
          status="all"
          excludeSlug={savedSlug || undefined}
          onPick={(story) => {
            setPickerOpen(false);
            onOpenStory(story.slug);
          }}
        />
      </EditorPickerSheet>

      {/* Phones and tablets: Save and Publish stay pinned to the bottom of the screen */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0E0F12]/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:px-6 lg:hidden">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3">
          <Btn variant="primary" disabled={saveDisabled} onClick={onSaveDraft} className="!h-12">
            {saveLabel}
          </Btn>
          <Btn disabled={isSubmitting || uploading} onClick={onPublishClick} className="!h-12">
            {publishLabel}
          </Btn>
        </div>
      </div>
    </>
  );
}
