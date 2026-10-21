import { Switch, TextInput } from "@/components/admin/ui";
import type { BlockFieldsProps } from "./types";

export default function ParagraphBlock({ block, onUpdate }: BlockFieldsProps<"paragraph">) {
  return (
    <div className="space-y-2">
      <TextInput
        multiline
        value={block.text || ""}
        onChange={(e) => onUpdate({ ...block, text: e.target.value })}
        placeholder="Write paragraph text"
        className="leading-relaxed"
        data-block-field
      />
      <Switch
        checked={Boolean(block.isDropCap)}
        onChange={(on) => onUpdate({ ...block, isDropCap: on })}
        label="Large drop cap"
        description="Makes the first letter big"
      />
    </div>
  );
}
