export default function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={className ?? "h-[0.7em] w-[0.7em]"}
    >
      <path
        d="M2 2.5h7.5V10M9.5 2.5 2 10"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
