import { getDb } from "@/lib/cloudflare";
import type { D1Database } from "@/lib/db";

const MAX_BYTES = 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type MediaAssetRow = {
  id: string;
  content_type: string;
  data: string;
  size: number;
  created_at: string;
};

export function mediaPublicUrl(id: string) {
  return `/api/media/${id}`;
}

export async function insertMediaAsset(
  db: D1Database,
  input: { id: string; contentType: string; data: string; size: number; createdAt: string },
) {
  await db
    .prepare("INSERT INTO media_assets (id, content_type, data, size, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(input.id, input.contentType, input.data, input.size, input.createdAt)
    .run();
}

export async function getMediaAsset(db: D1Database, id: string) {
  return db
    .prepare("SELECT id, content_type, data, size, created_at FROM media_assets WHERE id = ?")
    .bind(id)
    .first<MediaAssetRow>();
}

export async function uploadProductImage(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false as const, error: "invalid_type" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false as const, error: "too_large" };
  }

  const db = getDb();
  if (!db) {
    return { ok: false as const, error: "storage_unavailable" };
  }

  const bytes = await file.arrayBuffer();
  const data = Buffer.from(bytes).toString("base64");
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await insertMediaAsset(db, {
    id,
    contentType: file.type,
    data,
    size: file.size,
    createdAt,
  });

  return { ok: true as const, url: mediaPublicUrl(id) };
}

export function decodeMediaAsset(row: MediaAssetRow) {
  return Buffer.from(row.data, "base64");
}
