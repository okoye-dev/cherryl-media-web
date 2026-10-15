import Link from "next/link";
import { cn } from "@/utils";
import Arrow from "./Arrow";

/** One pill size for the whole site. Only the colours change. */
const BASE =
  "group inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full px-4 py-2 text-[0.76rem] font-medium leading-none transition-colors duration-500";

const VARIANTS = {
  solid: "bg-ink text-paper hover:bg-brand-red hover:text-paper",
  ghost: "border border-ink/20 text-ink hover:border-brand-red hover:text-brand-red",
  red: "bg-brand-red text-white hover:bg-brand-red-deep",
  "red-ghost": "border border-brand-red text-brand-red hover:bg-brand-red hover:text-white",
  orange:
    "border border-orange text-orange-deep hover:bg-orange hover:text-paper",
  /** For the dark contact block */
  paper: "border border-paper bg-paper text-ink hover:bg-cream",
  line: "border border-paper/25 text-paper hover:border-brand-red hover:text-brand-red",
};

interface IProps {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
  arrow?: "up-right" | "left" | "none";
}

export default function Pill({
  href,
  children,
  variant = "solid",
  className,
  arrow = "up-right",
}: IProps) {
  const classes = cn(BASE, VARIANTS[variant], className);
  const forwardArrow = (
    <Arrow className="h-[0.8em] w-[0.8em] transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:rotate-[15deg]" />
  );
  const backArrow = (
    <span aria-hidden="true" className="text-[0.9em] transition-transform duration-150 ease-out group-hover:-translate-x-0.5">
      ←
    </span>
  );

  const content = (
    <>
      {arrow === "left" && backArrow}
      {children}
      {arrow === "up-right" && forwardArrow}
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
