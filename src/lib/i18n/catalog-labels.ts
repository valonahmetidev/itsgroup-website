import { useLocale } from "@/components/LocaleProvider";
import { categorySlugKey, categoryTranslations } from "@/lib/i18n/category-names";
import type { Locale } from "@/lib/i18n/types";
import type { Source } from "@/lib/types";

export type CategoryLabelInput = {
  source: Source;
  slug: string;
  name?: string;
  title?: string;
};

function categoryRawName(category: CategoryLabelInput) {
  return category.name ?? category.title ?? "";
}

export function categoryDisplayName(category: CategoryLabelInput, locale: Locale) {
  const label = categoryTranslations[categorySlugKey(category.source, category.slug)];
  if (label) {
    if (label[locale]) return label[locale];
    if (locale === "mk") return label.mk;
    if (locale === "sq") return label.sq;
    return label.en;
  }

  const rawName = categoryRawName(category);
  if (!rawName) return "";

  if (locale === "mk" && /[\u0400-\u04FF]/.test(rawName)) return rawName;
  if (locale === "sq" && /[ëçËÇ]/.test(rawName)) return rawName;
  if (locale === "en" && /^[\x00-\x7F]+$/.test(rawName) && !/^(Pasjisje|Aksesorë)\b/i.test(rawName)) {
    return rawName;
  }

  return rawName;
}

export function withCategoryDisplayName<T extends CategoryLabelInput>(category: T, locale: Locale) {
  return {
    ...category,
    name: categoryDisplayName(category, locale),
  };
}

export function useCategoryLabel() {
  const { locale } = useLocale();
  return (category: CategoryLabelInput) => categoryDisplayName(category, locale);
}
