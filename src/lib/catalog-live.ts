import { unstable_cache } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";
import {
  counts as staticCounts,
  featuredProducts as baseFeaturedProducts,
  getProduct as baseGetProduct,
  products as baseProducts,
} from "@/lib/catalog";
import {
  collectCategoryBaseCandidates,
  filterLiveCategoryProducts,
} from "@/lib/catalog-category-candidates";
import { applyProductCategoryAssignment } from "@/lib/catalog-category-overrides";
import { loadCatalogOverrideContext, type CatalogOverrideContext } from "@/lib/catalog-override-context";
import { applyProductOverride, getProductOverride } from "@/lib/catalog-overrides";
import { buildCatalogTotals, type CatalogTotals } from "@/lib/catalog-counts";
import { filterCatalogByDivision } from "@/lib/catalog-filters";
import type { CatalogDivision } from "@/lib/divisions";
import { getCustomerSessionId } from "@/lib/customer-auth";
import { applyCustomerPricing, applyCustomerPricingList } from "@/lib/customer-pricing";
import { loadCustomerPricing, type CustomerPricing } from "@/lib/customers";
import { getDbAsync } from "@/lib/cloudflare";
import type { Locale } from "@/lib/i18n";
import { searchAndRankProducts } from "@/lib/product-search";
import { getStoreProductAsCatalog, loadStoreProducts } from "@/lib/store-products";
import type { CatalogSource, Product, Source } from "@/lib/types";

const CATALOG_CACHE_SECONDS = 120;

const cachedOverrideContext = unstable_cache(
  () => loadCatalogOverrideContext(),
  ["catalog-override-ctx"],
  { revalidate: CATALOG_CACHE_SECONDS, tags: ["catalog"] },
);

async function overrideContextForRequest(personalized: boolean) {
  return personalized ? loadCatalogOverrideContext() : cachedOverrideContext();
}

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

function applyOverridesToList(list: Product[], locale: Locale, ctx: CatalogOverrideContext) {
  const result: Product[] = [];
  for (const product of list) {
    const override = ctx.productOverrides.get(`${product.source}-${product.id}`);
    let next = applyProductOverride(product, override, locale);
    if (!next) continue;
    const assignment =
      typeof product.id === "number"
        ? ctx.categoryAssignments.get(`${product.source}-${product.id}`)
        : undefined;
    next = applyProductCategoryAssignment(next, assignment, ctx.categoryOverrides);
    const image = next.image || override?.image_url || null;
    result.push({ ...next, image });
  }
  return result;
}

async function mergeStoreCatalog(catalog: Product[], locale: Locale) {
  const store = await loadStoreProducts(locale);
  if (store.length === 0) return catalog;

  const seen = new Set(catalog.map((product) => `${product.source}-${product.id}`));
  const merged = [...catalog];
  for (const product of store) {
    const key = `${product.source}-${product.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(product);
  }
  return merged;
}

async function buildPublicCatalog(locale: Locale) {
  const ctx = await cachedOverrideContext();
  const catalog = applyOverridesToList(baseProducts, locale, ctx);
  return mergeStoreCatalog(catalog, locale);
}

const cachedPublicCatalog = (locale: Locale) =>
  unstable_cache(() => buildPublicCatalog(locale), ["live-catalog", locale], {
    revalidate: CATALOG_CACHE_SECONDS,
    tags: ["catalog"],
  });

async function buildPersonalizedCatalog(locale: Locale) {
  const ctx = await loadCatalogOverrideContext();
  const catalog = applyOverridesToList(baseProducts, locale, ctx);
  return mergeStoreCatalog(catalog, locale);
}

function finalizeProducts(products: Product[], pricing: CustomerPricing | null) {
  return applyCustomerPricingList(products, pricing);
}

export async function liveProducts(locale: Locale = "mk") {
  const pricing = await getCustomerPricing();
  const base = pricing
    ? await (async () => {
        noStore();
        return buildPersonalizedCatalog(locale);
      })()
    : await cachedPublicCatalog(locale)();
  return finalizeProducts(base, pricing);
}

export async function liveSearchProducts(
  query: string,
  division: CatalogDivision | "all" = "all",
  locale: Locale = "mk",
) {
  const cleaned = query.trim();
  if (!cleaned) {
    const products = await liveProducts(locale);
    return filterCatalogByDivision(products, division);
  }

  const pricing = await getCustomerPricing();
  if (pricing) noStore();

  const ctx = await overrideContextForRequest(Boolean(pricing));
  const catalogScoped = filterCatalogByDivision(baseProducts, division);
  const catalogMatches = searchAndRankProducts(catalogScoped, cleaned, locale);
  const catalog = finalizeProducts(applyOverridesToList(catalogMatches, locale, ctx), pricing);

  const storeRows = await loadStoreProducts(locale);
  const storeScoped = filterCatalogByDivision(storeRows, division);

  if (division === "its") {
    const store = finalizeProducts(storeScoped, pricing);
    return searchAndRankProducts(store, cleaned, locale);
  }

  const storeMatches = searchAndRankProducts(finalizeProducts(storeScoped, pricing), cleaned, locale);

  const seen = new Set<string>();
  const merged: Product[] = [];
  for (const product of [...storeMatches, ...catalog]) {
    const key = `${product.source}-${product.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(product);
  }
  return merged;
}

export async function liveCatalogTotals(locale: Locale = "mk"): Promise<CatalogTotals> {
  const live = await liveProducts(locale);
  const itsCount = live.filter((product) => product.source === "its").length;
  return buildCatalogTotals(live, staticCounts().categories, itsCount);
}

export async function liveProductsInCategory(source: CatalogSource, id: number, locale: Locale = "mk") {
  const pricing = await getCustomerPricing();
  if (pricing) noStore();

  const ctx = await overrideContextForRequest(Boolean(pricing));
  const { subtree, products: candidates } = collectCategoryBaseCandidates(source, id, ctx);
  const withOverrides = applyOverridesToList(candidates, locale, ctx);
  const inCategory = filterLiveCategoryProducts(withOverrides, source, id, subtree);
  return finalizeProducts(inCategory, pricing);
}

export async function liveGetProduct(source: string, id: string | number, locale: Locale = "mk") {
  const pricing = await getCustomerPricing();
  if (pricing) noStore();

  if (source === "its") {
    const product = await getStoreProductAsCatalog(String(id), locale);
    return product ? applyCustomerPricing(product, pricing) : undefined;
  }

  const product = baseGetProduct(source, id);
  if (!product) return undefined;

  const db = await getDbAsync();
  if (!db || typeof product.id !== "number") {
    return applyCustomerPricing(product, pricing);
  }

  const ctx = await loadCatalogOverrideContext();
  const override = await getProductOverride(db, product.source as CatalogSource, product.id);
  let next = applyProductOverride(product, override, locale);
  if (!next) return undefined;
  const assignment = ctx.categoryAssignments.get(`${product.source}-${product.id}`);
  next = applyProductCategoryAssignment(next, assignment, ctx.categoryOverrides);
  const image = next.image || override?.image_url || null;
  return applyCustomerPricing({ ...next, image }, pricing);
}

export async function liveFeaturedProducts(source: Source, limit: number, locale: Locale = "mk") {
  const pricing = await getCustomerPricing();
  if (pricing) noStore();

  if (source === "its") {
    const store = await loadStoreProducts(locale);
    return finalizeProducts(store.slice(0, limit), pricing);
  }

  const ctx = await overrideContextForRequest(Boolean(pricing));
  const pool = applyOverridesToList(baseFeaturedProducts(source, limit * 3), locale, ctx);
  return finalizeProducts(pool.slice(0, limit), pricing);
}

export async function liveStoreProducts(locale: Locale = "mk", limit = 12) {
  const pricing = await getCustomerPricing();
  if (pricing) noStore();
  const store = await loadStoreProducts(locale);
  return finalizeProducts(store.slice(0, limit), pricing);
}
