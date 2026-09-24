import type { CategoryOverrideRow } from "@/lib/catalog-category-overrides";
import type { CatalogSource } from "@/lib/types";

export type AdminMenuCategoryNode = {
  id: number;
  source: CatalogSource;
  slug: string;
  name: string;
  parent: number;
  productCount: number;
  override: CategoryOverrideRow | null;
  children: AdminMenuCategoryNode[];
};

export type AdminMenuCategoryGroup = {
  key: string;
  title: string;
  columns: AdminMenuCategoryNode[];
};

export function flattenAdminCategoryMenu(groups: AdminMenuCategoryGroup[]) {
  const flat: AdminMenuCategoryNode[] = [];
  function walk(node: AdminMenuCategoryNode) {
    flat.push(node);
    for (const child of node.children) walk(child);
  }
  for (const group of groups) {
    for (const column of group.columns) walk(column);
  }
  return flat;
}
