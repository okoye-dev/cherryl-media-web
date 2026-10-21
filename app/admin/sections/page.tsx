"use client";

import { useEffect } from "react";
import { Btn, PageTitle } from "@/components/admin/ui";
import { DEFAULT_SECTION_KEYS } from "@/config/sections";
import { useCuratedSections } from "@/hooks/useCuratedSections";
import { SectionPanel } from "@/components/admin/sections/SectionPanel";
import { ArticlePickerModal } from "@/components/admin/sections/ArticlePickerModal";

export default function AdminSectionsPage() {
  const {
    dirty,
    sections,
    articleMap,
    loading,
    saving,
    saveSuccess,
    saveError,
    activePicker,
    openPicker,
    closePicker,
    selectArticleForSlot,
    removeArticleFromSlot,
    moveSlot,
    saveAll,
    setSaveSuccess,
    setSaveError,
  } = useCuratedSections();

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
          <span className="text-sm">Loading sections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-28">
      <PageTitle
        eyebrow="Homepage"
        title="Curated sections"
        actions={
          <>
            <Btn href="/" target="_blank" arrow="forward" block>
              Preview site
            </Btn>
          </>
        }
      />
      <p className="-mt-2 text-sm text-zinc-400">Choose which stories fill each slot on the homepage.</p>

      {saveSuccess && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400">
          <span>{saveSuccess}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setSaveSuccess(null)} className="h-10 shrink-0 px-3 text-xs text-emerald-300 hover:text-white">
            Dismiss
          </button>
        </div>
      )}
      {saveError && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          <span>{saveError}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setSaveError(null)} className="h-10 shrink-0 px-3 text-xs text-red-300 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Sections Grid */}
      <div className="space-y-4">
        {DEFAULT_SECTION_KEYS.map((key) => (
          <SectionPanel
            key={key}
            sectionKey={key}
            section={sections[key]}
            articleMap={articleMap}
            onOpenPicker={openPicker}
            onRemoveSlot={removeArticleFromSlot}
            onMoveSlot={moveSlot}
          />
        ))}
      </div>

      {/* Interactive Article Picker Modal */}
      {activePicker && (
        <ArticlePickerModal
          picker={activePicker}
          onSelect={selectArticleForSlot}
          onClose={closePicker}
        />
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0E0F12]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[96rem] items-center gap-3 px-4 py-3 sm:px-6 md:px-10">
          <p className="hidden min-w-0 flex-1 truncate text-xs text-zinc-400 sm:block">
            {dirty ? <span className="text-amber-300">Unsaved changes</span> : "All changes saved"}
          </p>
          <Btn variant="primary" onClick={saveAll} disabled={saving || !dirty} className="flex-1 sm:min-w-36 sm:flex-none">
            {saving ? "Saving..." : dirty ? "Save layout" : "Saved"}
          </Btn>
        </div>
        {dirty && <p className="px-4 pb-2 text-center text-xs text-amber-300 sm:hidden">Unsaved changes</p>}
      </div>
    </div>
  );
}
