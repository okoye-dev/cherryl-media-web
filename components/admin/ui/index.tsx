import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/utils";
import Arrow from "@/components/site/Arrow";

/**
 * Shared building blocks for the whole admin section.
 * Rules every admin screen follows:
 *  - Buttons never wrap: one line, fixed height, and they stack or scroll instead of squeezing.
 *  - Arrows are arrowheads only (the Arrow component). No tailed arrows in text.
 *  - Small type: field labels are 0.7rem sentence case, panel titles 1rem. Body text 0.875rem.
 *  - Inputs are 16px on phones (stops iOS zooming in), 14px from sm up.
 *  - Layouts start as one column and add columns at sm / lg.
 */

export const inputClass =
  "h-11 w-full rounded-lg border border-white/10 bg-[#141519] px-3 text-base text-white placeholder:text-zinc-500 focus:border-brand-red focus:outline-none sm:h-10 sm:text-sm";

export const textareaClass =
  "w-full rounded-lg border border-white/10 bg-[#141519] px-3 py-2.5 text-base text-white placeholder:text-zinc-500 focus:border-brand-red focus:outline-none sm:text-sm";

const BTN_BASE =
  "inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const BTN_VARIANT = {
  primary: "bg-brand-red text-white hover:bg-brand-red/85",
  secondary: "border border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.09] hover:text-white",
  ghost: "text-zinc-300 hover:bg-white/[0.06] hover:text-white",
  danger: "border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20",
};

const BTN_SIZE = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm sm:h-10 sm:text-[0.8rem]",
};

type BtnProps = {
  variant?: keyof typeof BTN_VARIANT;
  size?: keyof typeof BTN_SIZE;
  /** Arrowhead after the label ("forward") or before it ("back") */
  arrow?: "forward" | "back";
  /** Make the button fill its row (use on phones for the main action) */
  block?: boolean;
  className?: string;
  children: React.ReactNode;
};

type BtnAsLink = BtnProps & { href: string; target?: string } & { onClick?: never; type?: never; disabled?: never };
type BtnAsButton = BtnProps & { href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function Btn(props: BtnAsLink | BtnAsButton) {
  const { variant = "secondary", size = "md", arrow, block, className, children } = props;
  const classes = cn(BTN_BASE, BTN_VARIANT[variant], BTN_SIZE[size], block && "w-full sm:w-auto", className);
  const inner = (
    <>
      {arrow === "back" && <Arrow className="h-[0.8em] w-[0.8em] rotate-180" />}
      {children}
      {arrow === "forward" && <Arrow className="h-[0.8em] w-[0.8em]" />}
    </>
  );
  if ("href" in props && props.href) {
    return (
      <Link href={props.href} target={props.target} className={classes}>
        {inner}
      </Link>
    );
  }
  const rest = { ...(props as BtnAsButton) } as Partial<BtnAsButton>;
  delete rest.variant;
  delete rest.size;
  delete rest.arrow;
  delete rest.block;
  delete rest.className;
  delete rest.children;
  delete rest.href;
  return (
    <button type="button" {...rest} className={classes}>
      {inner}
    </button>
  );
}

/** A titled card. Header text and actions stack on phones and sit side by side from sm. */
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
        "rounded-xl border p-4 sm:p-5",
        tone === "ai" ? "border-violet-400/25 bg-violet-500/[0.06]" : "border-white/[0.08] bg-[#16181D]",
        className,
      )}
    >
      {(title || actions) && (
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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

/** Page title block used at the top of each admin page. */
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

/** Small label above a field. Sentence case, quiet. */
export function Label({ children, htmlFor, hint }: { children: React.ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-2 text-[0.7rem] font-medium text-zinc-400">
      <span>{children}</span>
      {hint && <span className="font-normal text-zinc-500">{hint}</span>}
    </label>
  );
}

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

/** Tabs that scroll sideways on narrow screens instead of wrapping onto several lines. */
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
            <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[0.62rem] leading-none text-zinc-300">{it.count}</span>
          )}
          {it.dot && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        </button>
      ))}
    </div>
  );
}

/**
 * A text box that grows as the person writes, so nothing is ever hidden or cut off.
 * Drop-in for a text input: same props, `onChange` still gives the event (`e.target.value`).
 * With `maxLength` the person simply cannot type past the limit (nothing is trimmed afterwards),
 * and a small counter appears when the limit is close.
 * One line by default (Enter does not add a line); pass `multiline` for paragraphs.
 */
export const growClass =
  "block w-full resize-none overflow-hidden rounded-lg border border-white/10 bg-[#141519] px-3 py-2.5 text-base leading-snug text-white placeholder:text-zinc-500 focus:border-brand-red focus:outline-none sm:text-sm min-h-11 sm:min-h-10";

type TextInputProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "rows" | "onChange" | "value" | "defaultValue"
> & {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  multiline?: boolean;
  /** Show the counter even when far from the limit */
  alwaysCount?: boolean;
};

export function TextInput({ value, onChange, multiline = false, maxLength, alwaysCount, className, onKeyDown, onPaste, ...rest }: TextInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, []);

  // Fit on every value change, including changes made from outside (a restored draft, AI fill).
  useLayoutEffect(fit, [value, fit]);
  useEffect(() => {
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);

  const count = value.length;
  const showCount = typeof maxLength === "number" && (alwaysCount || count >= maxLength * 0.8);
  const atLimit = typeof maxLength === "number" && count >= maxLength;

  return (
    <div className="min-w-0">
      <textarea
        {...rest}
        ref={ref}
        rows={1}
        value={value}
        maxLength={maxLength}
        onChange={onChange}
        onKeyDown={(e) => {
          if (!multiline && e.key === "Enter") e.preventDefault();
          onKeyDown?.(e);
        }}
        onPaste={(e) => {
          onPaste?.(e);
          if (multiline || e.defaultPrevented) return;
          // A pasted line break would turn a one line field into several: swap it for a space.
          const text = e.clipboardData.getData("text");
          if (/[\r\n]/.test(text)) {
            e.preventDefault();
            const el = e.currentTarget;
            const room = typeof maxLength === "number" ? Math.max(0, maxLength - (value.length - (el.selectionEnd - el.selectionStart))) : Infinity;
            const clean = text.replace(/\s*[\r\n]+\s*/g, " ").slice(0, room);
            const next = value.slice(0, el.selectionStart) + clean + value.slice(el.selectionEnd);
            const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
            setter?.call(el, next);
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }}
        className={cn(growClass, atLimit && "border-amber-500/60", className)}
      />
      {showCount && (
        <p className={cn("mt-1 text-right text-[0.7rem]", atLimit ? "text-amber-300" : "text-zinc-500")}>
          {atLimit ? `Limit reached, ${maxLength} characters` : `${count} of ${maxLength}`}
        </p>
      )}
    </div>
  );
}

/** A custom tick box. Replaces the browser checkbox. The label is part of the tap target. */
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

/**
 * Page controls for a list that is paged by the server: "Showing 11 to 20 of 45", Previous and Next.
 * Lists are never endless: the person always sees where they are and can only go one page at a time.
 */
export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPage,
  busy,
  className,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
  busy?: boolean;
  className?: string;
}) {
  if (total <= 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav aria-label="Pages" className={cn("flex flex-col items-center justify-between gap-2 sm:flex-row", className)}>
      <p className="text-xs text-zinc-500">
        Showing {from} to {to} of {total}
      </p>
      {totalPages > 1 && (
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Btn size="sm" arrow="back" className="!h-10 flex-1 sm:flex-none" disabled={page <= 1 || busy} onClick={() => onPage(page - 1)}>
            Previous
          </Btn>
          <span className="shrink-0 whitespace-nowrap px-2 text-xs text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <Btn size="sm" arrow="forward" className="!h-10 flex-1 sm:flex-none" disabled={page >= totalPages || busy} onClick={() => onPage(page + 1)}>
            Next
          </Btn>
        </div>
      )}
    </nav>
  );
}
