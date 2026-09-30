import type { Locale } from "@/lib/i18n";
import { getDbAsync } from "@/lib/cloudflare";
import { getStoreProduct, listStoreProducts, type StoreProductRow } from "@/lib/db";
import {
  getStoreCategory,
  listStoreCategories,
  storeCategoryLabel,
  type StoreCategoryRow,
} from "@/lib/store-categories";
import { excerptsFromOverride, resolveProductName } from "@/lib/product-names";
import { parseProductTags } from "@/lib/product-tags";
import { normalizeProductUnit } from "@/lib/units";
import type { Product } from "@/lib/types";

function productStoreCategory(
  row: StoreProductRow,
  locale: Locale,
  categoryMap: Map<string, StoreCategoryRow>,
): Product["storeCategory"] {
  if (!row.category_id) return undefined;
  const category = categoryMap.get(row.category_id);
  if (!category || category.hidden) return undefined;
  return { id: category.id, name: storeCategoryLabel(category, locale), slug: category.slug };
}

function rowToProduct(row: StoreProductRow, locale: Locale, categoryMap: Map<string, StoreCategoryRow>): Product {
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
    storeCategory: productStoreCategory(row, locale, categoryMap),
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
    const categories = await listStoreCategories(db, true);
    const categoryMap = new Map(categories.map((row) => [row.id, row]));
    return rows.map((row) => rowToProduct(row, locale, categoryMap));
  } catch {
    return [];
  }
}

export async function getStoreProductAsCatalog(id: string, locale: Locale) {
  const db = await getDbAsync();
  if (!db) return undefined;

  const row = await getStoreProduct(db, id);
  if (!row || row.hidden) return undefined;
  const categoryMap = new Map<string, StoreCategoryRow>();
  if (row.category_id) {
    const category = await getStoreCategory(db, row.category_id);
    if (category) categoryMap.set(category.id, category);
  }
  return rowToProduct(row, locale, categoryMap);
}

export function storeRowToProduct(
  row: StoreProductRow,
  locale: Locale,
  categoryMap: Map<string, StoreCategoryRow> = new Map(),
) {
  return rowToProduct(row, locale, categoryMap);
}
