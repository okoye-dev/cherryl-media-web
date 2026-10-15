export default function PageHeader({
  label,
  title,
  intro,
  compact = false,
}: {
  label: string;
  title: React.ReactNode;
  intro?: string;
  /** Smaller title, for long titles such as a field note */
  compact?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[90rem] px-5 pb-6 pt-24 md:px-10 md:pt-32 xl:px-16">
      <p className="label intro font-medium text-ink-soft">{label}</p>
      <h1
        className={
          compact
            ? "intro mt-6 max-w-[32ch] font-area text-[clamp(1.5rem,2.8vw,2.35rem)] font-semibold leading-snug tracking-[-0.02em] text-ink"
            : "intro mt-6 max-w-[22ch] font-area text-[clamp(1.9rem,3.5vw,2.85rem)] font-semibold leading-tight tracking-[-0.025em] text-ink"
        }
        style={{ animationDelay: "100ms" }}
      >
        {title}
      </h1>
      {intro && (
        <p
          className="intro mt-6 max-w-[50ch] text-[1.05rem] font-normal leading-relaxed text-ink/85"
          style={{ animationDelay: "220ms" }}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
