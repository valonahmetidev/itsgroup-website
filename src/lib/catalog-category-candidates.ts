import {
  categorySubtreeIds,
  getProduct,
  productInCategorySubtree,
  productsInCategory,
} from "@/lib/catalog";
import type { CatalogOverrideContext } from "@/lib/catalog-override-context";
import type { CatalogSource, Product } from "@/lib/types";

const CATALOG_SOURCES: CatalogSource[] = ["treco", "tremark", "alevado"];

export function productStorageKey(product: Pick<Product, "source" | "id">) {
  return `${product.source}-${product.id}`;
}

export function parseProductStorageKey(key: string): { source: CatalogSource; id: number } | null {
  for (const source of CATALOG_SOURCES) {
    const prefix = `${source}-`;
    if (!key.startsWith(prefix)) continue;
    const id = Number(key.slice(prefix.length));
    if (Number.isFinite(id)) return { source, id };
  }
  return null;
}

/** Static catalog rows plus D1 category reassignment targets in this subtree. */
export function collectCategoryBaseCandidates(
  source: CatalogSource,
  categoryId: number,
  ctx: CatalogOverrideContext,
) {
  const subtree = categorySubtreeIds(source, categoryId);
  const keys = new Set<string>();

  for (const product of productsInCategory(source, categoryId)) {
    keys.add(productStorageKey(product));
  }

  for (const [key, assignment] of ctx.categoryAssignments) {
    if (assignment.source !== source) continue;
    if (!subtree.has(assignment.category_id)) continue;
    keys.add(key);
  }

  const products: Product[] = [];
  for (const key of keys) {
    const parsed = parseProductStorageKey(key);
    if (!parsed || parsed.source !== source) continue;
    const product = getProduct(parsed.source, parsed.id);
    if (product) products.push(product);
  }

  return { subtree, products };
}

export function filterLiveCategoryProducts(
  products: Product[],
  source: CatalogSource,
  categoryId: number,
  subtree: Set<number>,
) {
  return products.filter((product) => productInCategorySubtree(product, source, categoryId, subtree));
}
