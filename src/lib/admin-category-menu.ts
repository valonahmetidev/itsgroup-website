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

export type AdminMenuCategoryFlatEntry = { node: AdminMenuCategoryNode; depth: number };

export function flattenAdminCategoryMenuWithDepth(groups: AdminMenuCategoryGroup[]) {
  const flat: AdminMenuCategoryFlatEntry[] = [];
  function walk(node: AdminMenuCategoryNode, depth: number) {
    flat.push({ node, depth });
    for (const child of node.children) walk(child, depth + 1);
  }
  for (const group of groups) {
    for (const column of group.columns) walk(column, 0);
  }
  return flat;
}
