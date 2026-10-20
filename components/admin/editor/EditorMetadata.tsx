import AutoTextarea from "@/components/admin/AutoTextarea";
import type { PillarCategory } from "@/lib/types";

const CATEGORIES: { slug: PillarCategory; label: string }[] = [
  { slug: "state-affairs-environs", label: "STATE AFFAIRS & ENVIRONS" },
  { slug: "newsbeat", label: "NEWSBEAT" },
  { slug: "brands-smes", label: "BRANDS & SMEs" },
  { slug: "opinions", label: "OPINIONS" },
  { slug: "sports", label: "SPORTS" },
  { slug: "entertainment-lifestyle", label: "ENTERTAINMENT & LIFESTYLE" },
  { slug: "education", label: "EDUCATION" },
  { slug: "thrills-tricks", label: "THRILLS & TRICKS" },
  { slug: "youth-corner", label: "YOUTH CORNER" },
  { slug: "tour-hotels", label: "TOUR & HOTELS" },
];

interface EditorMetadataProps {
  title: string;
  onTitleChange: (val: string) => void;
  subtitle: string;
  onSubtitleChange: (val: string) => void;
  excerpt: string;
  onExcerptChange: (val: string) => void;
  category: PillarCategory;
  onCategoryChange: (val: PillarCategory) => void;
  kicker: string;
  onKickerChange: (val: string) => void;
  slug: string;
  onSlugChange: (val: string) => void;
  onSyncSlugFromTitle: () => void;
  slugStatus: "idle" | "checking" | "available" | "unavailable";
  slugMessage: string;
  authorName: string;
  onAuthorNameChange: (val: string) => void;
  authorRole: string;
  onAuthorRoleChange: (val: string) => void;
  sendWebpushr: boolean;
  onSendWebpushrChange: (val: boolean) => void;
}

export default function EditorMetadata({
  title,
  onTitleChange,
  subtitle,
  onSubtitleChange,
  excerpt,
  onExcerptChange,
  category,
  onCategoryChange,
  kicker,
  onKickerChange,
  slug,
  onSlugChange,
  onSyncSlugFromTitle,
  slugStatus,
  slugMessage,
  authorName,
  onAuthorNameChange,
  authorRole,
  onAuthorRoleChange,
  sendWebpushr,
  onSendWebpushrChange,
}: EditorMetadataProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-7 space-y-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <span className="text-[0.68rem] font-mono uppercase tracking-wider text-brand-red font-semibold">
          POST METADATA &amp; CATEGORY
        </span>
        <span className="text-[0.7rem] text-zinc-500 font-mono">
          Order flow: Title → Subtitle → Excerpt → Category → Slug
        </span>
      </div>

      {/* Post Title */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300">
            Post Title <span className="text-brand-red">*</span>
          </label>
          <span className="text-[0.68rem] text-zinc-500 font-mono">{title.length} characters</span>
        </div>
        <AutoTextarea
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter post headline..."
          className="font-sans text-xl md:text-2xl font-semibold text-white placeholder-zinc-500 bg-[#1A1D24] rounded-xl border border-white/10 p-4 leading-snug tracking-tight focus:border-brand-red focus:outline-none"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
          Subtitle
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => onSubtitleChange(e.target.value)}
          placeholder="Story secondary headline or expansion..."
          className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-4 py-2.5 text-sm font-medium text-white focus:border-brand-red focus:outline-none transition-colors"
        />
      </div>

      {/* Excerpt */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300">
            Excerpt (Card Summary){" "}
            <span className="text-zinc-500 text-[0.68rem] font-normal lowercase">
              (shows on homepage cards &amp; category feeds)
            </span>
          </label>
          <span className="text-[0.68rem] text-zinc-500 font-mono">{excerpt.length} characters</span>
        </div>
        <AutoTextarea
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          placeholder="Concise 1-2 sentence excerpt that appears on article preview cards..."
          className="text-sm font-normal text-zinc-200 placeholder-zinc-500 bg-[#1A1D24] rounded-xl border border-white/10 p-4 leading-relaxed focus:border-brand-red focus:outline-none"
        />
      </div>

      {/* Category Picker & Kicker */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
            Category Pillar <span className="text-brand-red">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as PillarCategory)}
            className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 py-2.5 text-xs font-semibold text-white focus:border-brand-red focus:outline-none transition-colors"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
            Section Kicker / Super-header
          </label>
          <input
            type="text"
            value={kicker}
            onChange={(e) => onKickerChange(e.target.value)}
            placeholder="e.g. SPECIAL REPORT · ABUJA DESK"
            className="h-11 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 py-2.5 text-xs font-medium text-white focus:border-brand-red focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Slug for Post with Live Availability Check */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-300">
            Article Slug <span className="text-brand-red">*</span>
          </label>
          <div className="flex items-center gap-1.5 text-[0.7rem] font-mono">
            {slugStatus === "checking" && (
              <span className="flex items-center gap-1 text-amber-400">
                <span className="h-2 w-2 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                Checking availability...
              </span>
            )}
            {slugStatus === "available" && (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span>✓</span> {slugMessage}
              </span>
            )}
            {slugStatus === "unavailable" && (
              <span className="flex items-center gap-1 text-red-400 font-semibold">
                <span>✕</span> {slugMessage}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-mono text-zinc-500 bg-[#141519] border border-white/10 px-3 py-2.5 rounded-xl">
            /article/
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="post-slug-url"
            className={`h-11 flex-1 rounded-xl border bg-[#1A1D24] px-3.5 py-2.5 text-xs font-mono text-zinc-200 focus:outline-none transition-colors ${
              slugStatus === "available"
                ? "border-emerald-500/50 focus:border-emerald-500"
                : slugStatus === "unavailable"
                ? "border-red-500/50 focus:border-red-500"
                : "border-white/10 focus:border-brand-red"
            }`}
          />
          <button
            type="button"
            onClick={onSyncSlugFromTitle}
            className="rounded-xl border border-white/10 bg-zinc-800 hover:bg-zinc-700 px-3 py-2.5 text-xs text-zinc-300 transition-colors shrink-0"
            title="Regenerate slug from current title"
          >
            Sync from Title
          </button>
        </div>
      </div>

      {/* Author info & Webpushr notification checkbox */}
      <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t border-white/[0.06]">
        <div>
          <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Author Name
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => onAuthorNameChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[0.72rem] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
            Author Role
          </label>
          <input
            type="text"
            value={authorRole}
            onChange={(e) => onAuthorRoleChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/10 bg-[#1A1D24] px-3 py-2 text-xs text-white focus:border-brand-red focus:outline-none"
          />
        </div>

        {/* Webpushr Checkbox Option */}
        <div className="flex flex-col justify-end">
          <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#1A1D24] px-3.5 py-2.5 cursor-pointer hover:border-white/20 transition-colors">
            <input
              type="checkbox"
              checked={sendWebpushr}
              onChange={(e) => onSendWebpushrChange(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-brand-red focus:ring-0 h-4 w-4"
            />
            <div className="min-w-0">
              <span className="block text-xs font-semibold text-zinc-200">Send Webpushr</span>
              <span className="block text-[0.65rem] text-zinc-400 truncate">
                Broadcast push notification
              </span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
