import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { growClass } from "./styles";

type TextInputProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "rows" | "onChange" | "value" | "defaultValue"
> & {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  multiline?: boolean;
  alwaysCount?: boolean;
};

export function TextInput({ value, onChange, multiline = false, maxLength, alwaysCount, className, onKeyDown, onPaste, ...rest }: TextInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const fit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Measuring needs the box collapsed for a moment, which makes the page shorter and lets the
    // browser throw the scroll position elsewhere. Remember it and put it back, without the
    // site-wide smooth scrolling, so the page does not move at all.
    const y = window.scrollY;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
    el.scrollTop = 0;
    if (window.scrollY !== y) window.scrollTo({ top: y, behavior: "instant" });

    // While writing at the end of the text, keep the line being written in view above the
    // fixed bar at the bottom of the screen: the page follows the typing.
    if (document.activeElement === el && el.selectionStart === el.value.length) {
      const room = window.innerHeight - 110;
      const bottom = el.getBoundingClientRect().bottom;
      if (bottom > room) window.scrollBy({ top: bottom - room, behavior: "instant" });
    }
  }, []);

  useLayoutEffect(fit, [value, fit]);
  useEffect(() => {
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);

  const count = value.length;
  const showCount = typeof maxLength === "number" && (alwaysCount || count >= maxLength * 0.8);
  const atLimit = typeof maxLength === "number" && count >= maxLength;

  return (
    <div className="min-w-0">
      <textarea
        {...rest}
        ref={ref}
        rows={1}
        value={value}
        maxLength={maxLength}
        onChange={onChange}
        onKeyDown={(e) => {
          if (!multiline && e.key === "Enter") e.preventDefault();
          onKeyDown?.(e);
        }}
        onPaste={(e) => {
          onPaste?.(e);
          if (multiline || e.defaultPrevented) return;
          // A pasted line break would turn a one line field into several: swap it for a space.
          const text = e.clipboardData.getData("text");
          if (/[\r\n]/.test(text)) {
            e.preventDefault();
            const el = e.currentTarget;
            const room = typeof maxLength === "number" ? Math.max(0, maxLength - (value.length - (el.selectionEnd - el.selectionStart))) : Infinity;
            const clean = text.replace(/\s*[\r\n]+\s*/g, " ").slice(0, room);
            const next = value.slice(0, el.selectionStart) + clean + value.slice(el.selectionEnd);
            const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
            setter?.call(el, next);
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }}
        className={cn(growClass, atLimit && "border-amber-500/60", className)}
      />
      {showCount && (
        <p className={cn("mt-1 text-right text-[0.7rem]", atLimit ? "text-amber-300" : "text-zinc-500")}>
          {atLimit ? `Limit reached, ${maxLength} characters` : `${count} of ${maxLength}`}
        </p>
      )}
    </div>
  );
}
