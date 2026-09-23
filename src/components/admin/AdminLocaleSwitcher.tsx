"use client";

import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";

const locales: { value: Locale; labelKey: "langMk" | "langEn" | "langSq" }[] = [
  { value: "mk", labelKey: "langMk" },
  { value: "en", labelKey: "langEn" },
  { value: "sq", labelKey: "langSq" },
];

export function AdminLocaleSwitcher() {
  const { dict, locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1 rounded-full border border-ink/10 bg-surface p-1">
      {locales.map((entry) => (
        <button
          key={entry.value}
          type="button"
          onClick={() => setLocale(entry.value)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide",
            locale === entry.value ? "bg-ink text-paper" : "text-ink/60 hover:text-ink",
          )}
        >
          {dict.admin[entry.labelKey]}
        </button>
      ))}
    </div>
  );
}
