import Link from "next/link";
import { cn } from "@/lib/cn";
import Arrow from "@/components/site/Arrow";

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
  arrow?: "forward" | "back";
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
