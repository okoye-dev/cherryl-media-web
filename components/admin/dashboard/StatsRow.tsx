interface Stat {
  label: string;
  value: number;
  tone: string;
}

export default function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-white/[0.08] bg-[#16181D] px-3.5 py-2.5 sm:px-4 sm:py-3">
          <p className="text-xs text-zinc-400">{s.label}</p>
          <p className={`mt-0.5 font-num text-xl font-semibold ${s.tone}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
