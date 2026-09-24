import { categories, getCategory } from "@/lib/catalog";
import type { D1Database } from "@/lib/db";
import type { CatalogSource, Product } from "@/lib/types";

export type CategoryOverrideRow = {
  source: CatalogSource;
  category_id: number;
  name_mk: string | null;
  name_en: string | null;
  name_sq: string | null;
  slug: string | null;
  parent_id: number | null;
  hidden: number;
  updated_at: string;
};

export type ProductCategoryOverrideRow = {
  source: CatalogSource;
  product_id: number;
  category_id: number;
  updated_at: string;
};

const categoryOverrideColumns =
  "source, category_id, name_mk, name_en, name_sq, slug, parent_id, hidden, updated_at";

export async function getCategoryOverrideMap(db: D1Database) {
  const map = new Map<string, CategoryOverrideRow>();
  try {
    const { results } = await db
      .prepare(`SELECT ${categoryOverrideColumns} FROM category_overrides`)
      .bind()
      .all<CategoryOverrideRow>();
    for (const row of results) {
      map.set(`${row.source}:${row.category_id}`, row);
    }
  } catch {
    return map;
  }
  return map;
}

export async function getProductCategoryOverrideMap(db: D1Database) {
  const map = new Map<string, ProductCategoryOverrideRow>();
  try {
    const { results } = await db
      .prepare("SELECT source, product_id, category_id, updated_at FROM product_category_overrides")
      .bind()
      .all<ProductCategoryOverrideRow>();
    for (const row of results) {
      map.set(`${row.source}:${row.product_id}`, row);
    }
  } catch {
    return map;
  }
  return map;
}

export function resolveCategoryName(
  category: { id: number; source: CatalogSource; name: string; slug: string },
  overrides: Map<string, CategoryOverrideRow>,
  locale: "mk" | "en" | "sq" = "mk",
) {
  const row = overrides.get(`${category.source}:${category.id}`);
  if (!row) return category.name;
  if (locale === "en" && row.name_en?.trim()) return row.name_en.trim();
  if (locale === "sq" && row.name_sq?.trim()) return row.name_sq.trim();
  if (row.name_mk?.trim()) return row.name_mk.trim();
  return category.name;
}

export function applyCategoryOverridesToList(
  list: typeof categories,
  overrides: Map<string, CategoryOverrideRow>,
) {
  return list.map((category) => {
    const row = overrides.get(`${category.source}:${category.id}`);
    if (!row) return category;
    return {
      ...category,
      name: row.name_mk?.trim() || category.name,
      slug: row.slug?.trim() || category.slug,
      parent: row.parent_id ?? category.parent,
      hidden: row.hidden === 1,
    };
  });
}

export function applyProductCategoryAssignment(
  product: Product,
  assignment: ProductCategoryOverrideRow | undefined,
  categoryOverrides: Map<string, CategoryOverrideRow>,
): Product {
  if (!assignment) return product;
  const category = getCategory(assignment.source, assignment.category_id);
  if (!category) return product;
  const name = resolveCategoryName(
    { ...category, source: category.source as CatalogSource },
    categoryOverrides,
    "mk",
  );
  return {
    ...product,
    categories: [{ id: category.id, name, slug: category.slug }],
  };
}

export function productMatchesCategory(
  product: Product,
  assignment: ProductCategoryOverrideRow | undefined,
  filter: { source: CatalogSource; categoryId: number },
) {
  if (product.source !== filter.source) return false;
  const categoryId = assignment?.category_id ?? product.categories[0]?.id;
  return categoryId === filter.categoryId;
}

export async function upsertCategoryOverride(
  db: D1Database,
  input: {
    source: CatalogSource;
    categoryId: number;
    nameMk: string | null;
    nameEn: string | null;
    nameSq: string | null;
    slug: string | null;
    parentId: number | null;
    hidden: boolean;
  },
) {
  const updatedAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO category_overrides (
        source, category_id, name_mk, name_en, name_sq, slug, parent_id, hidden, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source, category_id) DO UPDATE SET
        name_mk = excluded.name_mk,
        name_en = excluded.name_en,
        name_sq = excluded.name_sq,
        slug = excluded.slug,
        parent_id = excluded.parent_id,
        hidden = excluded.hidden,
        updated_at = excluded.updated_at`,
    )
    .bind(
      input.source,
      input.categoryId,
      input.nameMk,
      input.nameEn,
      input.nameSq,
      input.slug,
      input.parentId,
      input.hidden ? 1 : 0,
      updatedAt,
    )
    .run();
}

export async function deleteCategoryOverride(db: D1Database, source: CatalogSource, categoryId: number) {
  await db.prepare("DELETE FROM category_overrides WHERE source = ? AND category_id = ?").bind(source, categoryId).run();
}

export async function upsertProductCategoryOverride(
  db: D1Database,
  input: { source: CatalogSource; productId: number; categoryId: number },
) {
  const updatedAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO product_category_overrides (source, product_id, category_id, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(source, product_id) DO UPDATE SET category_id = excluded.category_id, updated_at = excluded.updated_at`,
    )
    .bind(input.source, input.productId, input.categoryId, updatedAt)
    .run();
}

export async function deleteProductCategoryOverride(db: D1Database, source: CatalogSource, productId: number) {
  await db
    .prepare("DELETE FROM product_category_overrides WHERE source = ? AND product_id = ?")
    .bind(source, productId)
    .run();
}
