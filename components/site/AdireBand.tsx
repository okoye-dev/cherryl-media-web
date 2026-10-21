/**
 * A repeating band inspired by Yoruba adire (indigo-dyed cloth): rings with a
 * dotted heart, set between small diamonds. Drawn as an SVG pattern, so it
 * repeats cleanly at any width.
 */
export default function AdireBand({ className }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="44" role="presentation" aria-hidden="true">
      <defs>
        <pattern id="adire" width="44" height="44" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#E01E1E" strokeWidth="1.6">
            <circle cx="22" cy="22" r="15" />
            <circle cx="22" cy="22" r="9.5" />
          </g>
          <circle cx="22" cy="22" r="3.2" fill="#E01E1E" />
          <g fill="#D9601E">
            <circle cx="22" cy="3" r="1.6" />
            <circle cx="22" cy="41" r="1.6" />
            <circle cx="3" cy="22" r="1.6" />
            <circle cx="41" cy="22" r="1.6" />
          </g>
          <g fill="none" stroke="#D9601E" strokeWidth="1.2">
            <path d="M0 0l5 5M44 0l-5 5M0 44l5-5M44 44l-5-5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="44" fill="url(#adire)" opacity="0.75" />
    </svg>
  );
}
