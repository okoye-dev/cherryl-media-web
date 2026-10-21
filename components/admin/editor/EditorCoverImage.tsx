import ImageUploadField from "@/components/admin/ImageUploadField";
import { Label, Panel, TextInput } from "@/components/admin/ui";
import { LIMITS } from "./limits";

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
    <div id="cover-section" className="scroll-mt-24">
    <Panel
      title="Cover image"
      description="Needed to publish. Used on cards, the hero and social previews."
      className={hasError ? "!border-red-500/70" : undefined}
    >
      <div className="space-y-4">
        <ImageUploadField
          label="Cover photo"
          value={coverUrl}
          onChange={onCoverUrlChange}
          onUploadStateChange={onUploadStateChange}
          required={true}
          hasError={hasError}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="cover-caption">Caption</Label>
            <TextInput
              id="cover-caption"
              maxLength={LIMITS.coverCaption}
              value={coverCaption}
              onChange={(e) => onCoverCaptionChange(e.target.value)}
              placeholder="What the photo shows"
            />
          </div>
          <div>
            <Label htmlFor="cover-credit">Photo credit</Label>
            <TextInput
              id="cover-credit"
              maxLength={LIMITS.coverCredit}
              value={coverCredit}
              onChange={(e) => onCoverCreditChange(e.target.value)}
              placeholder="e.g. Cherryl Media"
            />
          </div>
        </div>
      </div>
    </Panel>
    </div>
  );
}
