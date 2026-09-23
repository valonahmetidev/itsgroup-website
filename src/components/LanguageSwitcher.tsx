"use client";

import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import { locales, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { locale, setLocale } = useLocale();

  return (
    <div className={cn("flex items-center rounded-full border border-ink/10 bg-surface", compact ? "p-1" : "p-1.5", className)}>
      {locales.map((entry) => (
        <button
          key={entry.code}
          type="button"
          onClick={() => setLocale(entry.code as Locale)}
          className={cn(
            "rounded-full font-semibold transition",
            compact
              ? "px-2.5 py-1 text-xs leading-none"
              : "px-3 py-1.5 text-sm leading-none",
            locale === entry.code ? "bg-ink text-paper" : "text-ink/55 hover:text-ink",
          )}
          aria-pressed={locale === entry.code}
          title={entry.name}
        >
          <span className="sr-only">{entry.name}</span>
          <span aria-hidden>{compact ? entry.label : entry.name}</span>
        </button>
      ))}
    </div>
  );
}
