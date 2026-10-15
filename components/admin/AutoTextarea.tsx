"use client";

import { useEffect, useRef, TextareaHTMLAttributes } from "react";

interface AutoTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
}

export default function AutoTextarea({
  value,
  onChange,
  className = "",
  rows = 1,
  ...props
}: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.max(ref.current.scrollHeight, 40)}px`;
    }
  };

  useEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={rows}
      value={value}
      onChange={(e) => {
        resize();
        if (onChange) onChange(e);
      }}
      className={`w-full resize-none overflow-hidden transition-all duration-150 ${className}`}
      {...props}
    />
  );
}
