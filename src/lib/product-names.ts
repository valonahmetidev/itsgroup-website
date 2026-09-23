import type { Locale } from "@/lib/i18n";

export type ProductNames = {
  mk: string;
  en?: string | null;
  sq?: string | null;
};

export function resolveProductName(names: ProductNames | undefined, fallback: string, locale: Locale) {
  if (!names) return fallback;
  if (locale === "en" && names.en?.trim()) return names.en.trim();
  if (locale === "sq" && names.sq?.trim()) return names.sq.trim();
  return names.mk?.trim() || fallback;
}

export function namesFromOverride(input: {
  name?: string | null;
  name_mk?: string | null;
  name_en?: string | null;
  name_sq?: string | null;
}) {
  const mk = input.name_mk?.trim() || input.name?.trim() || "";
  const en = input.name_en?.trim() || null;
  const sq = input.name_sq?.trim() || null;
  if (!mk && !en && !sq) return undefined;
  return { mk: mk || en || sq || "", en, sq };
}
