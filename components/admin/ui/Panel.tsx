import { cn } from "@/lib/cn";

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  tone = "default",
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  tone?: "default" | "ai";
}) {
  return (
    <section
      className={cn(
        "rounded-xl border p-3.5 sm:p-5",
        tone === "ai" ? "border-violet-400/25 bg-violet-500/[0.06]" : "border-white/[0.08] bg-[#16181D]",
        className,
      )}
    >
      {(title || actions) && (
        <header className="mb-3 flex flex-col gap-2.5 sm:mb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>}
            {description && <p className="mt-1 text-xs leading-relaxed text-zinc-400">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageTitle({
  eyebrow,
  title,
  actions,
}: {
  eyebrow?: string;
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-[0.7rem] font-medium text-brand-red">{eyebrow}</p>}
        <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-white sm:text-2xl">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
