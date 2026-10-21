export default function EditionStamp({ className, title = "Morning Edition, every day at 6 AM" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label={title}>
      <defs>
        <path id="stamp-ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
      </defs>
      <circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <text fontSize="9" fill="currentColor">
        <textPath href="#stamp-ring" textLength="272" lengthAdjust="spacing">MORNING EDITION · 6 AM · EVERY DAY ·</textPath>
      </text>
      <circle cx="60" cy="60" r="12" fill="#E01E1E" />
      <g stroke="#D9601E" strokeWidth="2" strokeLinecap="round">
        <path d="M60 40v-4M60 84v-4M40 60h-4M84 60h-4M46 46l-3-3M77 77l-3-3M74 46l3-3M43 77l3-3" />
      </g>
    </svg>
  );
}
