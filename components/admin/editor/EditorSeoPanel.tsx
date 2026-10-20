import AutoTextarea from "@/components/admin/AutoTextarea";

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
}: EditorSeoPanelProps) {
  const displayTitle = seoTitle || defaultTitle || "Untitled Article | Cherryl Media";
  const displaySlug = seoSlug || defaultSlug || "article-slug";
  const displayDesc =
    seoDescription || defaultDescription || "No description provided for search engines yet.";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-7 space-y-6 shadow-sm">
        <div>
          <span className="text-[0.68rem] font-mono uppercase tracking-wider text-brand-red font-semibold block">
            SEARCH ENGINE OPTIMIZATION (SEO)
          </span>
          <h2 className="font-sans text-xl font-semibold text-white tracking-tight mt-1">
            Google Search Appearance &amp; Meta Tags
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Optimize headline, custom slug, and meta description for search engine ranking.
          </p>
        </div>

        {/* SEO Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300">
              SEO Title (Meta Title)
            </label>
            <span
              className={`text-[0.68rem] font-mono ${
                displayTitle.length > 60 ? "text-amber-400" : "text-zinc-500"
              }`}
            >
              {displayTitle.length} / 60 recommended
            </span>
          </div>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => onSeoTitleChange(e.target.value)}
            placeholder={defaultTitle || "Enter optimized title for Google search results..."}
            className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-4 py-2 text-sm text-white focus:border-brand-red focus:outline-none"
          />
        </div>

        {/* SEO Slug */}
        <div>
          <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
            SEO Canonical Slug
          </label>
          <input
            type="text"
            value={seoSlug}
            onChange={(e) => onSeoSlugChange(e.target.value)}
            placeholder={defaultSlug || "optimized-canonical-slug"}
            className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-4 py-2 text-xs font-mono text-zinc-200 focus:border-brand-red focus:outline-none"
          />
        </div>

        {/* Meta Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300">
              Meta Description (SERP Snippet)
            </label>
            <span
              className={`text-[0.68rem] font-mono ${
                displayDesc.length > 160 ? "text-amber-400" : "text-zinc-500"
              }`}
            >
              {displayDesc.length} / 160 recommended
            </span>
          </div>
          <AutoTextarea
            value={seoDescription}
            onChange={(e) => onSeoDescriptionChange(e.target.value)}
            placeholder={defaultDescription || "Enter concise meta description for Google snippets..."}
            className="text-sm font-normal text-zinc-200 placeholder-zinc-500 bg-[#1A1D24] rounded-xl border border-white/10 p-4 leading-relaxed focus:border-brand-red focus:outline-none"
          />
        </div>

        {/* Live Google Search Preview Card */}
        <div className="pt-4 border-t border-white/[0.08] space-y-2">
          <span className="text-[0.68rem] font-mono uppercase tracking-wider text-zinc-400 block">
            Google Search Result SERP Live Preview
          </span>
          <div className="rounded-xl border border-white/10 bg-[#0E1014] p-4 font-sans space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="h-4 w-4 rounded-full bg-brand-red/80 flex items-center justify-center text-[0.55rem] font-bold text-white">
                C
              </span>
              <span className="truncate text-zinc-300 text-[0.75rem]">
                cherrylmedia.com &gt; article &gt; {displaySlug}
              </span>
            </div>
            <h3 className="text-base text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug">
              {displayTitle}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{displayDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
