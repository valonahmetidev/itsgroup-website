"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

type SelectFieldProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  shape?: "pill" | "rounded";
  fullWidth?: boolean;
};

export function SelectField<T extends string>({
  value,
  onChange,
  options,
  label,
  placeholder,
  disabled = false,
  className,
  buttonClassName,
  shape = "rounded",
  fullWidth = true,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const shapeClass =
    shape === "pill" ? "rounded-full px-3 py-2 text-sm font-medium" : "rounded-2xl px-4 py-2.5 text-sm";

  return (
    <div ref={rootRef} className={cn("relative", fullWidth && "w-full", className)}>
      {label && <span className="mb-1 block text-xs text-ink/55">{label}</span>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        className={cn(
          "flex items-center justify-between gap-2 border border-ink/10 bg-surface text-left outline-none transition focus:border-tech disabled:cursor-not-allowed disabled:opacity-60",
          shapeClass,
          fullWidth && "w-full",
          buttonClassName,
        )}
      >
        <span className={cn("min-w-0 truncate", !selected && placeholder && "text-ink/55")}>
          {selected?.label ?? placeholder ?? ""}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink/40 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          className={cn(
            "absolute z-40 mt-2 overflow-hidden border border-ink/10 bg-card shadow-lift",
            shape === "pill" ? "rounded-2xl" : "rounded-2xl",
            fullWidth ? "w-full min-w-[10rem]" : "min-w-[10rem]",
          )}
        >
          <div className="max-h-60 overflow-y-auto p-1.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value || "__empty__"}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-surface",
                    isSelected && "bg-tech/10 font-semibold text-tech",
                  )}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
