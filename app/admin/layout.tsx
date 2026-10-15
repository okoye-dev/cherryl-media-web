import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0E0F12] text-zinc-100 antialiased selection:bg-brand-red selection:text-white">
      {/* Modern, high-end editorial newsroom navigation */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/[0.08] bg-[#141519]/95 px-4 sm:px-8 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/admin" className="flex items-baseline gap-2 text-base sm:text-lg font-medium tracking-tight text-white">
            <span className="font-semibold text-white tracking-wider">CHERRYL</span>
            <span className="text-xs font-mono uppercase tracking-widest text-brand-red font-semibold">NEWSROOM</span>
          </Link>
          <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-0.5 font-mono text-[0.68rem] font-medium text-zinc-400 md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Editorial Desk Active
          </span>
        </div>

        <nav className="flex items-center gap-3 sm:gap-4 text-xs font-medium">
          <Link
            href="/admin"
            className="hidden sm:inline-block text-zinc-300 transition-colors hover:text-white px-2 py-1"
          >
            All Stories
          </Link>
          <Link
            href="/admin/editor"
            className="rounded-lg bg-brand-red px-3.5 py-1.5 font-medium text-white shadow-sm transition-all hover:bg-brand-red/90"
          >
            + Write Story
          </Link>
          <Link
            href="/"
            target="_blank"
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
          >
            View Site ↗
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[96rem] p-4 sm:p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
