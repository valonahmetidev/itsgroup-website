import type { Locale } from "@/lib/i18n";
import type { D1Database } from "@/lib/db";
import { namesFromOverride, resolveProductName } from "@/lib/product-names";
import type { ProductNames } from "@/lib/product-names";

export type StoreCategoryRow = {
  id: string;
  name_mk: string;
  name_en: string | null;
  name_sq: string | null;
  slug: string;
  parent_id: string | null;
  hidden: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const storeCategoryColumns =
  "id, name_mk, name_en, name_sq, slug, parent_id, hidden, sort_order, created_at, updated_at";

export function storeCategoryNames(row: StoreCategoryRow): ProductNames {
  return (
    namesFromOverride({
      name_mk: row.name_mk,
      name_en: row.name_en,
      name_sq: row.name_sq,
    }) ?? { mk: row.name_mk }
  );
}

export function storeCategoryLabel(row: StoreCategoryRow, locale: Locale) {
  const names = storeCategoryNames(row);
  return resolveProductName(names, row.name_mk, locale);
}

export function slugifyStoreCategory(input: string) {
  const base = input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "category";
}

export async function listStoreCategories(db: D1Database, includeHidden = true) {
  try {
    const sql = includeHidden
      ? `SELECT ${storeCategoryColumns} FROM store_categories ORDER BY sort_order ASC, name_mk ASC`
      : `SELECT ${storeCategoryColumns} FROM store_categories WHERE hidden = 0 ORDER BY sort_order ASC, name_mk ASC`;
    const { results } = await db.prepare(sql).bind().all<StoreCategoryRow>();
    return results;
  } catch {
    return [] as StoreCategoryRow[];
  }
}

export async function getStoreCategory(db: D1Database, id: string) {
  try {
    return db
      .prepare(`SELECT ${storeCategoryColumns} FROM store_categories WHERE id = ?`)
      .bind(id)
      .first<StoreCategoryRow>();
  } catch {
    return null;
  }
}

export async function getStoreCategoryBySlug(db: D1Database, slug: string) {
  try {
    return db
      .prepare(`SELECT ${storeCategoryColumns} FROM store_categories WHERE slug = ?`)
      .bind(slug)
      .first<StoreCategoryRow>();
  } catch {
    return null;
  }
}

export async function insertStoreCategory(
  db: D1Database,
  input: {
    id: string;
    nameMk: string;
    nameEn: string | null;
    nameSq: string | null;
    slug: string;
    parentId: string | null;
    hidden: boolean;
    sortOrder: number;
    createdAt: string;
  },
) {
  await db
    .prepare(
      `INSERT INTO store_categories (id, name_mk, name_en, name_sq, slug, parent_id, hidden, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.nameMk,
      input.nameEn,
      input.nameSq,
      input.slug,
      input.parentId,
      input.hidden ? 1 : 0,
      input.sortOrder,
      input.createdAt,
      input.createdAt,
    )
    .run();
}

export async function updateStoreCategory(
  db: D1Database,
  input: {
    id: string;
    nameMk: string;
    nameEn: string | null;
    nameSq: string | null;
    slug: string;
    parentId: string | null;
    hidden: boolean;
    sortOrder: number;
  },
) {
  await db
    .prepare(
      `UPDATE store_categories SET
         name_mk = ?,
         name_en = ?,
         name_sq = ?,
         slug = ?,
         parent_id = ?,
         hidden = ?,
         sort_order = ?,
         updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      input.nameMk,
      input.nameEn,
      input.nameSq,
      input.slug,
      input.parentId,
      input.hidden ? 1 : 0,
      input.sortOrder,
      new Date().toISOString(),
      input.id,
    )
    .run();
}

export async function deleteStoreCategory(db: D1Database, id: string) {
  await db.prepare("UPDATE custom_products SET category_id = NULL WHERE category_id = ?").bind(id).run();
  await db.prepare("UPDATE store_categories SET parent_id = NULL WHERE parent_id = ?").bind(id).run();
  await db.prepare("DELETE FROM store_categories WHERE id = ?").bind(id).run();
}

export async function countStoreCategoryChildren(db: D1Database, id: string) {
  const row = await db
    .prepare("SELECT COUNT(*) AS count FROM store_categories WHERE parent_id = ?")
    .bind(id)
    .first<{ count: number }>();
  return row?.count ?? 0;
}

export async function storeCategoryProductCounts(db: D1Database) {
  const map = new Map<string, number>();
  try {
    const { results } = await db
      .prepare(
        "SELECT category_id, COUNT(*) AS count FROM custom_products WHERE category_id IS NOT NULL GROUP BY category_id",
      )
      .bind()
      .all<{ category_id: string; count: number }>();
    for (const row of results) {
      map.set(row.category_id, row.count);
    }
  } catch {
    // category_id column may be missing before migration
  }
  return map;
}

export async function countStoreProductsInCategory(db: D1Database, id: string) {
  try {
    const row = await db
      .prepare("SELECT COUNT(*) AS count FROM custom_products WHERE category_id = ?")
      .bind(id)
      .first<{ count: number }>();
    return row?.count ?? 0;
  } catch {
    return 0;
  }
}

export type StoreCategoryTreeNode = StoreCategoryRow & {
  children: StoreCategoryTreeNode[];
  productCount: number;
};

export function buildStoreCategoryTree(
  rows: StoreCategoryRow[],
  productCounts: Map<string, number>,
): StoreCategoryTreeNode[] {
  const nodes = new Map<string, StoreCategoryTreeNode>();
  for (const row of rows) {
    nodes.set(row.id, {
      ...row,
      children: [],
      productCount: productCounts.get(row.id) ?? 0,
    });
  }
  const roots: StoreCategoryTreeNode[] = [];
  for (const node of nodes.values()) {
    if (node.parent_id && nodes.has(node.parent_id)) {
      nodes.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortNodes = (list: StoreCategoryTreeNode[]) => {
    list.sort((a, b) => a.sort_order - b.sort_order || a.name_mk.localeCompare(b.name_mk, "mk"));
    for (const child of list) sortNodes(child.children);
  };
  sortNodes(roots);
  return roots;
}

export type StoreCategoryFlatEntry = { node: StoreCategoryTreeNode; depth: number };

export function flattenStoreCategoryTree(tree: StoreCategoryTreeNode[], depth = 0): StoreCategoryFlatEntry[] {
  const out: StoreCategoryFlatEntry[] = [];
  for (const node of tree) {
    out.push({ node, depth });
    out.push(...flattenStoreCategoryTree(node.children, depth + 1));
  }
  return out;
}
