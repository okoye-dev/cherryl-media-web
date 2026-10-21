import { cn } from "@/lib/cn";

/** An honest empty state: a soft rounded block that says what will live here. */
export default function Placeholder({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-card bg-paper-deep text-center text-[0.9rem] text-ink-soft",
        className,
      )}
    >
      <span className="max-w-[28ch] px-6">{children}</span>
    </div>
  );
}
