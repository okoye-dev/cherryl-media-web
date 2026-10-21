/** A pair of cherries on a stem with one leaf. The brand mark, drawn flat. */
export default function Cherries({ className, title = "Cherries" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={title}>
      <path d="M30 66 C34 40 44 22 66 14" fill="none" stroke="#D9601E" strokeWidth="3" strokeLinecap="round" />
      <path d="M72 70 C70 46 68 30 66 14" fill="none" stroke="#D9601E" strokeWidth="3" strokeLinecap="round" />
      <path d="M66 14 C76 6 90 8 94 18 C84 24 72 22 66 14Z" fill="#F08A24" />
      <circle cx="30" cy="72" r="16" fill="#E01E1E" />
      <circle cx="72" cy="76" r="16" fill="#E01E1E" />
      <circle cx="25" cy="66" r="4" fill="#FF8A5C" opacity="0.8" />
      <circle cx="67" cy="70" r="4" fill="#FF8A5C" opacity="0.8" />
    </svg>
  );
}
