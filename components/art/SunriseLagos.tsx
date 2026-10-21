/**
 * Flat illustration for the newsletter block: sunrise behind the Lekki-Ikoyi
 * cable-stayed bridge, with the Lagos skyline either side. Drawn by hand as SVG,
 * so it is crisp at any size. Crops to the centre (sun and bridge) on phones.
 * Pass fade to let the top dissolve, so the scene can sit behind text.
 */

// Same pseudo-random numbers every render, so server and browser agree.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

type Tower = { x: number; y: number; w: number; mast?: number; slant?: boolean };

const LEFT: Tower[] = [
  { x: 24, y: 296, w: 44 },
  { x: 74, y: 246, w: 36 },
  { x: 116, y: 282, w: 48 },
  { x: 170, y: 198, w: 40, mast: 34 },
  { x: 216, y: 268, w: 46 },
  { x: 268, y: 232, w: 38, slant: true },
  { x: 312, y: 300, w: 40 },
];
const RIGHT: Tower[] = [
  { x: 848, y: 292, w: 40 },
  { x: 894, y: 236, w: 38, slant: true },
  { x: 938, y: 280, w: 50 },
  { x: 994, y: 186, w: 36, mast: 40 },
  { x: 1036, y: 262, w: 46 },
  { x: 1088, y: 246, w: 34 },
  { x: 1128, y: 302, w: 48 },
];

const GROUND = 400;
const DARK = "#0c0608";

function Towers({ towers, seed }: { towers: Tower[]; seed: number }) {
  const r = rng(seed);
  return (
    <>
      {towers.map((t, i) => {
        const h = GROUND - t.y;
        const cols = Math.max(2, Math.floor(t.w / 14));
        const rows = Math.floor((h - 14) / 18);
        const windows: React.ReactNode[] = [];
        for (let c = 0; c < cols; c++) {
          for (let k = 0; k < rows; k++) {
            if (r() > 0.34) continue;
            windows.push(
              <rect
                key={`${c}-${k}`}
                x={t.x + 6 + c * ((t.w - 12) / cols) + 1}
                y={t.y + 12 + k * 18}
                width={4}
                height={6}
                fill="#FFB48A"
                opacity={0.55}
              />,
            );
          }
        }
        return (
          <g key={i}>
            {t.slant ? (
              <polygon
                points={`${t.x},${GROUND} ${t.x},${t.y + 26} ${t.x + t.w},${t.y} ${t.x + t.w},${GROUND}`}
                fill={DARK}
              />
            ) : (
              <rect x={t.x} y={t.y} width={t.w} height={h} fill={DARK} />
            )}
            {t.mast && (
              <rect x={t.x + t.w / 2 - 1} y={t.y - t.mast} width={2} height={t.mast} fill={DARK} />
            )}
            {windows}
          </g>
        );
      })}
    </>
  );
}

export default function SunriseLagos({ className, fade = false }: { className?: string; fade?: boolean }) {
  // Bridge cables: eight on each side, fanning from the tower down to the deck.
  const cables = Array.from({ length: 8 }, (_, i) => ({
    topY: 168 + i * 8,
    reach: 46 + i * 30,
  }));
  const stars = [
    [150, 60], [260, 110], [380, 44], [470, 96], [730, 80], [830, 38], [950, 100], [1060, 58], [1150, 120], [90, 130],
  ];

  return (
    <svg
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      style={
        fade
          ? {
              maskImage: "linear-gradient(to top, #000 55%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to top, #000 55%, transparent 100%)",
            }
          : undefined
      }
      role="img"
      aria-label="Sunrise over the Lagos skyline and the Lekki-Ikoyi bridge"
    >
      {/* sky dots */}
      {stars.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2 : 1.4} fill="#F3E3D3" opacity={0.6} />
      ))}

      {/* ripples out of the sun */}
      {[326, 294, 262].map((r, i) => (
        <circle key={r} cx={600} cy={GROUND} r={r} fill="none" stroke="#E01E1E" strokeWidth={2} opacity={0.2 + i * 0.12} />
      ))}

      {/* the sun */}
      <circle cx={600} cy={GROUND} r={230} fill="#E01E1E" />
      <circle cx={600} cy={GROUND} r={178} fill="none" stroke="#0c0608" strokeWidth={2} opacity={0.22} />
      <circle cx={600} cy={GROUND} r={126} fill="none" stroke="#0c0608" strokeWidth={2} opacity={0.22} />
      <circle cx={600} cy={GROUND} r={74} fill="#F08A24" />

      {/* skyline */}
      <Towers towers={LEFT} seed={7} />
      <Towers towers={RIGHT} seed={21} />

      {/* the bridge: tower, deck, cables */}
      <rect x={330} y={338} width={540} height={8} fill={DARK} />
      <polygon points="584,338 593,146 607,146 616,338" fill={DARK} />
      <rect x={576} y={146} width={48} height={5} fill={DARK} />
      {cables.map((c, i) => (
        <g key={i} stroke={DARK} strokeWidth={1.6}>
          <line x1={598} y1={c.topY} x2={598 - c.reach} y2={338} />
          <line x1={602} y1={c.topY} x2={602 + c.reach} y2={338} />
        </g>
      ))}

      {/* water */}
      <rect x={0} y={346} width={1200} height={54} fill={DARK} opacity={0.5} />
      {[
        [470, 730, 358], [510, 690, 368], [545, 655, 378], [575, 625, 388], [440, 760, 396],
      ].map(([a, b, y]) => (
        <line key={y} x1={a} y1={y} x2={b} y2={y} stroke="#FF8A5C" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      ))}

      {/* birds (left out when the scene sits behind text) */}
      {!fade && [[286, 84], [330, 62], [892, 104]].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y} q7 -7 14 0 q7 -7 14 0`}
          fill="none"
          stroke="#F3E3D3"
          strokeWidth={1.8}
          strokeLinecap="round"
          opacity={0.75}
        />
      ))}
    </svg>
  );
}
