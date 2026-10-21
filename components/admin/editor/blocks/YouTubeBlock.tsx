import { Label, TextInput } from "@/components/admin/ui";
import { getYouTubeEmbedUrl } from "@/lib/url-utils";
import { LIMITS } from "../limits";
import type { BlockFieldsProps } from "./types";

export default function YouTubeBlock({ block, onUpdate }: BlockFieldsProps<"youtube">) {
  return (
    <div className="space-y-3">
      <div>
        <Label>YouTube link or ID</Label>
        <TextInput
          value={block.url || ""}
          onChange={(e) => onUpdate({ ...block, url: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
          className="font-mono"
        />
      </div>

      {block.url && getYouTubeEmbedUrl(block.url) && (
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10 shadow-sm">
          <iframe
            src={getYouTubeEmbedUrl(block.url)!}
            title="YouTube Preview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      )}

      <TextInput
        value={block.caption || ""}
        onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
        maxLength={LIMITS.imageCaption}
          placeholder="Video caption / summary..."
      />
    </div>
  );
}
