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
  size?: "default" | "compact";
  placement?: "top" | "bottom";
  fullWidth?: boolean;
  hideLabel?: boolean;
  ariaLabel?: string;
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
  size = "default",
  placement = "bottom",
  fullWidth = true,
  hideLabel = false,
  ariaLabel,
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

  const compact = size === "compact";
  const shapeClass = compact
    ? shape === "pill"
      ? "rounded-full px-2.5 py-1.5 text-xs font-medium"
      : "rounded-xl px-3 py-1.5 text-xs"
    : shape === "pill"
      ? "rounded-full px-3 py-2 text-sm font-medium"
      : "rounded-2xl px-4 py-2.5 text-sm";

  return (
    <div ref={rootRef} className={cn("relative", fullWidth && "w-full", className)}>
      {label && !hideLabel && <span className="mb-1 block text-xs text-ink/55">{label}</span>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-label={hideLabel ? ariaLabel ?? label : undefined}
        className={cn(
          "flex items-center justify-between gap-1.5 border border-ink/10 bg-surface text-left outline-none transition focus:border-tech disabled:cursor-not-allowed disabled:opacity-60",
          shapeClass,
          fullWidth && "w-full",
          !fullWidth && compact && "min-w-[4.5rem]",
          buttonClassName,
        )}
      >
        <span className={cn("min-w-0 truncate", !selected && placeholder && "text-ink/55")}>
          {selected?.label ?? placeholder ?? ""}
        </span>
        <ChevronDown
          className={cn(
            "shrink-0 text-ink/40 transition",
            compact ? "h-3.5 w-3.5" : "h-4 w-4",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          className={cn(
            "absolute z-50 overflow-hidden border border-ink/10 bg-card shadow-lift",
            shape === "pill" ? "rounded-2xl" : "rounded-2xl",
            placement === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
            fullWidth ? "w-full min-w-[10rem]" : compact ? "min-w-[5.5rem]" : "min-w-[10rem]",
          )}
        >
          <div className={cn("overflow-y-auto p-1", compact ? "max-h-44" : "max-h-60")}>
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
                    "flex w-full items-center justify-between gap-2 rounded-xl text-left transition hover:bg-surface",
                    compact ? "px-2.5 py-2 text-xs" : "px-3 py-2.5 text-sm",
                    isSelected && "bg-tech/10 font-semibold text-tech",
                  )}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  {isSelected && <Check className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
