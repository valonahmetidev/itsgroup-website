import en from "@/lib/i18n/en";
import mk from "@/lib/i18n/mk";
import sq from "@/lib/i18n/sq";
import type { Dictionary, Locale, MenuGroupKey } from "@/lib/i18n/types";

export type { Dictionary, Locale, MenuGroupKey };

export const locales: { code: Locale; label: string }[] = [
  { code: "mk", label: "MK" },
  { code: "sq", label: "SQ" },
  { code: "en", label: "EN" },
];

export const LOCALE_COOKIE = "its-locale";

const dictionaries: Record<Locale, Dictionary> = { mk, sq, en };

export function isLocale(value: string): value is Locale {
  return value === "mk" || value === "sq" || value === "en";
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function fill(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function countLabel(dict: Dictionary, count: number, formatted?: string) {
  if (count === 1) return dict.products.one;
  return fill(dict.products.many, { count: formatted ?? String(count) });
}
