
type Block = { x: number; y: number; w: number; mast?: number };

const BLOCKS: Block[] = [
  { x: 0, y: 232, w: 60 }, { x: 64, y: 198, w: 44 },
  { x: 330, y: 190, w: 38, mast: 34 }, { x: 372, y: 150, w: 34 }, { x: 410, y: 214, w: 50 },
  { x: 872, y: 62, w: 40, mast: 36 }, { x: 966, y: 200, w: 44 }, { x: 1014, y: 128, w: 36, mast: 28 },
  { x: 1054, y: 240, w: 60 }, { x: 1118, y: 208, w: 82 },
];

const GROUND = 300;

function windows(b: Block, seed: number) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const out: Array<[number, number]> = [];
  const cols = Math.max(2, Math.floor(b.w / 12));
  const rows = Math.floor((GROUND - b.y - 16) / 16);
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++) if (rnd() < 0.3) out.push([b.x + 7 + c * ((b.w - 14) / cols), b.y + 12 + r * 16]);
  return out;
}

export default function LagosSkyline({ className }: { className?: string }) {
  const cables = Array.from({ length: 10 }, (_, i) => ({ topY: 74 + i * 14, reach: 44 + i * 28 }));
  return (
    <svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden="true">
      <g fill="#E01E1E">
        {BLOCKS.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={b.y} width={b.w} height={GROUND - b.y} />
            {b.mast && <rect x={b.x + b.w / 2 - 1.5} y={b.y - b.mast} width={3} height={b.mast} />}
            {b.y < 200 && <rect x={b.x + 8} y={b.y - 10} width={b.w - 16} height={10} />}
          </g>
        ))}

        <path d="M118 300 142 258H282L306 300Z" />
        <path d="M134 258C138 202 178 172 212 172S286 202 290 258Z" />
        <rect x={126} y={254} width={172} height={8} />
        <path d="M212 172V150" stroke="#E01E1E" strokeWidth={4} />

        <polygon points="820,300 820,124 868,92 868,300" />
        <polygon points="916,300 916,150 960,178 960,300" />

        <rect x={458} y={262} width={306} height={8} />
        <rect x={478} y={270} width={10} height={30} />
        <rect x={734} y={270} width={10} height={30} />
        <polygon points="601,300 607,34 615,34 621,300" />
        <rect x={596} y={58} width={30} height={6} />
      </g>

      <g fill="#F08A24" opacity="0.9">
        {BLOCKS.flatMap((b, i) => windows(b, 11 + i * 7).map(([x, y], k) => <rect key={`${i}-${k}`} x={x} y={y} width={4} height={6} />))}
        {Array.from({ length: 9 }, (_, i) => <rect key={`d${i}`} x={156 + i * 14} y={236} width={4} height={6} />)}
      </g>

      <g stroke="#E01E1E" strokeWidth={2} strokeLinecap="round">
        {cables.map((c, i) => (
          <g key={i}>
            <line x1={608} y1={c.topY} x2={608 - c.reach} y2={262} />
            <line x1={614} y1={c.topY} x2={614 + c.reach} y2={262} />
          </g>
        ))}
      </g>
    </svg>
  );
}
