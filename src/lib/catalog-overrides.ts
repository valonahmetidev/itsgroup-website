import type { Locale } from "@/lib/i18n";
import { namesFromOverride, resolveProductName } from "@/lib/product-names";
import { normalizeProductUnit, type ProductUnit } from "@/lib/units";
import type { Product, CatalogSource } from "@/lib/types";
import type { D1Database } from "@/lib/db";

export type ProductOverrideRow = {
  source: CatalogSource;
  product_id: number;
  name: string | null;
  name_mk: string | null;
  name_en: string | null;
  name_sq: string | null;
  image_url: string | null;
  price: number | null;
  regular_price: number | null;
  in_stock: number | null;
  hidden: number;
  unit: string | null;
  updated_at: string;
};

const overrideColumns =
  "source, product_id, name, name_mk, name_en, name_sq, image_url, price, regular_price, in_stock, hidden, unit, updated_at";

const legacyOverrideColumns =
  "source, product_id, name, price, regular_price, in_stock, hidden, updated_at";

type LegacyProductOverrideRow = Omit<ProductOverrideRow, "name_mk" | "name_en" | "name_sq" | "image_url">;

function toOverrideRow(row: LegacyProductOverrideRow): ProductOverrideRow {
  return {
    ...row,
    name_mk: null,
    name_en: null,
    name_sq: null,
    image_url: null,
    unit: null,
  };
}

async function queryAllOverrides(db: D1Database) {
  try {
    const { results } = await db
      .prepare(`SELECT ${overrideColumns} FROM product_overrides ORDER BY updated_at DESC`)
      .bind()
      .all<ProductOverrideRow>();
    return results;
  } catch {
    const { results } = await db
      .prepare(`SELECT ${legacyOverrideColumns} FROM product_overrides ORDER BY updated_at DESC`)
      .bind()
      .all<LegacyProductOverrideRow>();
    return results.map(toOverrideRow);
  }
}

async function queryOneOverride(db: D1Database, source: CatalogSource, productId: number) {
  try {
    return db
      .prepare(`SELECT ${overrideColumns} FROM product_overrides WHERE source = ? AND product_id = ?`)
      .bind(source, productId)
      .first<ProductOverrideRow>();
  } catch {
    const row = await db
      .prepare(`SELECT ${legacyOverrideColumns} FROM product_overrides WHERE source = ? AND product_id = ?`)
      .bind(source, productId)
      .first<LegacyProductOverrideRow>();
    return row ? toOverrideRow(row) : null;
  }
}

export async function listProductOverrides(db: D1Database) {
  return queryAllOverrides(db);
}

export async function getProductOverride(db: D1Database, source: CatalogSource, productId: number) {
  return queryOneOverride(db, source, productId);
}

export async function upsertProductOverride(
  db: D1Database,
  input: {
    source: CatalogSource;
    productId: number;
    nameMk: string | null;
    nameEn: string | null;
    nameSq: string | null;
    imageUrl: string | null;
    price: number | null;
    regularPrice: number | null;
    stockQuantity: number | null;
    hidden: boolean;
    unit: ProductUnit | null;
  },
) {
  const legacyName = input.nameMk;
  await db
    .prepare(
      `INSERT INTO product_overrides (source, product_id, name, name_mk, name_en, name_sq, image_url, price, regular_price, in_stock, hidden, unit, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(source, product_id) DO UPDATE SET
         name = excluded.name,
         name_mk = excluded.name_mk,
         name_en = excluded.name_en,
         name_sq = excluded.name_sq,
         image_url = excluded.image_url,
         price = excluded.price,
         regular_price = excluded.regular_price,
         in_stock = excluded.in_stock,
         hidden = excluded.hidden,
         unit = excluded.unit,
         updated_at = excluded.updated_at`,
    )
    .bind(
      input.source,
      input.productId,
      legacyName,
      input.nameMk,
      input.nameEn,
      input.nameSq,
      input.imageUrl,
      input.price,
      input.regularPrice,
      input.stockQuantity,
      input.hidden ? 1 : 0,
      input.unit,
      new Date().toISOString(),
    )
    .run();
}

export async function deleteProductOverride(db: D1Database, source: CatalogSource, productId: number) {
  await db.prepare("DELETE FROM product_overrides WHERE source = ? AND product_id = ?").bind(source, productId).run();
}

export function applyProductOverride(
  product: Product,
  override?: ProductOverrideRow | null,
  locale?: Locale,
  options?: { forAdmin?: boolean },
): Product | null {
  if (override?.hidden && !options?.forAdmin) return null;
  if (!override) return product;

  const price = override.price ?? product.price;
  const regularPrice = override.regular_price ?? product.regularPrice;
  const onSale = price != null && regularPrice != null && price < regularPrice;
  const names = namesFromOverride(override) ?? product.names;
  const name = locale ? resolveProductName(names, product.name, locale) : resolveProductName(names, product.name, "mk");
  const image = override.image_url?.trim() || product.image;

  const unit = override.unit ? normalizeProductUnit(override.unit) : undefined;

  return {
    ...product,
    name,
    names,
    image,
    price,
    regularPrice,
    onSale,
    inStock: override.in_stock === null ? product.inStock : override.in_stock > 0,
    stockQuantity: override.in_stock === null ? product.stockQuantity : override.in_stock,
    unit,
  };
}

export async function getOverrideMap(db: D1Database) {
  try {
    const rows = await queryAllOverrides(db);
    const map = new Map<string, ProductOverrideRow>();
    for (const row of rows) {
      map.set(`${row.source}-${row.product_id}`, row);
    }
    return map;
  } catch {
    return new Map<string, ProductOverrideRow>();
  }
}
