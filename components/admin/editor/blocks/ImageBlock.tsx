import { TextInput } from "@/components/admin/ui";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { LIMITS } from "../limits";
import type { BlockFieldsProps } from "./types";

export default function ImageBlock({ block, onUpdate, onUploadStateChange }: BlockFieldsProps<"image"> & { onUploadStateChange: (isUploading: boolean) => void }) {
  return (
    <div className="space-y-3">
      <ImageUploadField
        label="Inline Photo"
        value={block.src || ""}
        onChange={(url) => onUpdate({ ...block, src: url })}
        onUploadStateChange={onUploadStateChange}
        description="Supporting photograph placed between paragraphs."
      />
      <div className="grid gap-3 md:grid-cols-2">
        <TextInput
          value={block.caption || ""}
          onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
          maxLength={LIMITS.imageCaption}
          placeholder="Photo caption..."
        />
        <TextInput
          value={block.credit || ""}
          onChange={(e) => onUpdate({ ...block, credit: e.target.value })}
          placeholder="Photo credit..."
        />
      </div>
    </div>
  );
}
