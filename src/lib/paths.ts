import type { Source } from "@/lib/types";

export function categoryHref(category: { source: Source; id: number }) {
  return `/kategorija/${category.source}/${category.id}`;
}

export function productHref(product: { source: Source; id: number }) {
  return `/proizvod/${product.source}/${product.id}`;
}
