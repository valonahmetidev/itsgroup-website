"use server";

import { getAdminSecret, isAdminAuthenticated } from "@/lib/admin-auth";
import {
  applyProductOverride,
  deleteProductOverride,
  getOverrideMap,
  getProductOverride,
  upsertProductOverride,
  type ProductOverrideRow,
} from "@/lib/catalog-overrides";
import { getProduct, products, searchProducts } from "@/lib/catalog";
import { getDb } from "@/lib/cloudflare";
import {
  deleteStoreProduct,
  getStoreProduct,
  insertStoreProduct,
  listAllStoreProducts,
  updateStoreProduct,
  type StoreProductRow,
} from "@/lib/db";
import {
  deleteCustomer,
  deleteCustomerProductDiscount,
  getCustomerById,
  insertCustomer,
  listCustomerProductDiscounts,
  listCustomers,
  updateCustomer,
  upsertCustomerProductDiscount,
  type CustomerProductDiscountRow,
  type CustomerRow,
} from "@/lib/customers";
import { uploadProductImage } from "@/lib/media";
import { getAuthSecret, hashPassword } from "@/lib/password";
import { normalizeSearchText, parseSearchTerms } from "@/lib/product-search";
import { storeRowToProduct } from "@/lib/store-products";
import { parseAdminUnit } from "@/lib/units";
import type { Product, CatalogSource, Source } from "@/lib/types";
import type { D1Database } from "@/lib/db";

export type AdminProductListItem = {
  source: Source;
  id: number | string;
  name: string;
  price: number | null;
  inStock: boolean;
  stockQuantity?: number | null;
  image: string | null;
  category: { source: CatalogSource; slug: string; name: string } | null;
};

export type AdminBrowseResult = {
  items: AdminProductListItem[];
  hasMore: boolean;
  total: number;
};

export type AdminCategoryFilter = { source: Source; slug: string } | null;

export type CustomerDiscountView = CustomerProductDiscountRow & {
  productName: string;
  image: string | null;
  price: number | null;
  inStock: boolean;
};

const BROWSE_PAGE_SIZE = 24;

function storeRowHaystack(row: StoreProductRow) {
  return normalizeSearchText(
    [row.name, row.name_mk, row.name_en, row.name_sq, row.note, row.id].filter(Boolean).join(" "),
  );
}

function storeRowMatchesQuery(row: StoreProductRow, query: string) {
  const terms = parseSearchTerms(query);
  if (!terms.length) return false;
  const haystack = storeRowHaystack(row);
  return terms.every((term) => haystack.includes(term));
}

async function searchAdminStoreProducts(db: D1Database, query: string) {
  const rows = await listAllStoreProducts(db, 1000);
  return rows.filter((row) => storeRowMatchesQuery(row, query)).map(toAdminStoreItem);
}

function mergeAdminProductItems(storeItems: AdminProductListItem[], catalogItems: AdminProductListItem[]) {
  const seen = new Set<string>();
  const merged: AdminProductListItem[] = [];
  for (const item of [...storeItems, ...catalogItems]) {
    const key = `${item.source}-${item.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
}

async function resolveDiscountProductDetails(db: D1Database, row: CustomerProductDiscountRow) {
  if (row.source === "its") {
    const store = await getStoreProduct(db, row.product_id);
    if (store) {
      const product = storeRowToProduct(store, "mk");
      return {
        productName: product.name,
        image: product.image,
        price: product.price,
        inStock: product.inStock,
      };
    }
    return { productName: row.product_id, image: null, price: null, inStock: true };
  }

  const product = getProduct(row.source, Number(row.product_id));
  if (product) {
    const override = await getProductOverride(db, product.source as CatalogSource, product.id as number);
    const effective = applyProductOverride(product, override, "mk");
    const display = effective ?? product;
    return {
      productName: display.name,
      image: display.image,
      price: display.price,
      inStock: display.inStock,
    };
  }

  return {
    productName: `${row.source} / ${row.product_id}`,
    image: null,
    price: null,
    inStock: true,
  };
}

function matchesCategory(item: AdminProductListItem, category: AdminCategoryFilter) {
  if (!category) return true;
  return item.category?.source === category.source && item.category?.slug === category.slug;
}

function filterByCategory(items: AdminProductListItem[], category: AdminCategoryFilter) {
  if (!category) return items;
  return items.filter((item) => matchesCategory(item, category));
}

function parseOverrideKey(key: string) {
  const match = key.match(/^(treco|tremark)-(\d+)$/);
  if (!match) return null;
  return { source: match[1] as CatalogSource, productId: Number(match[2]) };
}

async function listEditedCatalogItems(
  source: Source | "all",
  category: AdminCategoryFilter,
  map: Map<string, ProductOverrideRow>,
) {
  const items: AdminProductListItem[] = [];

  for (const [key, override] of map) {
    const parsed = parseOverrideKey(key);
    if (!parsed) continue;
    if (source !== "all" && parsed.source !== source) continue;

    const product = getProduct(parsed.source, parsed.productId);
    if (!product) continue;

    const effective = applyProductOverride(product, override, "mk", { forAdmin: true });
    const item = toAdminCatalogItem(product, effective);
    if (!matchesCategory(item, category)) continue;
    items.push(item);
  }

  return items.sort((a, b) => a.name.localeCompare(b.name, "mk"));
}

function filterEditedOnly(items: AdminProductListItem[], map: Map<string, unknown>) {
  return items.filter((item) => item.source !== "its" && map.has(`${item.source}-${item.id}`));
}

function toAdminCatalogItem(product: Product, effective?: Product | null): AdminProductListItem {
  const display = effective ?? product;
  const category = product.categories[0];
  return {
    source: product.source,
    id: product.id,
    name: display.name,
    price: display.price,
    inStock: display.inStock,
    stockQuantity: display.stockQuantity,
    image: display.image,
    category: category
      ? { source: product.source as CatalogSource, slug: category.slug, name: category.name }
      : null,
  };
}

function toAdminStoreItem(row: StoreProductRow): AdminProductListItem {
  const product = storeRowToProduct(row, "mk");
  return {
    source: "its",
    id: row.id,
    name: product.name,
    price: product.price,
    inStock: product.inStock,
    image: product.image,
    category: null,
  };
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("unauthorized");
  }
}

export async function adminBrowseProducts(
  source: Source | "all" = "all",
  offset = 0,
  limit = BROWSE_PAGE_SIZE,
  category: AdminCategoryFilter = null,
  editedOnly = false,
): Promise<AdminBrowseResult> {
  await requireAdmin();
  const db = getDb();
  const map = db ? await getOverrideMap(db) : new Map();

  if (editedOnly) {
    const merged = db ? await listEditedCatalogItems(source, category, map) : [];
    const items = merged.slice(offset, offset + limit);
    return {
      items,
      hasMore: offset + limit < merged.length,
      total: merged.length,
    };
  }

  if (source === "its") {
    if (!db) return { items: [], hasMore: false, total: 0 };
    const all = filterByCategory((await listAllStoreProducts(db, 1000)).map(toAdminStoreItem), category);
    const slice = all.slice(offset, offset + limit);
    return {
      items: slice,
      hasMore: offset + limit < all.length,
      total: all.length,
    };
  }

  const pool = source === "all" ? products : products.filter((product) => product.source === source);

  const catalogItems = pool.map((product) => {
    const override = map.get(`${product.source}-${product.id}`);
    const effective = applyProductOverride(product, override);
    return toAdminCatalogItem(product, effective);
  });

  const storeItems = source === "all" && db ? (await listAllStoreProducts(db, 1000)).map(toAdminStoreItem) : [];
  const merged = filterByCategory(mergeAdminProductItems(storeItems, catalogItems), category);
  const items = merged.slice(offset, offset + limit);

  return {
    items,
    hasMore: offset + limit < merged.length,
    total: merged.length,
  };
}

export async function adminSearchProducts(
  query: string,
  source: Source | "all" = "all",
  offset = 0,
  limit = 40,
  category: AdminCategoryFilter = null,
  editedOnly = false,
): Promise<AdminBrowseResult> {
  await requireAdmin();
  const cleaned = query.trim();
  if (cleaned.length < 2) {
    return { items: [], hasMore: false, total: 0 };
  }

  const db = getDb();
  const map = db ? await getOverrideMap(db) : new Map();

  if (source === "its") {
    if (!db) return { items: [], hasMore: false, total: 0 };
    let all = filterByCategory(await searchAdminStoreProducts(db, cleaned), category);
    if (editedOnly) {
      all = [];
    }
    const slice = all.slice(offset, offset + limit);
    return {
      items: slice,
      hasMore: offset + limit < all.length,
      total: all.length,
    };
  }

  const scopedSource = source === "all" ? undefined : source;
  const pool = searchProducts(cleaned, scopedSource);
  const catalogItems = pool.map((product) => {
    const override = map.get(`${product.source}-${product.id}`);
    const effective = applyProductOverride(product, override);
    return toAdminCatalogItem(product, effective);
  });

  const storeItems = source === "all" && db ? await searchAdminStoreProducts(db, cleaned) : [];
  let merged = filterByCategory(mergeAdminProductItems(storeItems, catalogItems), category);
  if (editedOnly) {
    merged = filterEditedOnly(merged, map);
  }
  const items = merged.slice(offset, offset + limit);

  return {
    items,
    hasMore: offset + limit < merged.length,
    total: merged.length,
  };
}

export async function adminGetProduct(source: string, id: string) {
  await requireAdmin();
  if (source === "its") return null;

  const product = getProduct(source, Number(id));
  if (!product) return null;
  const db = getDb();
  const override = db
    ? await getProductOverride(db, product.source as CatalogSource, product.id as number)
    : null;
  const effective = applyProductOverride(product, override);
  return {
    product,
    override,
    effective,
  };
}

export async function adminGetStoreProduct(id: string) {
  await requireAdmin();
  const db = getDb();
  if (!db) return null;
  const row = await getStoreProduct(db, id);
  if (!row) return null;
  return { row, product: storeRowToProduct(row, "mk") };
}

export async function adminSaveProduct(input: {
  source: CatalogSource;
  productId: number;
  nameMk: string;
  nameEn: string;
  nameSq: string;
  excerptMk: string;
  excerptEn: string;
  excerptSq: string;
  imageUrl: string;
  price: string;
  regularPrice: string;
  stock: string;
  hidden: boolean;
  unit: string;
  reset: boolean;
}) {
  await requireAdmin();
  const db = getDb();
  if (!db) return { ok: false as const, error: "database_unavailable" };

  if (input.reset) {
    await deleteProductOverride(db, input.source, input.productId);
    return { ok: true as const };
  }

  const price = input.price.trim() ? Math.max(0, Math.round(Number(input.price))) : null;
  const regularPrice = input.regularPrice.trim() ? Math.max(0, Math.round(Number(input.regularPrice))) : null;
  const stockTrimmed = input.stock.trim();
  const stockQuantity =
    stockTrimmed === ""
      ? null
      : Number.isFinite(Number(stockTrimmed))
        ? Math.max(0, Math.round(Number(stockTrimmed)))
        : null;
  const nameMk = input.nameMk.trim() || null;
  const nameEn = input.nameEn.trim() || null;
  const nameSq = input.nameSq.trim() || null;
  const excerptMk = input.excerptMk.trim() || null;
  const excerptEn = input.excerptEn.trim() || null;
  const excerptSq = input.excerptSq.trim() || null;
  const imageUrl = input.imageUrl.trim() || null;

  await upsertProductOverride(db, {
    source: input.source,
    productId: input.productId,
    nameMk,
    nameEn,
    nameSq,
    excerptMk,
    excerptEn,
    excerptSq,
    imageUrl,
    price: Number.isFinite(price) ? price : null,
    regularPrice: Number.isFinite(regularPrice) ? regularPrice : null,
    stockQuantity,
    hidden: input.hidden,
    unit: parseAdminUnit(input.unit),
  });

  return { ok: true as const };
}

export async function adminSaveStoreProduct(input: {
  id?: string;
  nameMk: string;
  nameEn: string;
  nameSq: string;
  imageUrl: string;
  price: string;
  regularPrice: string;
  note: string;
  inStock: boolean;
  hidden: boolean;
  unit: string;
}) {
  await requireAdmin();
  const db = getDb();
  if (!db) return { ok: false as const, error: "database_unavailable" };

  const nameMk = input.nameMk.trim();
  if (!nameMk) return { ok: false as const, error: "invalid_name" };

  const price = input.price.trim() ? Math.max(0, Math.round(Number(input.price))) : null;
  const regularPrice = input.regularPrice.trim() ? Math.max(0, Math.round(Number(input.regularPrice))) : null;
  const imageUrl = input.imageUrl.trim() || null;
  const note = input.note.trim() || null;
  const nameEn = input.nameEn.trim() || null;
  const nameSq = input.nameSq.trim() || null;
  const unit = parseAdminUnit(input.unit);

  if (input.id) {
    await updateStoreProduct(db, {
      id: input.id,
      nameMk,
      nameEn,
      nameSq,
      price: Number.isFinite(price) ? price : null,
      regularPrice: Number.isFinite(regularPrice) ? regularPrice : null,
      note,
      imageUrl,
      inStock: input.inStock,
      hidden: input.hidden,
      unit,
    });
    return { ok: true as const, id: input.id };
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await insertStoreProduct(db, {
    id,
    nameMk,
    nameEn,
    nameSq,
    price: Number.isFinite(price) ? price : null,
    regularPrice: Number.isFinite(regularPrice) ? regularPrice : null,
    note,
    imageUrl,
    inStock: input.inStock,
    hidden: input.hidden,
    unit,
    createdAt,
  });
  return { ok: true as const, id };
}

export async function adminDeleteStoreProduct(id: string) {
  await requireAdmin();
  const db = getDb();
  if (!db) return { ok: false as const, error: "database_unavailable" };
  await deleteStoreProduct(db, id);
  return { ok: true as const };
}

export async function adminListStoreProducts() {
  await requireAdmin();
  const db = getDb();
  if (!db) return [] as StoreProductRow[];
  return listAllStoreProducts(db);
}

export async function adminUploadImage(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false as const, error: "no_file" };
  }
  return uploadProductImage(file);
}

export async function adminStats() {
  await requireAdmin();
  const db = getDb();
  const overrides = db ? await getOverrideMap(db) : new Map();
  const store = db ? await listAllStoreProducts(db) : [];
  const customers = db ? await listCustomers(db) : [];
  return {
    catalogCount: products.length,
    overrideCount: overrides.size,
    customCount: store.length,
    storeCount: store.length,
    customerCount: customers.length,
    databaseReady: Boolean(db),
  };
}

/** @deprecated Use adminListStoreProducts */
export async function adminListCustomProducts() {
  return adminListStoreProducts();
}

/** @deprecated Use adminSaveStoreProduct */
export async function adminCreateCustomProduct(input: { name: string; price: string; note: string }) {
  return adminSaveStoreProduct({
    nameMk: input.name,
    nameEn: "",
    nameSq: "",
    imageUrl: "",
    price: input.price,
    regularPrice: "",
    note: input.note,
    inStock: true,
    hidden: false,
    unit: "",
  });
}

/** @deprecated Use adminDeleteStoreProduct */
export async function adminDeleteCustomProduct(id: string) {
  return adminDeleteStoreProduct(id);
}

function parseDiscount(value: string) {
  if (!value.trim()) return null;
  const parsed = Math.round(Number(value));
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) return null;
  return parsed;
}

export async function adminListCustomers() {
  await requireAdmin();
  const db = getDb();
  if (!db) return [] as CustomerRow[];
  try {
    return await listCustomers(db);
  } catch {
    return [];
  }
}

export async function adminGetCustomer(id: string) {
  await requireAdmin();
  const db = getDb();
  if (!db) return null;
  try {
    const customer = await getCustomerById(db, id);
    if (!customer) return null;
    const rows = await listCustomerProductDiscounts(db, id);
    const discounts: CustomerDiscountView[] = await Promise.all(
      rows.map(async (row) => ({
        ...row,
        ...(await resolveDiscountProductDetails(db, row)),
      })),
    );
    return { customer, discounts };
  } catch {
    return null;
  }
}

export async function adminSaveCustomer(input: {
  id?: string;
  name: string;
  email: string;
  password: string;
  generalDiscount: string;
  active: boolean;
}) {
  await requireAdmin();
  const db = getDb();
  const secret = getAuthSecret();
  if (!db || !secret) return { ok: false as const, error: "database_unavailable" };

  const name = input.name.trim();
  const email = input.email.trim();
  if (!name || !email) return { ok: false as const, error: "invalid_input" };
  const discountPercent = parseDiscount(input.generalDiscount);

  if (input.id) {
    const passwordHash = input.password.trim() ? hashPassword(input.password, secret) : undefined;
    await updateCustomer(db, {
      id: input.id,
      email,
      name,
      passwordHash,
      discountPercent,
      active: input.active,
    });
    return { ok: true as const, id: input.id };
  }

  if (!input.password.trim()) return { ok: false as const, error: "password_required" };
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await insertCustomer(db, {
    id,
    email,
    passwordHash: hashPassword(input.password, secret),
    name,
    discountPercent,
    active: input.active,
    createdAt,
  });
  return { ok: true as const, id };
}

export async function adminDeleteCustomer(id: string) {
  await requireAdmin();
  const db = getDb();
  if (!db) return { ok: false as const, error: "database_unavailable" };
  await deleteCustomer(db, id);
  return { ok: true as const };
}

export async function adminSaveCustomerProductDiscount(input: {
  customerId: string;
  source: Source;
  productId: string;
  discountPercent: string;
}) {
  await requireAdmin();
  const db = getDb();
  if (!db) return { ok: false as const, error: "database_unavailable" };
  const percent = parseDiscount(input.discountPercent);
  if (percent == null) return { ok: false as const, error: "invalid_discount" };
  await upsertCustomerProductDiscount(db, {
    customerId: input.customerId,
    source: input.source,
    productId: input.productId,
    discountPercent: percent,
  });
  return { ok: true as const };
}

export async function adminSaveCustomerProductDiscounts(input: {
  customerId: string;
  discountPercent: string;
  items: { source: Source; productId: string }[];
}) {
  await requireAdmin();
  const db = getDb();
  if (!db) return { ok: false as const, error: "database_unavailable" };
  const percent = parseDiscount(input.discountPercent);
  if (percent == null) return { ok: false as const, error: "invalid_discount" };
  if (input.items.length === 0) return { ok: false as const, error: "empty_selection" };

  for (const item of input.items) {
    await upsertCustomerProductDiscount(db, {
      customerId: input.customerId,
      source: item.source,
      productId: item.productId,
      discountPercent: percent,
    });
  }

  return { ok: true as const, count: input.items.length };
}

export async function adminRemoveCustomerProductDiscount(input: {
  customerId: string;
  source: Source;
  productId: string;
}) {
  await requireAdmin();
  const db = getDb();
  if (!db) return { ok: false as const, error: "database_unavailable" };
  await deleteCustomerProductDiscount(db, input.customerId, input.source, input.productId);
  return { ok: true as const };
}

export type { CustomerProductDiscountRow, CustomerRow };
