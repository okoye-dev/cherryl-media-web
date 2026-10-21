import Link from "next/link";
import { formatCategoryName, formatReadTime } from "@/lib/formatters";

export default function OverlayCard({
  name,
  category = "Dispatch",
  href,
  imageUrl,
  readTime,
  author,
  showCategory = true,
}: {
  name: string;
  category?: string;
  href: string;
  imageUrl?: string;
  readTime?: string;
  author?: string;
  showCategory?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-ink/10 bg-night sm:aspect-[5/4] lg:aspect-[1/1] 2xl:aspect-[4/5]"
    >
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgb(8 6 8 / 0.92) 0%, rgb(8 6 8 / 0.82) 22%, rgb(8 6 8 / 0.55) 42%, rgb(8 6 8 / 0.22) 62%, rgb(8 6 8 / 0) 80%)",
        }}
      />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 md:p-5">
        <span className="min-w-0 truncate rounded-full border border-snow/25 bg-night/40 px-2.5 py-1 text-[0.68rem] font-medium leading-none text-snow backdrop-blur-md empty:hidden">
          {author}
        </span>
        {readTime && (
          <span className="ml-auto shrink-0 rounded-full border border-snow/25 bg-night/40 px-2.5 py-1 font-num text-[0.68rem] font-medium leading-none text-snow backdrop-blur-md">
            {formatReadTime(readTime)}
          </span>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        {showCategory && (
          <span className="mb-3 inline-block rounded-full border border-snow/25 bg-snow/10 px-2.5 py-1 font-num text-[0.6rem] font-medium uppercase leading-none tracking-wider text-snow backdrop-blur-md">
            {formatCategoryName(category)}
          </span>
        )}
        <h3
          title={name}
          className="line-clamp-3 font-area text-[1.08rem] font-semibold leading-snug tracking-[-0.02em] text-snow text-balance transition-all duration-200 group-hover:italic sm:text-[1.05rem] md:text-[1.12rem] lg:line-clamp-4 lg:text-[1.15rem]"
        >
          {name}
        </h3>
      </div>
    </Link>
  );
}
