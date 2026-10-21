import { cn } from "@/lib/cn";

/** A custom on/off switch. Replaces a checkbox that turns something on or off. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("flex min-h-11 w-full items-start justify-between gap-4 rounded-lg py-2 text-left disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10", className)}
    >
      <span className="min-w-0">
        <span className="block text-sm text-zinc-100">{label}</span>
        {description && <span className="mt-0.5 block text-xs leading-relaxed text-zinc-400">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={cn("relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors", checked ? "border-brand-red bg-brand-red" : "border-white/20 bg-white/10")}
      >
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[1.375rem]" : "left-0.5")} />
      </span>
    </button>
  );
}
