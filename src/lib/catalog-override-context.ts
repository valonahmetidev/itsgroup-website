import {
  getCategoryOverrideMap,
  getProductCategoryOverrideMap,
  type CategoryOverrideRow,
  type ProductCategoryOverrideRow,
} from "@/lib/catalog-category-overrides";
import { getOverrideMap, type ProductOverrideRow } from "@/lib/catalog-overrides";
import { getDbAsync } from "@/lib/cloudflare";

export type CatalogOverrideContext = {
  productOverrides: Map<string, ProductOverrideRow>;
  categoryOverrides: Map<string, CategoryOverrideRow>;
  categoryAssignments: Map<string, ProductCategoryOverrideRow>;
};

const emptyContext: CatalogOverrideContext = {
  productOverrides: new Map(),
  categoryOverrides: new Map(),
  categoryAssignments: new Map(),
};

export async function loadCatalogOverrideContext(): Promise<CatalogOverrideContext> {
  const db = await getDbAsync();
  if (!db) return emptyContext;

  const [productOverrides, categoryOverrides, categoryAssignments] = await Promise.all([
    getOverrideMap(db),
    getCategoryOverrideMap(db),
    getProductCategoryOverrideMap(db),
  ]);

  return { productOverrides, categoryOverrides, categoryAssignments };
}
