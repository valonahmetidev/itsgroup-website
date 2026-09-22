"use client";

import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import { locales, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div className={cn("flex items-center rounded-full border border-ink/10 bg-surface p-0.5", className)}>
      {locales.map((entry) => (
        <button
          key={entry.code}
          type="button"
          onClick={() => setLocale(entry.code as Locale)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide transition",
            locale === entry.code ? "bg-ink text-paper" : "text-ink/55 hover:text-ink",
          )}
          aria-pressed={locale === entry.code}
        >
          {entry.label}
        </button>
      ))}
    </div>
  );
}
