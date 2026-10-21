import { Badge } from "@/components/admin/ui";

export default function StatusBadge({ status, small }: { status: string; small?: boolean }) {
  return (
    <Badge tone={status === "published" ? "green" : "amber"} className={small ? "!px-1.5 !py-[3px] !text-[0.6rem]" : undefined}>
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  );
}
