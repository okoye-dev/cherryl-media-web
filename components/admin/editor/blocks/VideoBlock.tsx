import { Label, TextInput } from "@/components/admin/ui";
import { uploadMediaFile } from "@/services/media";
import { LIMITS } from "../limits";
import type { BlockFieldsProps } from "./types";

export default function VideoBlock({ block, onUpdate }: BlockFieldsProps<"video">) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Video URL</Label>
        <TextInput
          value={block.src || ""}
          onChange={(e) => onUpdate({ ...block, src: e.target.value })}
          placeholder="https://... or /uploads/video.mp4"
          className="font-mono"
        />
      </div>

      <div>
        <label className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/[0.09] hover:text-white sm:h-10 sm:w-auto sm:text-[0.8rem]">
          <svg className="w-3.5 h-3.5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span>Upload video (max 100MB)</span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const url = await uploadMediaFile(file);
                if (url) onUpdate({ ...block, src: url });
              } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Video upload failed";
                alert(msg);
              }
            }}
          />
        </label>
      </div>

      {block.src && (
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
          <video src={block.src} controls className="h-full w-full object-cover" />
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <TextInput
          value={block.caption || ""}
          onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
          maxLength={LIMITS.imageCaption}
          placeholder="Video caption..."
        />
        <TextInput
          value={block.credit || ""}
          onChange={(e) => onUpdate({ ...block, credit: e.target.value })}
          placeholder="Video credit..."
        />
      </div>
    </div>
  );
}
