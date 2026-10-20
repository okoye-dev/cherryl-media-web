import ImageUploadField from "@/components/admin/ImageUploadField";

interface EditorCoverImageProps {
  coverUrl: string;
  onCoverUrlChange: (url: string) => void;
  coverCaption: string;
  onCoverCaptionChange: (caption: string) => void;
  coverCredit: string;
  onCoverCreditChange: (credit: string) => void;
  onUploadStateChange: (isUploading: boolean) => void;
  hasError: boolean;
}

export default function EditorCoverImage({
  coverUrl,
  onCoverUrlChange,
  coverCaption,
  onCoverCaptionChange,
  coverCredit,
  onCoverCreditChange,
  onUploadStateChange,
  hasError,
}: EditorCoverImageProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#16181D] p-5 sm:p-7 space-y-4 shadow-sm">
      <span className="text-[0.68rem] font-mono uppercase tracking-wider text-brand-red font-semibold block">
        COVER PHOTOGRAPH (FEATURED IMAGE)
      </span>
      <div
        className={`rounded-xl border p-4 space-y-3 transition-colors ${
          hasError ? "border-red-500/80 bg-red-950/20" : "border-white/10 bg-[#1A1D24]/60"
        }`}
      >
        <ImageUploadField
          label="Story Cover Photo"
          value={coverUrl}
          onChange={onCoverUrlChange}
          onUploadStateChange={onUploadStateChange}
          description="Required to publish. Displayed on homepage cards, hero banner, category archives, and social sharing cards."
          required={true}
          hasError={hasError}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Cover Photo Caption
            </label>
            <input
              type="text"
              value={coverCaption}
              onChange={(e) => onCoverCaptionChange(e.target.value)}
              placeholder="e.g. Presidential council in session, State House, Abuja."
              className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 py-1.5 text-xs text-white focus:border-brand-red focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Photo Credit
            </label>
            <input
              type="text"
              value={coverCredit}
              onChange={(e) => onCoverCreditChange(e.target.value)}
              placeholder="e.g. State House / Cherryl Media"
              className="h-10 w-full rounded-lg border border-white/10 bg-[#141519] px-3 py-1.5 text-xs text-white focus:border-brand-red focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
