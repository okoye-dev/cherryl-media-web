import { TextInput } from "@/components/admin/ui";
import type { BlockFieldsProps } from "./types";

export default function ExternalLinkBlock({ block, onUpdate }: BlockFieldsProps<"external_link">) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <TextInput
          value={block.title || ""}
          onChange={(e) => onUpdate({ ...block, title: e.target.value })}
          placeholder="Source title or report headline..."
        />
        <TextInput
          value={block.publisher || ""}
          onChange={(e) => onUpdate({ ...block, publisher: e.target.value })}
          placeholder="Publisher / Official Gazette..."
        />
      </div>
      <TextInput
        value={block.url || ""}
        onChange={(e) => onUpdate({ ...block, url: e.target.value })}
        placeholder="https://..."
        className="font-mono"
      />
    </div>
  );
}
