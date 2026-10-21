import { AIChip, Label, Panel, TextInput } from "@/components/admin/ui";
import { LIMITS, normalizeSlug } from "./limits";

interface EditorSeoPanelProps {
  seoTitle: string;
  onSeoTitleChange: (val: string) => void;
  defaultTitle: string;
  seoSlug: string;
  onSeoSlugChange: (val: string) => void;
  defaultSlug: string;
  seoDescription: string;
  onSeoDescriptionChange: (val: string) => void;
  defaultDescription: string;
  isAi?: (key: string) => boolean;
}

export default function EditorSeoPanel({
  seoTitle,
  onSeoTitleChange,
  defaultTitle,
  seoSlug,
  onSeoSlugChange,
  defaultSlug,
  seoDescription,
  onSeoDescriptionChange,
  defaultDescription,
  isAi = () => false,
}: EditorSeoPanelProps) {
  const displayTitle = seoTitle || defaultTitle || "Untitled Article | Cherryl Media";
  const displaySlug = seoSlug || defaultSlug || "article-slug";
  const displayDesc =
    seoDescription || defaultDescription || "No description provided for search engines yet.";

  return (
    <div className="space-y-4">
      <Panel title="Search appearance" description="How this story looks on Google. Empty fields use the story title, slug and excerpt.">
        <div className="space-y-4">
          <div>
            <Label htmlFor="seo-title">SEO title {isAi("seoTitle") && <AIChip className="ml-1" />}</Label>
            <TextInput
              id="seo-title"
              value={seoTitle}
              maxLength={LIMITS.seoTitle}
              onChange={(e) => onSeoTitleChange(e.target.value)}
              placeholder={defaultTitle || "Title for search results"}
              alwaysCount
            />
          </div>

          <div>
            <Label htmlFor="seo-slug">Canonical slug</Label>
            <TextInput
              id="seo-slug"
              value={seoSlug}
              maxLength={LIMITS.seoSlug}
              onChange={(e) => onSeoSlugChange(normalizeSlug(e.target.value))}
              placeholder={defaultSlug || "canonical-slug"}
              className="font-mono"
            />
          </div>

          <div>
            <Label htmlFor="seo-description">
              Meta description {isAi("seoDescription") && <AIChip className="ml-1" />}
            </Label>
            <TextInput
              id="seo-description"
              multiline
              value={seoDescription}
              maxLength={LIMITS.seoDescription}
              onChange={(e) => onSeoDescriptionChange(e.target.value)}
              placeholder={defaultDescription || "Short summary for search results"}
              alwaysCount
            />
          </div>
        </div>
      </Panel>

      <Panel title="Google preview">
        <div className="space-y-1.5 rounded-xl border border-white/10 bg-[#0E1014] p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-red/80 text-[0.6rem] font-bold text-white">
              C
            </span>
            <span className="truncate text-zinc-300">cherrylmedia.com &gt; article &gt; {displaySlug}</span>
          </div>
          <h3 className="line-clamp-2 text-base font-medium leading-snug text-[#8ab4f8]">{displayTitle}</h3>
          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">{displayDesc}</p>
        </div>
      </Panel>
    </div>
  );
}
