"use client";

import { useLocale } from "@/components/LocaleProvider";
import { resolveProductName, type ProductNames } from "@/lib/product-names";

type NamedProduct = {
  name: string;
  names?: ProductNames;
};

export function useProductName(product: NamedProduct) {
  const { locale } = useLocale();
  return resolveProductName(product.names, product.name, locale);
}

export function useResolvedName(name: string, names?: ProductNames) {
  const { locale } = useLocale();
  return resolveProductName(names, name, locale);
}
