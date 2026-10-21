import { TextInput } from "@/components/admin/ui";
import { LIMITS } from "../limits";
import type { BlockFieldsProps } from "./types";

export default function QuoteBlock({ block, onUpdate }: BlockFieldsProps<"quote">) {
  return (
    <div className="space-y-3">
      <TextInput
        multiline
        value={block.quote || ""}
        maxLength={LIMITS.quote}
        onChange={(e) => onUpdate({ ...block, quote: e.target.value })}
        placeholder="Enter the quote"
        className="border-l-2 !border-l-brand-red text-lg italic"
      />
      <div className="grid gap-3 md:grid-cols-2">
        <TextInput
          value={block.author || ""}
          onChange={(e) => onUpdate({ ...block, author: e.target.value })}
          placeholder="Speaker name"
        />
        <TextInput
          value={block.context || ""}
          onChange={(e) => onUpdate({ ...block, context: e.target.value })}
          placeholder="Official title or institution"
        />
      </div>
    </div>
  );
}
