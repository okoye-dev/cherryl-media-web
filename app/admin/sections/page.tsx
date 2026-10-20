"use client";

import Link from "next/link";
import { DEFAULT_SECTION_KEYS } from "@/lib/sections";
import { useCuratedSections } from "@/hooks/useCuratedSections";
import { SectionPanel } from "@/components/admin/sections/SectionPanel";
import { ArticlePickerModal } from "@/components/admin/sections/ArticlePickerModal";

export default function AdminSectionsPage() {
  const {
    sections,
    catalog,
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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
          <span className="font-mono text-xs uppercase tracking-wider">Loading curated sections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Actions */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-red animate-pulse" />
            <h1 className="font-sans text-xl font-bold tracking-tight text-white sm:text-2xl">
              Curated Homepage Sections
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Control which database articles populate each section of the cherrylmedia website.
            Changes persist directly to the PostgreSQL database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
          >
            Preview Site ↗
          </Link>
          <button
            type="button"
            onClick={saveAll}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand-red/20 transition-all hover:bg-brand-red/90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving to Database...
              </>
            ) : (
              "Save Curated Layout"
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-400 flex items-center justify-between">
          <span>✓ {saveSuccess}</span>
          <button onClick={() => setSaveSuccess(null)} className="text-emerald-400/60 hover:text-emerald-400">✕</button>
        </div>
      )}
      {saveError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-400 flex items-center justify-between">
          <span>⚠ {saveError}</span>
          <button onClick={() => setSaveError(null)} className="text-red-400/60 hover:text-red-400">✕</button>
        </div>
      )}

      {/* Sections Grid */}
      <div className="space-y-6">
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
          catalog={catalog}
          onSelect={selectArticleForSlot}
          onClose={closePicker}
        />
      )}
    </div>
  );
}
