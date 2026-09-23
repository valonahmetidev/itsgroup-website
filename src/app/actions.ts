"use server";

import { unstable_noStore as noStore } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { productHref } from "@/lib/catalog";
import { liveSearchProducts } from "@/lib/catalog-live";
import { customerDivisionLabel } from "@/lib/division-display";
import { deleteCustomProduct, insertCustomProduct, listCustomProducts, type D1Database } from "@/lib/db";
import { getServerI18n } from "@/lib/i18n/server";

function getDb(): D1Database | null {
  try {
    const { env } = getCloudflareContext();
    return (env as { DB?: D1Database }).DB ?? null;
  } catch {
    return null;
  }
}

export async function findProducts(query: string) {
  noStore();
  const cleaned = query.trim();
  if (cleaned.length < 2) return [];

  const { locale, dict } = await getServerI18n();
  const matches = await liveSearchProducts(cleaned, undefined, locale);

  return matches
    .slice(0, 12)
    .map((product) => ({
      key: `${product.source}-${product.id}`,
      href: productHref(product),
      name: product.name,
      priceMkd: product.price,
      division: customerDivisionLabel(product.source, locale, dict),
      image: product.image,
      inStock: product.inStock,
    }));
}

export async function fetchCustomProducts() {
  const db = getDb();
  if (!db) return { ok: false as const, products: [] as Awaited<ReturnType<typeof listCustomProducts>> };
  const products = await listCustomProducts(db);
  return { ok: true as const, products };
}

export async function createCustomProduct(input: { name: string; price: number | null; note: string }) {
  const db = getDb();
  if (!db) return { ok: false as const, error: "database_unavailable" };
  const name = input.name.trim();
  if (!name) return { ok: false as const, error: "invalid_name" };

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await insertCustomProduct(db, {
    id,
    name,
    price: input.price != null && input.price > 0 ? Math.round(input.price) : null,
    note: input.note.trim() || null,
    createdAt,
  });

  return {
    ok: true as const,
    product: { id, name, price: input.price, note: input.note.trim() || null, created_at: createdAt },
  };
}

export async function removeCustomProduct(id: string) {
  const db = getDb();
  if (!db) return { ok: false as const, error: "database_unavailable" };
  await deleteCustomProduct(db, id);
  return { ok: true as const };
}
