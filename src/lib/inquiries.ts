import type { D1Database } from "@/lib/db";

export type InquiryType = "contact" | "quote";
export type InquiryStatus = "new" | "read";

export type InquiryRow = {
  id: string;
  type: InquiryType;
  status: InquiryStatus;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  message: string | null;
  payload_json: string | null;
  locale: string;
  customer_id: string | null;
  created_at: string;
};

const inquiryColumns =
  "id, type, status, name, phone, email, company, message, payload_json, locale, customer_id, created_at";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export async function countRecentInquiriesByEmail(db: D1Database, email: string) {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS count FROM inquiries
       WHERE lower(email) = lower(?) AND created_at >= ?`,
    )
    .bind(email.trim(), since)
    .first<{ count: number }>();
  return row?.count ?? 0;
}

export async function isInquiryRateLimited(db: D1Database, email: string) {
  const normalized = email.trim();
  if (!normalized) return false;
  const count = await countRecentInquiriesByEmail(db, normalized);
  return count >= RATE_LIMIT_MAX;
}

export async function insertInquiry(
  db: D1Database,
  input: {
    id: string;
    type: InquiryType;
    name: string;
    phone?: string | null;
    email?: string | null;
    company?: string | null;
    message?: string | null;
    payloadJson?: string | null;
    locale: string;
    customerId?: string | null;
    createdAt: string;
  },
) {
  await db
    .prepare(
      `INSERT INTO inquiries (id, type, status, name, phone, email, company, message, payload_json, locale, customer_id, created_at)
       VALUES (?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.type,
      input.name.trim(),
      input.phone?.trim() || null,
      input.email?.trim() || null,
      input.company?.trim() || null,
      input.message?.trim() || null,
      input.payloadJson ?? null,
      input.locale,
      input.customerId ?? null,
      input.createdAt,
    )
    .run();
}

export async function listInquiries(db: D1Database, options?: { status?: InquiryStatus | "all"; limit?: number }) {
  const limit = options?.limit ?? 200;
  const status = options?.status ?? "all";

  const query =
    status === "all"
      ? `SELECT ${inquiryColumns} FROM inquiries ORDER BY created_at DESC LIMIT ?`
      : `SELECT ${inquiryColumns} FROM inquiries WHERE status = ? ORDER BY created_at DESC LIMIT ?`;

  const { results } =
    status === "all"
      ? await db.prepare(query).bind(limit).all<InquiryRow>()
      : await db.prepare(query).bind(status, limit).all<InquiryRow>();

  return results;
}

export async function getInquiryById(db: D1Database, id: string) {
  return db.prepare(`SELECT ${inquiryColumns} FROM inquiries WHERE id = ?`).bind(id).first<InquiryRow>();
}

export async function markInquiryRead(db: D1Database, id: string) {
  await db.prepare(`UPDATE inquiries SET status = 'read' WHERE id = ?`).bind(id).run();
}

export async function countNewInquiries(db: D1Database) {
  const row = await db
    .prepare(`SELECT COUNT(*) AS count FROM inquiries WHERE status = ?`)
    .bind("new")
    .first<{ count: number }>();
  return row?.count ?? 0;
}
