import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 antialiased selection:bg-brand-red selection:text-white">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800/80 bg-[#111827]/95 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-baseline gap-2 font-display text-lg font-medium tracking-tight text-white">
            <span className="font-semibold text-white">CHERRYL</span>
            <span className="italic text-brand-red">Studio</span>
          </Link>
          <span className="hidden items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 font-num text-[0.68rem] font-medium uppercase tracking-wider text-slate-300 md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Editorial Desk Active
          </span>
        </div>

        <nav className="flex items-center gap-5 text-xs font-medium">
          <Link href="/admin" className="text-slate-300 transition-colors hover:text-white">
            Stories &amp; Inbox
          </Link>
          <Link href="/admin/editor" className="rounded-full bg-brand-red px-4 py-1.5 font-medium text-white shadow-sm transition-all hover:bg-brand-red/90 hover:shadow-md">
            + Write Story
          </Link>
          <Link href="/" target="_blank" className="rounded-full border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-slate-300 transition-colors hover:border-slate-600 hover:text-white">
            View Public Site ↗
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[96rem] p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
