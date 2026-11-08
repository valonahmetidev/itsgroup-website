import type { D1Database } from "@/lib/db";
import { listStoreCategories } from "@/lib/store-categories";
import type { Source } from "@/lib/types";

export type CustomerRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  discount_percent: number | null;
  active: number;
  created_at: string;
  updated_at: string;
};

export type CustomerProductDiscountRow = {
  customer_id: string;
  source: string;
  product_id: string;
  discount_percent: number;
};

export type CustomerCategoryDiscountRow = {
  customer_id: string;
  source: string;
  category_id: string;
  discount_percent: number;
};

const customerColumns = "id, email, password_hash, name, discount_percent, active, created_at, updated_at";

export async function listCustomers(db: D1Database, limit = 200) {
  const { results } = await db
    .prepare(`SELECT ${customerColumns} FROM customers ORDER BY created_at DESC LIMIT ?`)
    .bind(limit)
    .all<CustomerRow>();
  return results;
}

export async function getCustomerById(db: D1Database, id: string) {
  return db.prepare(`SELECT ${customerColumns} FROM customers WHERE id = ?`).bind(id).first<CustomerRow>();
}

export async function getCustomerByEmail(db: D1Database, email: string) {
  return db
    .prepare(`SELECT ${customerColumns} FROM customers WHERE lower(email) = lower(?)`)
    .bind(email.trim())
    .first<CustomerRow>();
}

export async function insertCustomer(
  db: D1Database,
  input: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    discountPercent: number | null;
    active: boolean;
    createdAt: string;
  },
) {
  await db
    .prepare(
      `INSERT INTO customers (id, email, password_hash, name, discount_percent, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.email.trim().toLowerCase(),
      input.passwordHash,
      input.name.trim(),
      input.discountPercent,
      input.active ? 1 : 0,
      input.createdAt,
      input.createdAt,
    )
    .run();
}

export async function updateCustomer(
  db: D1Database,
  input: {
    id: string;
    email: string;
    passwordHash?: string;
    name: string;
    discountPercent: number | null;
    active: boolean;
  },
) {
  const updatedAt = new Date().toISOString();
  if (input.passwordHash) {
    await db
      .prepare(
        `UPDATE customers SET email = ?, password_hash = ?, name = ?, discount_percent = ?, active = ?, updated_at = ? WHERE id = ?`,
      )
      .bind(
        input.email.trim().toLowerCase(),
        input.passwordHash,
        input.name.trim(),
        input.discountPercent,
        input.active ? 1 : 0,
        updatedAt,
        input.id,
      )
      .run();
    return;
  }

  await db
    .prepare(`UPDATE customers SET email = ?, name = ?, discount_percent = ?, active = ?, updated_at = ? WHERE id = ?`)
    .bind(input.email.trim().toLowerCase(), input.name.trim(), input.discountPercent, input.active ? 1 : 0, updatedAt, input.id)
    .run();
}

export async function deleteCustomer(db: D1Database, id: string) {
  await db.prepare("DELETE FROM customer_product_discounts WHERE customer_id = ?").bind(id).run();
  try {
    await db.prepare("DELETE FROM customer_category_discounts WHERE customer_id = ?").bind(id).run();
  } catch {
    // Table may be missing before migration 0014.
  }
  await db.prepare("DELETE FROM customers WHERE id = ?").bind(id).run();
}

export async function listCustomerProductDiscounts(db: D1Database, customerId: string) {
  const { results } = await db
    .prepare(
      "SELECT customer_id, source, product_id, discount_percent FROM customer_product_discounts WHERE customer_id = ? ORDER BY source, product_id",
    )
    .bind(customerId)
    .all<CustomerProductDiscountRow>();
  return results;
}

export async function upsertCustomerProductDiscount(
  db: D1Database,
  input: { customerId: string; source: Source; productId: string; discountPercent: number },
) {
  await db
    .prepare(
      `INSERT INTO customer_product_discounts (customer_id, source, product_id, discount_percent)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(customer_id, source, product_id) DO UPDATE SET discount_percent = excluded.discount_percent`,
    )
    .bind(input.customerId, input.source, input.productId, input.discountPercent)
    .run();
}

export async function deleteCustomerProductDiscount(
  db: D1Database,
  customerId: string,
  source: Source,
  productId: string,
) {
  await db
    .prepare("DELETE FROM customer_product_discounts WHERE customer_id = ? AND source = ? AND product_id = ?")
    .bind(customerId, source, productId)
    .run();
}

export async function listCustomerCategoryDiscounts(db: D1Database, customerId: string) {
  try {
    const { results } = await db
      .prepare(
        "SELECT customer_id, source, category_id, discount_percent FROM customer_category_discounts WHERE customer_id = ? ORDER BY source, category_id",
      )
      .bind(customerId)
      .all<CustomerCategoryDiscountRow>();
    return results;
  } catch {
    return [] as CustomerCategoryDiscountRow[];
  }
}

export async function upsertCustomerCategoryDiscount(
  db: D1Database,
  input: { customerId: string; source: Source; categoryId: string; discountPercent: number },
) {
  await db
    .prepare(
      `INSERT INTO customer_category_discounts (customer_id, source, category_id, discount_percent)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(customer_id, source, category_id) DO UPDATE SET discount_percent = excluded.discount_percent`,
    )
    .bind(input.customerId, input.source, input.categoryId, input.discountPercent)
    .run();
}

export async function deleteCustomerCategoryDiscount(
  db: D1Database,
  customerId: string,
  source: Source,
  categoryId: string,
) {
  await db
    .prepare("DELETE FROM customer_category_discounts WHERE customer_id = ? AND source = ? AND category_id = ?")
    .bind(customerId, source, categoryId)
    .run();
}

export function productDiscountKey(source: Source, productId: string | number) {
  return `${source}:${String(productId)}`;
}

export function categoryDiscountKey(source: Source, categoryId: string | number) {
  return `${source}:${String(categoryId)}`;
}

export type CustomerPricing = {
  customerId: string;
  generalDiscountPercent: number | null;
  productDiscounts: Map<string, number>;
  categoryDiscounts: Map<string, number>;
};

function storeCategoryDepth(parentById: Map<string, string | null>, id: string) {
  let depth = 0;
  const seen = new Set<string>();
  let current: string | null | undefined = id;
  while (current && !seen.has(current)) {
    seen.add(current);
    current = parentById.get(current) ?? null;
    if (current) depth += 1;
  }
  return depth;
}

function storeCategoryDescendants(childrenByParent: Map<string, string[]>, id: string) {
  const ids = [id];
  const queue = [id];
  const seen = new Set<string>([id]);
  while (queue.length > 0) {
    const current = queue.pop()!;
    for (const child of childrenByParent.get(current) ?? []) {
      if (seen.has(child)) continue;
      seen.add(child);
      ids.push(child);
      queue.push(child);
    }
  }
  return ids;
}

/** Copy parent ITS discounts onto descendant store categories, keeping the deepest match. */
export function expandItsCategoryDiscounts(
  categoryDiscounts: Map<string, number>,
  storeCategories: { id: string; parent_id: string | null }[],
) {
  const itsDiscounts: { id: string; percent: number; depth: number }[] = [];
  const parentById = new Map(storeCategories.map((row) => [row.id, row.parent_id]));
  const childrenByParent = new Map<string, string[]>();
  for (const row of storeCategories) {
    if (!row.parent_id) continue;
    const list = childrenByParent.get(row.parent_id) ?? [];
    list.push(row.id);
    childrenByParent.set(row.parent_id, list);
  }

  for (const [key, percent] of categoryDiscounts) {
    if (!key.startsWith("its:")) continue;
    const id = key.slice(4);
    itsDiscounts.push({ id, percent, depth: storeCategoryDepth(parentById, id) });
  }

  if (itsDiscounts.length === 0) return categoryDiscounts;

  const expanded = new Map(categoryDiscounts);
  itsDiscounts.sort((a, b) => b.depth - a.depth);
  const assigned = new Set<string>();
  for (const discount of itsDiscounts) {
    for (const id of storeCategoryDescendants(childrenByParent, discount.id)) {
      const key = categoryDiscountKey("its", id);
      if (assigned.has(key)) continue;
      expanded.set(key, discount.percent);
      assigned.add(key);
    }
  }
  return expanded;
}

export async function loadCustomerPricing(db: D1Database, customerId: string): Promise<CustomerPricing | null> {
  const customer = await getCustomerById(db, customerId);
  if (!customer || customer.active !== 1) return null;

  const rows = await listCustomerProductDiscounts(db, customerId);
  const productDiscounts = new Map<string, number>();
  for (const row of rows) {
    productDiscounts.set(`${row.source}:${row.product_id}`, row.discount_percent);
  }

  const categoryRows = await listCustomerCategoryDiscounts(db, customerId);
  let categoryDiscounts = new Map<string, number>();
  for (const row of categoryRows) {
    categoryDiscounts.set(categoryDiscountKey(row.source as Source, row.category_id), row.discount_percent);
  }

  if ([...categoryDiscounts.keys()].some((key) => key.startsWith("its:"))) {
    const storeCategories = await listStoreCategories(db, true);
    categoryDiscounts = expandItsCategoryDiscounts(
      categoryDiscounts,
      storeCategories.map((row) => ({ id: row.id, parent_id: row.parent_id })),
    );
  }

  return {
    customerId,
    generalDiscountPercent: customer.discount_percent,
    productDiscounts,
    categoryDiscounts,
  };
}
