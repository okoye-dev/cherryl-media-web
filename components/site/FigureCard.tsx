import Link from "next/link";
import Arrow from "./Arrow";
import Placeholder from "./Placeholder";

export default function FigureCard({
  index,
  name,
  category = "DISPATCH",
  href = "/category/state-affairs-environs",
  readTime = "4 min",
}: {
  index: number;
  name: string;
  category?: string;
  href?: string;
  readTime?: string;
}) {
  return (
    <Link href={href} className="group block">
      <Placeholder className="aspect-[16/10] rounded-[1.25rem] text-[0.8rem] relative overflow-hidden transition-all duration-500 group-hover:border-brand-red/30">
        <span className="font-display italic text-ink-soft/40">Cherryl Media</span>
        <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 backdrop-blur px-2.5 py-0.5 font-num text-[0.65rem] text-paper uppercase">
          {category}
        </span>
      </Placeholder>
      <div className="mt-3.5 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-num text-[0.7rem] font-medium text-brand-red">
              No. {String(index).padStart(2, "0")}
            </span>
            <span className="text-[0.68rem] font-medium text-ink-soft">· {readTime}</span>
          </div>
          <span className="mt-1 block font-display text-[1.08rem] md:text-[1.18rem] font-normal leading-snug tracking-[-0.01em] text-ink transition-colors duration-300 group-hover:italic group-hover:text-brand-red">
            {name}
          </span>
        </div>
        <Arrow className="h-3 w-3 shrink-0 text-ink-soft transition-all duration-150 ease-out group-hover:translate-x-0.5 group-hover:rotate-[15deg] group-hover:text-brand-red" />
      </div>
    </Link>
  );
}
