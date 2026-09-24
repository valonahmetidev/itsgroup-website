import { sourceToCatalogDivision } from "@/lib/divisions";
import type { Source } from "@/lib/types";

export function categoryHref(category: { source: Source; id: number }) {
  const division = sourceToCatalogDivision(category.source);
  return `/kategorija/${division}/${category.id}`;
}

export function productHref(product: { source: Source; id: number | string }) {
  return `/proizvod/${product.id}`;
}
