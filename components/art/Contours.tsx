export default function Contours({ className }: { className?: string }) {
  const rings = Array.from({ length: 11 }, (_, k) => {
    const base = 26 + k * 25;
    const pts = Array.from({ length: 96 }, (_, i) => {
      const t = (i / 96) * Math.PI * 2;
      const r = base * (1 + 0.1 * Math.sin(3 * t + k * 0.45) + 0.06 * Math.sin(5 * t - k * 0.3) + 0.03 * Math.sin(8 * t + k));
      return `${i === 0 ? "M" : "L"}${(300 + r * Math.cos(t)).toFixed(1)} ${(300 + r * Math.sin(t)).toFixed(1)}`;
    });
    return pts.join("") + "Z";
  });
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden="true">
      <g fill="none" strokeLinejoin="round">
        {rings.map((d, i) => (
          <path key={i} d={d} stroke={i % 4 === 0 ? "#D9601E" : "#E01E1E"} strokeWidth={i % 4 === 0 ? 3 : 2} />
        ))}
      </g>
    </svg>
  );
}
