/**
 * Adire-inspired pattern field (Yoruba indigo-dyed cloth). Five rows, each with its
 * own motif, from the bottom up: rings, diamond chain, zigzag, cowrie dots, sparse
 * crosses. The whole thing fades out towards the top so it never fights with text.
 */
const TILE = 44;
const RED = "#E01E1E";
const ORANGE = "#D9601E";

const ROWS = [
  { id: "ring", opacity: 0.8 },
  { id: "diamond", opacity: 0.65 },
  { id: "zig", opacity: 0.5 },
  { id: "cowrie", opacity: 0.38 },
  { id: "cross", opacity: 0.26 },
];

export default function AdirePattern({
  className,
  scale = 1,
}: {
  className?: string;
  /** How much to enlarge the motifs. 1 is the base size. */
  scale?: number;
}) {
  const rowH = TILE * scale;
  const height = rowH * ROWS.length;
  return (
    <svg
      className={className}
      width="100%"
      height={height}
      role="presentation"
      aria-hidden="true"
      style={{
        maskImage: "linear-gradient(to top, #000 15%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to top, #000 15%, transparent 100%)",
      }}
    >
      <defs>
        {/* rings with a dotted heart */}
        <pattern id="adire-ring" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
          <g fill="none" stroke={RED} strokeWidth="1.6">
            <circle cx="22" cy="22" r="15" />
            <circle cx="22" cy="22" r="9.5" />
          </g>
          <circle cx="22" cy="22" r="3.2" fill={RED} />
          <g fill={ORANGE}>
            <circle cx="22" cy="3" r="1.6" />
            <circle cx="22" cy="41" r="1.6" />
            <circle cx="3" cy="22" r="1.6" />
            <circle cx="41" cy="22" r="1.6" />
          </g>
        </pattern>

        {/* nested diamonds in a chain */}
        <pattern id="adire-diamond" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
          <g fill="none" stroke={RED} strokeWidth="1.6" strokeLinejoin="round">
            <polygon points="22,4 40,22 22,40 4,22" />
            <polygon points="22,13 31,22 22,31 13,22" />
          </g>
          <circle cx="22" cy="22" r="2.4" fill={ORANGE} />
        </pattern>

        {/* double zigzag */}
        <pattern id="adire-zig" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
          <path d="M0 18 L11 6 L22 18 L33 6 L44 18" fill="none" stroke={RED} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M0 36 L11 24 L22 36 L33 24 L44 36" fill="none" stroke={ORANGE} strokeWidth="1.8" strokeLinejoin="round" />
        </pattern>

        {/* cowrie-shell dots: a ring and a dot, offset */}
        <pattern id="adire-cowrie" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
          <circle cx="11" cy="11" r="6" fill="none" stroke={RED} strokeWidth="1.6" />
          <circle cx="11" cy="11" r="1.8" fill={RED} />
          <circle cx="33" cy="33" r="6" fill="none" stroke={ORANGE} strokeWidth="1.6" />
          <circle cx="33" cy="33" r="1.8" fill={ORANGE} />
          <circle cx="33" cy="11" r="1.4" fill={RED} />
          <circle cx="11" cy="33" r="1.4" fill={ORANGE} />
        </pattern>

        {/* sparse crosses */}
        <pattern id="adire-cross" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform={`scale(${scale})`}>
          <path d="M22 14v16M14 22h16" stroke={RED} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="3" cy="3" r="1.4" fill={ORANGE} />
          <circle cx="41" cy="41" r="1.4" fill={ORANGE} />
        </pattern>
      </defs>

      {ROWS.map((row, i) => (
        <rect
          key={row.id}
          x={0}
          y={height - (i + 1) * rowH}
          width="100%"
          height={rowH}
          fill={`url(#adire-${row.id})`}
          opacity={row.opacity}
        />
      ))}
    </svg>
  );
}
