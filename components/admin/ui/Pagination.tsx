import { cn } from "@/lib/cn";
import { Btn } from "./Btn";

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPage,
  busy,
  className,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
  busy?: boolean;
  className?: string;
}) {
  if (total <= 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav aria-label="Pages" className={cn("flex flex-col items-center justify-between gap-2 sm:flex-row", className)}>
      <p className="text-xs text-zinc-500">
        Showing {from} to {to} of {total}
      </p>
      {totalPages > 1 && (
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Btn size="sm" arrow="back" className="!h-10 flex-1 sm:flex-none" disabled={page <= 1 || busy} onClick={() => onPage(page - 1)}>
            Previous
          </Btn>
          <span className="shrink-0 whitespace-nowrap px-2 text-xs text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <Btn size="sm" arrow="forward" className="!h-10 flex-1 sm:flex-none" disabled={page >= totalPages || busy} onClick={() => onPage(page + 1)}>
            Next
          </Btn>
        </div>
      )}
    </nav>
  );
}
