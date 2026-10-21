"use client";

import { useRef, useState } from "react";
import { Btn, Label, TextInput, inputClass } from "@/components/admin/ui";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { saveArticle, publishArticle } from "@/services/articles";
import { SITE } from "@/config/site";
import { slugify } from "@/lib/leadToArticle";
import type { CanonicalArticle } from "@/lib/types";

/**
 * A short confirmation for publishing without opening the editor.
 * It asks for the two things the site needs (title, cover photo), shows what will go live,
 * and links to the editor for anyone who wants to change more first.
 */
export default function QuickPublishSheet({
  draft,
  editHref,
  from,
  onClose,
  onPublished,
}: {
  draft: Partial<CanonicalArticle>;
  editHref: string;
  /** "lead" for an AI lead, "draft" for a saved draft story. Only changes the warning wording. */
  from: "lead" | "draft";
  onClose: () => void;
  onPublished: (slug: string) => void;
}) {
  const [title, setTitle] = useState(draft.title || "");
  const [category, setCategory] = useState(String(draft.category || SITE.categories[0].slug));
  const [cover, setCover] = useState(draft.featuredImage?.url || "");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneSlug, setDoneSlug] = useState<string | null>(null);
  const [doneKind, setDoneKind] = useState<"published" | "draft">("published");
  const [needsCover, setNeedsCover] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);

  const paragraphs = (draft.body || []).filter((b) => b.type === "paragraph").length;
  const sources = draft.sources?.length || 0;

  const build = (status: "draft" | "published"): Partial<CanonicalArticle> => {
    const slug = draft.slug || slugify(title);
    const categoryName = SITE.categories.find((c) => c.slug === category)?.name ?? draft.categoryName;
    return {
      ...draft,
      title: title.trim(),
      slug,
      seo_slug: draft.seo_slug || slug,
      seo_title: draft.seo_title || title.trim(),
      category: category as CanonicalArticle["category"],
      categoryName,
      featuredImage: { url: cover, caption: draft.featuredImage?.caption || "", credit: draft.featuredImage?.credit || "Cherryl Media" },
      status,
      publishedAt: new Date().toISOString(),
    };
  };

  const saveDraft = async () => {
    if (!title.trim()) {
      setError("Add a headline first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload = build("draft");
      await saveArticle(payload);
      setDoneKind("draft");
      setDoneSlug(payload.slug as string);
      onPublished(payload.slug as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the draft.");
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    // Tell the person what to do, instead of failing and asking them to try again.
    if (!title.trim()) {
      setError("Add a headline before you publish.");
      return;
    }
    if (!cover.trim()) {
      setNeedsCover(true);
      setError(null);
      coverRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload = build("published");
      await saveArticle(payload);
      await publishArticle(payload.slug as string);
      setDoneKind("published");
      setDoneSlug(payload.slug as string);
      onPublished(payload.slug as string);
    } catch (err) {
      setError(err instanceof Error ? `The server did not publish it: ${err.message}. Your text is safe. Save it as a draft instead.` : "Could not publish. Save it as a draft instead.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Quick publish">
      <div className="flex max-h-full w-full flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#16181D] sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="text-base font-semibold text-white">{doneSlug ? (doneKind === "draft" ? "Draft saved" : "Published") : "Quick publish"}</h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              {doneSlug ? (doneKind === "draft" ? "Find it under Your stories, then edit or publish it." : "The story is live on the site.") : "Save it as a draft, or publish now."}
            </p>
          </div>
          <Btn variant="ghost" size="sm" onClick={onClose} className="-mr-2 !h-10">
            Close
          </Btn>
        </div>

        {doneSlug ? (
          <div className="space-y-3 px-4 py-5 sm:px-5">
            <p className="text-sm text-zinc-200">{doneKind === "draft" ? <>&ldquo;{title}&rdquo; is saved as a draft. Nothing is live yet.</> : <>&ldquo;{title}&rdquo; is published. The homepage picks it up within a minute.</>}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              {doneKind === "published" ? (
                <Btn href={`/article/${doneSlug}`} target="_blank" arrow="forward" variant="primary" block>
                  View story
                </Btn>
              ) : (
                <Btn href={`/admin/editor?slug=${encodeURIComponent(doneSlug)}`} arrow="forward" variant="primary" block>
                  Open in the editor
                </Btn>
              )}
              <Btn onClick={onClose} block>
                Done
              </Btn>
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
              <div>
                <Label htmlFor="qp-title">Headline</Label>
                <TextInput id="qp-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} />
              </div>
              <div>
                <Label htmlFor="qp-cat">Category</Label>
                <select id="qp-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  {SITE.categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div ref={coverRef} className={needsCover && !cover ? "rounded-lg ring-2 ring-amber-400/60 ring-offset-2 ring-offset-[#16181D]" : ""}>
                <Label hint="needed to publish, not for a draft">Cover photo</Label>
                <ImageUploadField
                  value={cover}
                  onChange={(u) => {
                    setCover(u);
                    if (u) setNeedsCover(false);
                  }}
                  label="Upload cover photo"
                  onUploadStateChange={setUploading}
                />
                {needsCover && !cover && <p className="mt-2 text-sm text-amber-300">Add a cover photo to publish. Or save it as a draft and add one later.</p>}
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-zinc-300">
                <p>
                  Goes live with {paragraphs} {paragraphs === 1 ? "paragraph" : "paragraphs"} and {sources} {sources === 1 ? "source" : "sources"}.
                </p>
                <p className="mt-1 text-amber-300">
                  {from === "lead"
                    ? "This publishes the AI draft as it is written. Nobody has edited it yet."
                    : "This publishes the draft as it was last saved."}
                </p>
                <Btn href={editHref} variant="ghost" size="sm" arrow="forward" className="-ml-2 mt-1 !h-10">
                  Open in the editor first
                </Btn>
              </div>
              {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            </div>
            <div className="flex flex-col gap-2 border-t border-white/10 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row-reverse sm:px-5">
              <Btn variant="primary" onClick={saveDraft} disabled={busy || uploading} block>
                {busy ? "Saving..." : "Save as draft"}
              </Btn>
              <Btn onClick={publish} disabled={busy || uploading} block>
                Publish now
              </Btn>
              <Btn variant="ghost" onClick={onClose} block>
                Cancel
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
