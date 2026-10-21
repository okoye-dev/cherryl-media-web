import React from "react";
import { Label, TextInput } from "@/components/admin/ui";

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  rows?: number;
  hint?: string;
  maxLength?: number;
  note?: string;
  className?: string;
}

export function Field({ label, value, onChange, type = "text", rows, hint, note, maxLength, className }: FieldProps) {
  const id = React.useId();
  return (
    <div className={className}>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <TextInput
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        multiline={!!rows}
        maxLength={maxLength}
        inputMode={type === "email" ? "email" : undefined}
        autoComplete={type === "email" ? "email" : undefined}
      />
      {note && <p className="mt-1.5 text-xs text-zinc-500">{note}</p>}
    </div>
  );
}
