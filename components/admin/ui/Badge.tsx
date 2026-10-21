import { cn } from "@/lib/cn";

const BADGE_TONE = {
  neutral: "border-white/10 bg-white/[0.04] text-zinc-300",
  green: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  amber: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  red: "border-brand-red/30 bg-brand-red/10 text-red-300",
  ai: "border-violet-400/30 bg-violet-500/10 text-violet-200",
};

export function Badge({ tone = "neutral", children, className }: { tone?: keyof typeof BADGE_TONE; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[0.66rem] font-medium leading-none", BADGE_TONE[tone], className)}>
      {children}
    </span>
  );
}

/** Marks a field or block as filled in by AI and not yet reviewed by a person. */
export function AIChip({ className }: { className?: string }) {
  return (
    <Badge tone="ai" className={className}>
      <span className="h-1 w-1 rounded-full bg-violet-300" />
      AI filled, review
    </Badge>
  );
}
