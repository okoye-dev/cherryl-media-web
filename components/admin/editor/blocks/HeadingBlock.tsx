import { TextInput } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { LIMITS } from "../limits";
import type { BlockFieldsProps } from "./types";

export default function HeadingBlock({ block, onUpdate }: BlockFieldsProps<"heading">) {
  return (
    <div className="space-y-2">
      <TextInput
        value={block.text || ""}
        maxLength={LIMITS.heading}
        onChange={(e) => onUpdate({ ...block, text: e.target.value })}
        placeholder="Enter section subheading"
        className="text-lg font-semibold tracking-tight"
      />
      <div className="flex items-center gap-2 text-sm text-zinc-400" role="group" aria-label="Heading level">
        <span className="mr-1">Level</span>
        {([2, 3] as const).map((lv) => (
          <button
            key={lv}
            type="button"
            aria-pressed={(block.level === 3 ? 3 : 2) === lv}
            onClick={() => onUpdate({ ...block, level: lv })}
            className={cn(
              "h-10 rounded-lg border px-3.5 text-xs font-medium transition-colors",
              (block.level === 3 ? 3 : 2) === lv
                ? "border-brand-red bg-brand-red/15 text-white"
                : "border-white/10 text-zinc-400 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            {lv === 2 ? "H2 main" : "H3 sub"}
          </button>
        ))}
      </div>
    </div>
  );
}
