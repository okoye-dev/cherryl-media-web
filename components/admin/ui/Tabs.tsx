import { cn } from "@/lib/cn";

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  items: Array<{ id: T; label: string; count?: number; dot?: boolean }>;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("-mx-4 flex gap-1 overflow-x-auto px-4 pb-px [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden", className)}>
      {items.map((it) => (
        <button
          key={it.id}
          role="tab"
          aria-selected={value === it.id}
          type="button"
          onClick={() => onChange(it.id)}
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 text-[0.8rem] font-medium transition-colors",
            value === it.id ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:bg-white/[0.05] hover:text-white",
          )}
        >
          {it.label}
          {typeof it.count === "number" && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/10 px-1.5 text-[0.65rem] font-medium leading-none tabular-nums text-zinc-300">{it.count}</span>
          )}
          {it.dot && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        </button>
      ))}
    </div>
  );
}
