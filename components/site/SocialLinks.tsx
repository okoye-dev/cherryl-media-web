import { SITE } from "@/config/site";
import { PILL_BASE } from "./Pill";
import { cn } from "@/utils";

// Outline icons from Tabler Icons (MIT licence).
const ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3" />
      <path d="M16.5 7.5v.01" />
    </>
  ),
  facebook: <path d="M7 10v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3h-3a5 5 0 0 0-5 5v2H7" />,
  x: (
    <>
      <path d="M4 4l11.733 16H20L8.267 4z" />
      <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
    </>
  ),
  linkedin: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 11v5M8 8v.01M12 16v-5M16 16v-3a2 2 0 0 0-4 0" />
    </>
  ),
};

export type SocialKey = "instagram" | "facebook" | "x" | "linkedin";

/** One network's icon, drawn in the current text colour. */
export function SocialIcon({ name, className }: { name: SocialKey; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "h-[1.05rem] w-[1.05rem]"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

function keyFor(label: string): string | null {
  const l = label.toLowerCase();
  if (l.includes("instagram")) return "instagram";
  if (l.includes("facebook")) return "facebook";
  if (l.includes("twitter") || l === "x") return "x";
  if (l.includes("linkedin")) return "linkedin";
  return null;
}

/** Round icon links for the social accounts in the site config. Same hover as every other button. */
export default function SocialLinks({
  only,
  tone = "dark",
  className,
}: {
  /** Icon keys to show, in order. Leave out to show every account. */
  only?: SocialKey[];
  /** "dark" for the dark blocks, "page" for normal page backgrounds */
  tone?: "dark" | "page";
  className?: string;
}) {
  const items = SITE.socials
    .map((s) => ({ ...s, key: keyFor(s.label) }))
    .filter((s): s is typeof s & { key: string } => !!s.key && (!only || only.includes(s.key as SocialKey)));
  if (only) items.sort((a, b) => only.indexOf(a.key as SocialKey) - only.indexOf(b.key as SocialKey));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {items.map((s) => (
        <a
          key={s.key}
          href={s.href}
          target="_blank"
          rel="noreferrer"
          aria-label={s.label}
          className={cn(PILL_BASE, "h-9 w-9 justify-center border p-0",
            tone === "dark" ? "border-snow/25 text-snow" : "border-ink/20 text-ink",)}
        >
          <SocialIcon name={s.key as SocialKey} />
        </a>
      ))}
    </div>
  );
}
