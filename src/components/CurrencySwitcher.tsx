"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { cn } from "@/lib/cn";
import { DISPLAY_CURRENCIES, type DisplayCurrency } from "@/lib/currency";

const labels: Record<DisplayCurrency, string> = {
  MKD: "MKD",
  EUR: "€",
  USD: "$",
  CHF: "CHF",
};

export function CurrencySwitcher({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      className={cn(
        "flex items-center rounded-full border border-ink/10 bg-surface",
        compact ? "p-1" : "p-1.5",
        className,
      )}
      role="group"
      aria-label="Currency"
    >
      {DISPLAY_CURRENCIES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setCurrency(code)}
          className={cn(
            "rounded-full font-semibold transition",
            compact ? "px-2 py-1 text-xs leading-none" : "px-2.5 py-1.5 text-xs leading-none",
            currency === code ? "bg-ink text-paper" : "text-ink/55 hover:text-ink",
          )}
          aria-pressed={currency === code}
          title={code}
        >
          {labels[code]}
        </button>
      ))}
    </div>
  );
}
