import { Sheet } from "@/components/admin/ui";
import { SheetCloseBtn } from "@/components/admin/SheetCloseBtn";

export default function EditorPickerSheet({
  open,
  title,
  notice,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  notice?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      size="tall"
      toolbar={notice ? <p className="text-xs text-amber-200">{notice}</p> : undefined}
      footer={
        <>
          {footer}
          <SheetCloseBtn block />
        </>
      }
    >
      {children}
    </Sheet>
  );
}
