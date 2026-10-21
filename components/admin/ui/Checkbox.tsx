import { cn } from "@/lib/cn";

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  id,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  description?: React.ReactNode;
  id?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-start gap-3 rounded-lg py-2 sm:min-h-10", disabled && "cursor-not-allowed opacity-50", className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/25 bg-[#141519] text-white transition-colors peer-checked:border-brand-red peer-checked:bg-brand-red peer-focus-visible:ring-2 peer-focus-visible:ring-brand-red/50 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
      >
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 6.5l2.5 2.5 4.5-5.5" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-zinc-100">{label}</span>
        {description && <span className="mt-0.5 block text-xs leading-relaxed text-zinc-400">{description}</span>}
      </span>
    </label>
  );
}
