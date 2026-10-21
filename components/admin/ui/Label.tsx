export function Label({ children, htmlFor, hint }: { children: React.ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-2 text-[0.7rem] font-medium text-zinc-400">
      <span>{children}</span>
      {hint && <span className="font-normal text-zinc-500">{hint}</span>}
    </label>
  );
}
