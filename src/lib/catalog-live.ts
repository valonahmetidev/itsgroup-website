import { unstable_cache } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";
import {
  counts as staticCounts,
  featuredProducts as baseFeaturedProducts,
  getProduct as baseGetProduct,
  products as baseProducts,
  productsInCategory,
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
import { buildBalancedHeroShots } from "@/lib/hero-shots";
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

/** Shared public catalog. Callers must not read cookies around this. */
export function publicCatalog() {
  return cachedPublicCatalog("mk")();
}

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

async function loadPublicCategoryProducts(source: CatalogSource, id: number) {
  const ctx = await cachedOverrideContext();
  const { subtree, products: candidates } = collectCategoryBaseCandidates(source, id, ctx);
  const withOverrides = applyOverridesToList(candidates, "mk", ctx);
  return filterLiveCategoryProducts(withOverrides, source, id, subtree);
}

/**
 * Public category lists are cached and shared by every visitor.
 * Customer discounts are applied in the browser, so this path never reads cookies.
 */
export function liveProductsInCategory(source: CatalogSource, id: number) {
  return unstable_cache(
    () => loadPublicCategoryProducts(source, id),
    ["category-products", source, String(id)],
    { revalidate: CATALOG_CACHE_SECONDS, tags: ["catalog"] },
  )();
}

function withPublicOverrides(list: Product[], ctx: CatalogOverrideContext) {
  return applyOverridesToList(list, "mk", ctx);
}

async function loadPublicHome() {
  const ctx = await cachedOverrideContext();
  const store = await loadStoreProducts("mk");
  const staticTotals = staticCounts();
  const totals = {
    ...staticTotals,
    its: store.length,
    technology: staticTotals.technology - staticTotals.its + store.length,
  };

  const techPool = withPublicOverrides(baseFeaturedProducts("treco", 24), ctx);
  const homePool = withPublicOverrides(baseFeaturedProducts("tremark", 24), ctx);
  const cablePool = withPublicOverrides(baseFeaturedProducts("alevado", 24), ctx);

  return {
    totals,
    techFeatured: techPool.slice(0, 8),
    homeFeatured: homePool.slice(0, 8),
    alevadoFeatured: cablePool.slice(0, 8),
    itsFeatured: store.slice(0, 8),
    shots: buildBalancedHeroShots({
      treco: techPool,
      tremark: homePool,
      alevado: cablePool,
      its: store.slice(0, 24),
    }),
  };
}

async function loadPublicTotals() {
  const store = await loadStoreProducts("mk");
  const staticTotals = staticCounts();
  return {
    ...staticTotals,
    its: store.length,
    technology: staticTotals.technology - staticTotals.its + store.length,
  };
}

/** Counts for division pages without cloning the catalog. */
export function publicCatalogTotals() {
  return unstable_cache(loadPublicTotals, ["public-totals"], {
    revalidate: CATALOG_CACHE_SECONDS,
    tags: ["catalog"],
  })();
}

async function loadPublicProductPage(source: string, id: string) {
  if (source === "its") {
    const store = await loadStoreProducts("mk");
    const product = store.find((item) => String(item.id) === id);
    const related = store.filter((item) => String(item.id) !== id).slice(0, 4);
    return { product, related };
  }

  const base = baseGetProduct(source, id);
  if (!base) return { product: undefined, related: [] as Product[] };

  const categoryId = base.categories[0]?.id;
  const pool =
    categoryId != null ? productsInCategory(base.source, categoryId) : baseFeaturedProducts(base.source, 8);
  const relatedBase = pool.filter((item) => String(item.id) !== String(base.id)).slice(0, 4);
  const ctx = await cachedOverrideContext();
  const visible = withPublicOverrides([base, ...relatedBase], ctx);
  return {
    product: visible.find((item) => String(item.id) === String(base.id)),
    related: visible.filter((item) => String(item.id) !== String(base.id)),
  };
}

/** One product plus a few related rows. Does not load the rest of the catalog. */
export function publicProductPage(source: string, id: string) {
  return unstable_cache(() => loadPublicProductPage(source, id), ["public-product", source, id], {
    revalidate: CATALOG_CACHE_SECONDS,
    tags: ["catalog"],
  })();
}

/** One shared homepage payload. Never reads cookies or copies the full catalog. */
export function publicHomeData() {
  return unstable_cache(loadPublicHome, ["public-home"], {
    revalidate: CATALOG_CACHE_SECONDS,
    tags: ["catalog"],
  })();
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
