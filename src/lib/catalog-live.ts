import { unstable_noStore as noStore } from "next/cache";
import {
  counts as staticCounts,
  featuredProducts as baseFeaturedProducts,
  getProduct as baseGetProduct,
  products as baseProducts,
} from "@/lib/catalog";
import { buildCatalogTotals, type CatalogTotals } from "@/lib/catalog-counts";
import { filterCatalogByDivision } from "@/lib/catalog-filters";
import type { CatalogDivision } from "@/lib/divisions";
import {
  applyProductCategoryAssignment,
  getCategoryOverrideMap,
  getProductCategoryOverrideMap,
} from "@/lib/catalog-category-overrides";
import { applyProductOverride, getOverrideMap, getProductOverride } from "@/lib/catalog-overrides";
import { getDbAsync } from "@/lib/cloudflare";
import { loadCustomerPricing, type CustomerPricing } from "@/lib/customers";
import { getCustomerSessionId } from "@/lib/customer-auth";
import { applyCustomerPricing, applyCustomerPricingList } from "@/lib/customer-pricing";
import type { Locale } from "@/lib/i18n";
import { searchAndRankProducts } from "@/lib/product-search";
import { getStoreProductAsCatalog, loadStoreProducts } from "@/lib/store-products";
import type { CatalogSource, Product, Source } from "@/lib/types";

async function getCustomerPricing(): Promise<CustomerPricing | null> {
  const customerId = await getCustomerSessionId();
  if (!customerId) return null;
  const db = await getDbAsync();
  if (!db) return null;
  try {
    return await loadCustomerPricing(db, customerId);
  } catch {
    return null;
  }
}

async function applyOverrides(list: Product[], locale: Locale) {
  const db = await getDbAsync();
  const map = db ? await getOverrideMap(db) : new Map();
  const categoryOverrides = db ? await getCategoryOverrideMap(db) : new Map();
  const categoryAssignments = db ? await getProductCategoryOverrideMap(db) : new Map();

  const result: Product[] = [];
  for (const product of list) {
    const override = map.get(`${product.source}-${product.id}`);
    let next = applyProductOverride(product, override, locale);
    if (!next) continue;
    const assignment =
      typeof product.id === "number"
        ? categoryAssignments.get(`${product.source}-${product.id}`)
        : undefined;
    next = applyProductCategoryAssignment(next, assignment, categoryOverrides);
    const image = next.image || override?.image_url;
    if (!image && product.source !== "its" && product.source !== "alevado") continue;
    result.push({ ...next, image });
  }
  return result;
}

async function withStoreProducts(list: Product[], locale: Locale) {
  const store = await loadStoreProducts(locale);
  if (store.length === 0) return list;

  const seen = new Set(list.map((product) => `${product.source}-${product.id}`));
  const merged = [...list];
  for (const product of store) {
    const key = `${product.source}-${product.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(product);
  }
  return merged;
}

async function finalizeProducts(products: Product[], pricing: CustomerPricing | null) {
  return applyCustomerPricingList(products, pricing);
}

export async function liveProducts(locale: Locale = "mk") {
  noStore();
  const pricing = await getCustomerPricing();
  const catalog = await applyOverrides(baseProducts, locale);
  const merged = await withStoreProducts(catalog, locale);
  return finalizeProducts(merged, pricing);
}

export async function liveSearchProducts(
  query: string,
  division: CatalogDivision | "all" = "all",
  locale: Locale = "mk",
) {
  noStore();
  const cleaned = query.trim();
  if (!cleaned) {
    const products = await liveProducts(locale);
    return filterCatalogByDivision(products, division);
  }

  const pricing = await getCustomerPricing();
  const catalog = await finalizeProducts(await applyOverrides(baseProducts, locale), pricing);
  const store = await finalizeProducts(await loadStoreProducts(locale), pricing);

  const catalogScoped = filterCatalogByDivision(catalog, division);
  const storeScoped = filterCatalogByDivision(store, division);

  if (division === "its") {
    return searchAndRankProducts(storeScoped, cleaned, locale);
  }

  const storeMatches = searchAndRankProducts(storeScoped, cleaned, locale);
  const catalogMatches = searchAndRankProducts(catalogScoped, cleaned, locale);

  const seen = new Set<string>();
  const merged: Product[] = [];
  for (const product of [...storeMatches, ...catalogMatches]) {
    const key = `${product.source}-${product.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(product);
  }
  return merged;
}

export async function liveCatalogTotals(locale: Locale = "mk"): Promise<CatalogTotals> {
  noStore();
  const live = await liveProducts(locale);
  const itsCount = live.filter((product) => product.source === "its").length;
  return buildCatalogTotals(live, staticCounts().categories, itsCount);
}

export async function liveProductsInCategory(source: CatalogSource, id: number, locale: Locale = "mk") {
  noStore();
  const pricing = await getCustomerPricing();
  const products = (await liveProducts(locale)).filter(
    (product) => product.source === source && product.categories[0]?.id === id,
  );
  return finalizeProducts(products, pricing);
}

export async function liveGetProduct(source: string, id: string | number, locale: Locale = "mk") {
  noStore();
  const pricing = await getCustomerPricing();

  if (source === "its") {
    const product = await getStoreProductAsCatalog(String(id), locale);
    return product ? applyCustomerPricing(product, pricing) : undefined;
  }

  const product = baseGetProduct(source, id);
  if (!product) return undefined;

  const db = await getDbAsync();
  if (!db || typeof product.id !== "number") {
    return product.image ? applyCustomerPricing(product, pricing) : undefined;
  }

  const override = await getProductOverride(db, product.source as CatalogSource, product.id);
  let next = applyProductOverride(product, override, locale);
  if (!next) return undefined;
  const categoryOverrides = await getCategoryOverrideMap(db);
  const categoryAssignments = await getProductCategoryOverrideMap(db);
  const assignment =
    typeof product.id === "number"
      ? categoryAssignments.get(`${product.source}-${product.id}`)
      : undefined;
  next = applyProductCategoryAssignment(next, assignment, categoryOverrides);
  const image = next.image || override?.image_url || null;
  if (!image && product.source !== "alevado") return undefined;
  return applyCustomerPricing({ ...next, image }, pricing);
}

export async function liveFeaturedProducts(source: Source, limit: number, locale: Locale = "mk") {
  noStore();
  const pricing = await getCustomerPricing();
  if (source === "its") {
    const store = await loadStoreProducts(locale);
    return finalizeProducts(store.slice(0, limit), pricing);
  }
  const pool = await applyOverrides(baseFeaturedProducts(source, limit * 3), locale);
  return finalizeProducts(pool.slice(0, limit), pricing);
}

export async function liveStoreProducts(locale: Locale = "mk", limit = 12) {
  noStore();
  const pricing = await getCustomerPricing();
  const store = await loadStoreProducts(locale);
  return finalizeProducts(store.slice(0, limit), pricing);
}
