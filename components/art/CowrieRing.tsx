/** Concentric rings with a dotted heart, taken from the adire pattern. */
export default function CowrieRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g fill="none" stroke="#E01E1E" strokeWidth="2">
        <circle cx="32" cy="32" r="28" />
        <circle cx="32" cy="32" r="19" />
        <circle cx="32" cy="32" r="10" />
      </g>
      <circle cx="32" cy="32" r="3.4" fill="#E01E1E" />
      <g fill="#D9601E">
        <circle cx="32" cy="3" r="2" />
        <circle cx="32" cy="61" r="2" />
        <circle cx="3" cy="32" r="2" />
        <circle cx="61" cy="32" r="2" />
      </g>
    </svg>
  );
}
