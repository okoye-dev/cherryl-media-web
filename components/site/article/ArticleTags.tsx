export default function ArticleTags({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="mt-8 border-t border-ink/10 pt-6">
      <span className="label text-[0.7rem] font-semibold tracking-wider text-ink/60 uppercase block mb-3">Tags</span>
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full bg-paper-deep/70 px-3 py-1 font-mono text-[0.72rem] text-ink/80 border border-ink/10">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
