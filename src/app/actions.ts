"use server";

import { productHref, searchProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { sourceMeta } from "@/lib/site";

export async function findProducts(query: string) {
  const cleaned = query.trim();
  if (cleaned.length < 2) return [];

  return searchProducts(cleaned)
    .slice(0, 8)
    .map((product) => ({
      href: productHref(product),
      name: product.name,
      price: formatPrice(product.price),
      brand: sourceMeta[product.source].brand,
      image: product.image,
    }));
}
