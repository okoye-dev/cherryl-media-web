import Link from "next/link";
import { formatCategoryName } from "@/lib/formatters";

export default function FigureCard({
  name,
  category = "DISPATCH",
  href = "/category/nigerian-current-affairs",
  imageUrl,
}: {
  index?: number;
  name: string;
  category?: string;
  href?: string;
  readTime?: string;
  imageUrl?: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="aspect-[16/10] rounded-[1.25rem] text-[0.8rem] relative overflow-hidden transition-all duration-500 group-hover:border-brand-red/30 border border-ink/10 bg-paper-deep">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center font-display italic text-ink-soft/40">
            Cherryl Media
          </div>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-night/80 backdrop-blur px-2.5 py-0.5 font-num text-[0.6rem] font-medium text-snow uppercase tracking-wider z-10 leading-none">
          {formatCategoryName(category)}
        </span>
      </div>
      <div className="mt-4 mb-2">
        <span title={name} className="line-clamp-3 block font-area text-[1.05rem] md:text-[1.15rem] md:line-clamp-4 font-semibold leading-snug tracking-[-0.02em] text-ink transition-all duration-200 group-hover:italic group-hover:text-brand-red">
          {name}
        </span>
      </div>
    </Link>
  );
}
