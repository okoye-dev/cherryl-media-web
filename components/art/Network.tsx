const NODES: Array<[number, number, number]> = [
  [60, 120, 7], [150, 60, 5], [250, 150, 9], [340, 70, 5], [450, 130, 7], [560, 60, 5], [640, 150, 8], [740, 90, 5],
  [100, 250, 5], [210, 300, 7], [330, 240, 6], [430, 310, 10], [540, 250, 6], [650, 320, 6], [760, 240, 7],
];
const EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [0, 8], [2, 9], [2, 10], [4, 11], [6, 13], [7, 14],
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [3, 10], [4, 12], [1, 8],
];
export default function Network({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 820 380" className={className} aria-hidden="true">
      <g stroke="#E01E1E" strokeWidth="2" opacity="0.8">
        {EDGES.map(([a, b], i) => (
          <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
        ))}
      </g>
      {NODES.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r + 8} fill="none" stroke="#D9601E" strokeWidth="1.6" opacity="0.7" />
          <circle cx={x} cy={y} r={r} fill={i % 3 === 0 ? "#D9601E" : "#E01E1E"} />
        </g>
      ))}
    </svg>
  );
}
