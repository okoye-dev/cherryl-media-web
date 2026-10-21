"use client";

import { Btn, useSheetClose } from "@/components/admin/ui";

export function SheetCloseBtn({
  children = "Close",
  variant,
  block,
}: {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  block?: boolean;
}) {
  const close = useSheetClose();
  return (
    <Btn variant={variant} block={block} onClick={close}>
      {children}
    </Btn>
  );
}
