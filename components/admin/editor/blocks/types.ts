import type { ContentBlock } from "@/lib/types";

export interface BlockFieldsProps<T extends ContentBlock["type"]> {
  block: Extract<ContentBlock, { type: T }>;
  onUpdate: (updated: ContentBlock) => void;
}
