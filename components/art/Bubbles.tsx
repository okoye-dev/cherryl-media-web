export default function Bubbles({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 700 460" className={className} aria-hidden="true">
      <g fill="none" strokeLinejoin="round" strokeLinecap="round">
        <path d="M70 40h380a50 50 0 0 1 50 50v150a50 50 0 0 1-50 50H190l-90 70v-70H70a50 50 0 0 1-50-50V90a50 50 0 0 1 50-50z" stroke="#E01E1E" strokeWidth="3" />
        <path d="M300 170h330a50 50 0 0 1 50 50v120a50 50 0 0 1-50 50h-20v62l-80-62H300a50 50 0 0 1-50-50V220a50 50 0 0 1 50-50z" stroke="#D9601E" strokeWidth="3" />
        <path d="M80 110h300M80 150h220M80 190h260" stroke="#E01E1E" strokeWidth="3" opacity="0.7" />
        <path d="M320 245h290M320 285h200" stroke="#D9601E" strokeWidth="3" opacity="0.7" />
      </g>
    </svg>
  );
}
