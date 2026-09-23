export type StoreProductRow = {
  id: string;
  name: string;
  name_mk: string | null;
  name_en: string | null;
  name_sq: string | null;
  price: number | null;
  regular_price: number | null;
  note: string | null;
  image_url: string | null;
  in_stock: number;
  hidden: number;
  unit: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string | null;
};

/** @deprecated Use StoreProductRow */
export type CustomProductRow = StoreProductRow;

export type D1Database = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      all: <T>() => Promise<{ results: T[] }>;
      run: () => Promise<unknown>;
      first: <T>() => Promise<T | null>;
    };
  };
};

const storeColumns =
  "id, name, name_mk, name_en, name_sq, price, regular_price, note, image_url, in_stock, hidden, unit, tags, created_at, updated_at";

const preTagsStoreColumns =
  "id, name, name_mk, name_en, name_sq, price, regular_price, note, image_url, in_stock, hidden, unit, created_at, updated_at";

const legacyStoreColumns = "id, name, price, note, created_at";

type PreTagsStoreProductRow = Omit<StoreProductRow, "tags">;

type LegacyStoreProductRow = {
  id: string;
  name: string;
  price: number | null;
  note: string | null;
  created_at: string;
};

function toStoreProductRow(row: LegacyStoreProductRow): StoreProductRow {
  return {
    id: row.id,
    name: row.name,
    name_mk: null,
    name_en: null,
    name_sq: null,
    price: row.price,
    regular_price: null,
    note: row.note,
    image_url: null,
    in_stock: 1,
    hidden: 0,
    unit: null,
    tags: null,
    created_at: row.created_at,
    updated_at: null,
  };
}

function withStoreTags(row: PreTagsStoreProductRow | LegacyStoreProductRow): StoreProductRow {
  return {
    name_mk: null,
    name_en: null,
    name_sq: null,
    regular_price: null,
    image_url: null,
    in_stock: 1,
    hidden: 0,
    unit: null,
    tags: null,
    updated_at: null,
    ...row,
  } as StoreProductRow;
}

async function queryStoreProducts(db: D1Database, limit: number, includeHidden: boolean) {
  try {
    const sql = includeHidden
      ? `SELECT ${storeColumns} FROM custom_products ORDER BY updated_at DESC, created_at DESC LIMIT ?`
      : `SELECT ${storeColumns} FROM custom_products WHERE hidden = 0 ORDER BY created_at DESC LIMIT ?`;
    const { results } = await db.prepare(sql).bind(limit).all<StoreProductRow>();
    return results;
  } catch {
    try {
      const sql = includeHidden
        ? `SELECT ${preTagsStoreColumns} FROM custom_products ORDER BY updated_at DESC, created_at DESC LIMIT ?`
        : `SELECT ${preTagsStoreColumns} FROM custom_products WHERE hidden = 0 ORDER BY created_at DESC LIMIT ?`;
      const { results } = await db.prepare(sql).bind(limit).all<PreTagsStoreProductRow>();
      return results.map(withStoreTags);
    } catch {
      const { results } = await db
        .prepare(`SELECT ${legacyStoreColumns} FROM custom_products ORDER BY created_at DESC LIMIT ?`)
        .bind(limit)
        .all<LegacyStoreProductRow>();
      return results.map(toStoreProductRow);
    }
  }
}

export async function listStoreProducts(db: D1Database, limit = 500) {
  return queryStoreProducts(db, limit, false);
}

export async function listAllStoreProducts(db: D1Database, limit = 500) {
  return queryStoreProducts(db, limit, true);
}

export async function getStoreProduct(db: D1Database, id: string) {
  try {
    return db
      .prepare(`SELECT ${storeColumns} FROM custom_products WHERE id = ?`)
      .bind(id)
      .first<StoreProductRow>();
  } catch {
    try {
      const row = await db
        .prepare(`SELECT ${preTagsStoreColumns} FROM custom_products WHERE id = ?`)
        .bind(id)
        .first<PreTagsStoreProductRow>();
      return row ? withStoreTags(row) : null;
    } catch {
      const row = await db
        .prepare(`SELECT ${legacyStoreColumns} FROM custom_products WHERE id = ?`)
        .bind(id)
        .first<LegacyStoreProductRow>();
      return row ? toStoreProductRow(row) : null;
    }
  }
}

export async function insertStoreProduct(
  db: D1Database,
  input: {
    id: string;
    nameMk: string;
    nameEn: string | null;
    nameSq: string | null;
    price: number | null;
    regularPrice: number | null;
    note: string | null;
    imageUrl: string | null;
    inStock: boolean;
    hidden: boolean;
    unit: string | null;
    tags: string | null;
    createdAt: string;
  },
) {
  const updatedAt = input.createdAt;
  await db
    .prepare(
      `INSERT INTO custom_products (id, name, name_mk, name_en, name_sq, price, regular_price, note, image_url, in_stock, hidden, unit, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.nameMk,
      input.nameMk,
      input.nameEn,
      input.nameSq,
      input.price,
      input.regularPrice,
      input.note,
      input.imageUrl,
      input.inStock ? 1 : 0,
      input.hidden ? 1 : 0,
      input.unit,
      input.tags,
      input.createdAt,
      updatedAt,
    )
    .run();
}

export async function updateStoreProduct(
  db: D1Database,
  input: {
    id: string;
    nameMk: string;
    nameEn: string | null;
    nameSq: string | null;
    price: number | null;
    regularPrice: number | null;
    note: string | null;
    imageUrl: string | null;
    inStock: boolean;
    hidden: boolean;
    unit: string | null;
    tags: string | null;
  },
) {
  await db
    .prepare(
      `UPDATE custom_products SET
         name = ?,
         name_mk = ?,
         name_en = ?,
         name_sq = ?,
         price = ?,
         regular_price = ?,
         note = ?,
         image_url = ?,
         in_stock = ?,
         hidden = ?,
         unit = ?,
         tags = ?,
         updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      input.nameMk,
      input.nameMk,
      input.nameEn,
      input.nameSq,
      input.price,
      input.regularPrice,
      input.note,
      input.imageUrl,
      input.inStock ? 1 : 0,
      input.hidden ? 1 : 0,
      input.unit,
      input.tags,
      new Date().toISOString(),
      input.id,
    )
    .run();
}

export async function deleteStoreProduct(db: D1Database, id: string) {
  await db.prepare("DELETE FROM custom_products WHERE id = ?").bind(id).run();
}

/** @deprecated Use listAllStoreProducts */
export async function listCustomProducts(db: D1Database) {
  return listAllStoreProducts(db);
}

/** @deprecated Use insertStoreProduct */
export async function insertCustomProduct(
  db: D1Database,
  input: { id: string; name: string; price: number | null; note: string | null; createdAt: string },
) {
  await insertStoreProduct(db, {
    id: input.id,
    nameMk: input.name,
    nameEn: null,
    nameSq: null,
    price: input.price,
    regularPrice: null,
    note: input.note,
    imageUrl: null,
    inStock: true,
    hidden: false,
    unit: null,
    tags: null,
    createdAt: input.createdAt,
  });
}

/** @deprecated Use deleteStoreProduct */
export async function deleteCustomProduct(db: D1Database, id: string) {
  await deleteStoreProduct(db, id);
}
