import { SocialIcon } from "@/components/site/SocialLinks";
import type { CanonicalArticle } from "@/lib/types";

function Channel({ name, label, text }: { name: "x" | "linkedin"; label: string; text: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-paper/50 p-3.5">
      <span className="mb-1.5 block text-ink" role="img" aria-label={label}>
        <SocialIcon name={name} />
      </span>
      <p className="text-ink-soft leading-relaxed line-clamp-3">{text}</p>
    </div>
  );
}

export default function ArticleSocial({ variants }: { variants: CanonicalArticle["channelVariants"] }) {
  if (!variants) return null;
  return (
    <div className="mt-8 rounded-2xl border border-ink/10 bg-cream p-6">
      <div className="flex items-center justify-between border-b border-ink/10 pb-3">
        <span className="label font-medium text-ink-soft">SOCIAL MEDIA CHANNELS</span>
        <span className="font-num text-[0.68rem] font-medium text-brand-red">Published Across Platforms</span>
      </div>
      <div className="mt-4 grid gap-4 text-xs sm:grid-cols-2">
        {variants.x && <Channel name="x" label="X" text={variants.x} />}
        {variants.linkedin && <Channel name="linkedin" label="LinkedIn" text={variants.linkedin} />}
      </div>
    </div>
  );
}
