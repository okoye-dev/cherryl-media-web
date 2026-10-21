import Link from "next/link";
import { cn } from "@/utils";
import Arrow from "./Arrow";

/**
 * The one button look for the whole site, and the one hover effect:
 * the background turns a see-through red. Text and border colours never change,
 * so the label stays readable on every background.
 */
export const PILL_BASE =
  "group inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full px-4 py-2 text-[0.76rem] font-medium leading-none transition-colors duration-300 hover:bg-brand-red/30";

const VARIANTS = {
  /** Outlined, for normal page backgrounds */
  outline: "border border-ink/20 text-ink",
  /** Lightly tinted, for the one button that should stand out in a group */
  filled: "border border-brand-red/30 bg-brand-red/10 text-ink",
  /** Outlined, for the dark blocks (footer, newsletter) */
  onDark: "border border-snow/25 text-snow",
};

interface IProps {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
  arrow?: "forward" | "back" | "none";
}

export default function Pill({
  href,
  children,
  variant = "outline",
  className,
  arrow = "none",
}: IProps) {
  const classes = cn(PILL_BASE, VARIANTS[variant], className);

  const content = (
    <>
      {arrow === "back" && <Arrow className="h-[0.8em] w-[0.8em] rotate-180" />}
      {children}
      {arrow === "forward" && <Arrow />}
    </>
  );

  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }
  if (/^https?:/.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
