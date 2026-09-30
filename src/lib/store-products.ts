import type { Locale } from "@/lib/i18n";
import { getDbAsync } from "@/lib/cloudflare";
import { getStoreProduct, listStoreProducts, type StoreProductRow } from "@/lib/db";
import { excerptsFromOverride, resolveProductName } from "@/lib/product-names";
import { parseProductTags } from "@/lib/product-tags";
import { normalizeProductUnit } from "@/lib/units";
import type { Product } from "@/lib/types";

function rowToProduct(row: StoreProductRow, locale: Locale): Product {
  const names = {
    mk: row.name_mk?.trim() || row.name,
    en: row.name_en,
    sq: row.name_sq,
  };
  const price = row.price;
  const regularPrice = row.regular_price;
  const onSale = price != null && regularPrice != null && price < regularPrice;
  const excerpts = excerptsFromOverride({
    excerpt_mk: row.note,
    excerpt_en: row.excerpt_en,
    excerpt_sq: row.excerpt_sq,
  });
  const excerptFallback = row.note?.trim() || "";

  return {
    id: row.id,
    source: "its",
    name: resolveProductName(names, row.name, locale),
    names,
    slug: row.id,
    price,
    regularPrice,
    onSale,
    currency: "MKD",
    image: row.image_url,
    inStock: row.in_stock === 1,
    categories: [],
    excerpt: excerpts ? resolveProductName(excerpts, excerptFallback, locale) : excerptFallback,
    excerpts,
    permalink: `/proizvod/${row.id}`,
    unit: row.unit ? normalizeProductUnit(row.unit) : undefined,
    tags: (() => {
      const tags = parseProductTags(row.tags);
      return tags.length > 0 ? tags : undefined;
    })(),
  };
}

export async function loadStoreProducts(locale: Locale) {
  const db = await getDbAsync();
  if (!db) return [] as Product[];

  try {
    const rows = await listStoreProducts(db);
    return rows.map((row) => rowToProduct(row, locale));
  } catch {
    return [];
  }
}

export async function getStoreProductAsCatalog(id: string, locale: Locale) {
  const db = await getDbAsync();
  if (!db) return undefined;

  const row = await getStoreProduct(db, id);
  if (!row || row.hidden) return undefined;
  return rowToProduct(row, locale);
}

export function storeRowToProduct(row: StoreProductRow, locale: Locale) {
  return rowToProduct(row, locale);
}
