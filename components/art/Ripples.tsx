export default function Ripples({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden="true">
      <g fill="none" stroke="#E01E1E">
        {Array.from({ length: 14 }, (_, i) => (
          <circle key={i} cx="300" cy="300" r={30 + i * 20} strokeWidth={i % 5 === 0 ? 2.5 : 1.5} opacity={1 - i * 0.05} />
        ))}
      </g>
    </svg>
  );
}
