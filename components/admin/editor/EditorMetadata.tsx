import { AIChip, Btn, Label, Panel, Switch, TextInput, inputClass } from "@/components/admin/ui";
import { LIMITS, normalizeSlug } from "./limits";
import { cn } from "@/utils";
import type { PillarCategory } from "@/lib/types";

const CATEGORIES: { slug: PillarCategory; label: string }[] = [
  { slug: "state-affairs-environs", label: "State Affairs & Environs" },
  { slug: "newsbeat", label: "Newsbeat" },
  { slug: "brands-smes", label: "Brands & SMEs" },
  { slug: "opinions", label: "Opinions" },
  { slug: "sports", label: "Sports" },
  { slug: "entertainment-lifestyle", label: "Entertainment & Lifestyle" },
  { slug: "education", label: "Education" },
  { slug: "thrills-tricks", label: "Thrills & Tricks" },
  { slug: "youth-corner", label: "Youth Corner" },
  { slug: "tour-hotels", label: "Tour & Hotels" },
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
  /** Rendered at the end of the Details panel (the tags field) */
  children?: React.ReactNode;
  /** True when a field (by key) was filled by AI and not yet edited */
  isAi?: (key: string) => boolean;
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
  children,
  isAi = () => false,
}: EditorMetadataProps) {
  return (
    <>
      <Panel title="Headline and summary">
        <div className="space-y-4">
          <div className="scroll-mt-24">
            <Label htmlFor="story-title">
              Title (required) {isAi("title") && <AIChip className="ml-1" />}
            </Label>
            <TextInput
              id="story-title"
              value={title}
              maxLength={LIMITS.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter the headline"
              className="text-lg font-semibold sm:text-xl"
            />
          </div>

          <div>
            <Label htmlFor="story-subtitle">Subtitle {isAi("subtitle") && <AIChip className="ml-1" />}</Label>
            <TextInput
              id="story-subtitle"
              value={subtitle}
              maxLength={LIMITS.subtitle}
              onChange={(e) => onSubtitleChange(e.target.value)}
              placeholder="A second line that expands the headline"
            />
          </div>

          <div>
            <Label htmlFor="story-excerpt">
              Excerpt, shown on cards and feeds {isAi("excerpt") && <AIChip className="ml-1" />}
            </Label>
            <TextInput
              id="story-excerpt"
              multiline
              value={excerpt}
              maxLength={LIMITS.excerpt}
              onChange={(e) => onExcerptChange(e.target.value)}
              placeholder="One or two sentences for the preview card"
            />
          </div>
        </div>
      </Panel>

      <Panel title="Details">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="story-category">Category (required) {isAi("category") && <AIChip className="ml-1" />}</Label>
            <select
              id="story-category"
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as PillarCategory)}
              className={inputClass}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="story-kicker">Kicker {isAi("kicker") && <AIChip className="ml-1" />}</Label>
            <TextInput
              id="story-kicker"
              value={kicker}
              maxLength={LIMITS.kicker}
              onChange={(e) => onKickerChange(e.target.value)}
              placeholder="e.g. Special report"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="story-slug">Slug (required)</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <div className="flex min-w-0 flex-1 items-start gap-2">
                <span className="hidden h-10 shrink-0 items-center rounded-lg border border-white/10 bg-[#141519] px-3 font-mono text-xs text-zinc-500 sm:inline-flex">
                  /article/
                </span>
                <div className="min-w-0 flex-1">
                  <TextInput
                    id="story-slug"
                    value={slug}
                    maxLength={LIMITS.slug}
                    onChange={(e) => onSlugChange(normalizeSlug(e.target.value))}
                    placeholder="story-slug"
                    className={cn(
                      "font-mono",
                      slugStatus === "available" && "border-emerald-500/50 focus:border-emerald-500",
                      slugStatus === "unavailable" && "border-red-500/50 focus:border-red-500",
                    )}
                  />
                </div>
              </div>
              <Btn onClick={onSyncSlugFromTitle} title="Make the slug from the current title">
                Use title
              </Btn>
            </div>
            <div className="mt-1.5 min-h-4 text-xs">
              {slugStatus === "checking" && <span className="text-amber-400">Checking availability</span>}
              {slugStatus === "available" && <span className="text-emerald-400">{slugMessage}</span>}
              {slugStatus === "unavailable" && <span className="text-red-400">{slugMessage}</span>}
            </div>
          </div>

          <div>
            <Label htmlFor="story-author">Author name</Label>
            <TextInput
              id="story-author"
              value={authorName}
              maxLength={LIMITS.authorName}
              onChange={(e) => onAuthorNameChange(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="story-author-role">Author role</Label>
            <TextInput
              id="story-author-role"
              value={authorRole}
              maxLength={LIMITS.authorRole}
              onChange={(e) => onAuthorRoleChange(e.target.value)}
            />
          </div>

          <div className="rounded-lg border border-white/10 bg-[#141519] px-3 md:col-span-2">
            <Switch
              checked={sendWebpushr}
              onChange={onSendWebpushrChange}
              label="Send push notification"
              description="Alerts subscribers when this is published"
            />
          </div>

          {children && <div className="md:col-span-2">{children}</div>}
        </div>
      </Panel>
    </>
  );
}
