import Link from "next/link";
import { cn } from "@/lib/cn";
import Arrow from "./Arrow";

export const PILL_BASE =
  "group inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full px-4 py-2 text-[0.76rem] font-medium leading-none transition-colors duration-300 hover:bg-brand-red/30";

const VARIANTS = {
  outline: "border border-ink/20 text-ink",
  filled: "border border-brand-red/30 bg-brand-red/10 text-ink",
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
