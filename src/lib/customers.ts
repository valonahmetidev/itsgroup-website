import type { D1Database } from "@/lib/db";
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

export function productDiscountKey(source: Source, productId: string | number) {
  return `${source}:${String(productId)}`;
}

export type CustomerPricing = {
  customerId: string;
  generalDiscountPercent: number | null;
  productDiscounts: Map<string, number>;
};

export async function loadCustomerPricing(db: D1Database, customerId: string): Promise<CustomerPricing | null> {
  const customer = await getCustomerById(db, customerId);
  if (!customer || customer.active !== 1) return null;

  const rows = await listCustomerProductDiscounts(db, customerId);
  const productDiscounts = new Map<string, number>();
  for (const row of rows) {
    productDiscounts.set(`${row.source}:${row.product_id}`, row.discount_percent);
  }

  return {
    customerId,
    generalDiscountPercent: customer.discount_percent,
    productDiscounts,
  };
}
