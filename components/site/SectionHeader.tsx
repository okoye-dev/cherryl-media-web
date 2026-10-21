import Pill from "./Pill";
import { withStop } from "@/lib/formatters";

/**
 * The big title that opens each homepage section.
 * It sticks under the site header, so you always know which section you are reading.
 * The bar is a see-through, blurred panel: text stays readable over whatever scrolls beneath it,
 * and the section artwork still shows faintly through it.
 */
export default function SectionHeader({
  id,
  title,
  eyebrow,
  href,
  linkLabel = "View all",
  shortLabel = "All",
}: {
  id?: string;
  title: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  /** Used when the bar is narrow, so the title keeps more of the room */
  shortLabel?: string;
}) {
  return (
    <div className="section-bar section-sticky self-end -mx-2 mb-6 border-b border-ink/15 bg-paper/70 px-2 pb-3 pt-3 backdrop-blur-xl md:mb-8">
      {eyebrow && <p className="label-red mb-1.5">{eyebrow}</p>}
      <div className="flex items-center justify-between gap-4">
        <h2
          id={id}
          className="flex min-w-0 items-center gap-3 font-area text-[clamp(1.4rem,2.6vw,2.1rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-ink"
        >
          <span aria-hidden="true" className="h-[0.9em] w-1 shrink-0 rounded-full bg-brand-red" />
          <span className="py-1">{withStop(title)}</span>
        </h2>
        {href && (
          <Pill href={href} arrow="forward">
            <span className="pill-long">{linkLabel}</span>
            <span className="pill-short">{shortLabel}</span>
          </Pill>
        )}
      </div>
    </div>
  );
}
