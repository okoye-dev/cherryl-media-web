export default function Waveform({ className }: { className?: string }) {
  const bars = Array.from({ length: 64 }, (_, i) => {
    const t = i / 63;
    const env = Math.sin(t * Math.PI);
    const h = 20 + 120 * env * (0.45 + 0.55 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)));
    return { x: 12 + i * 18.4, h };
  });
  return (
    <svg viewBox="0 0 1200 300" className={className} aria-hidden="true">
      <g strokeLinecap="round" strokeWidth="9">
        {bars.map((b, i) => (
          <line key={i} x1={b.x} x2={b.x} y1={150 - b.h} y2={150 + b.h} stroke={i % 7 === 0 ? "#D9601E" : "#E01E1E"} />
        ))}
      </g>
    </svg>
  );
}
