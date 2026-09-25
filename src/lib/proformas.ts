import type { D1Database } from "@/lib/db";
import type { ProformaCustomer } from "@/lib/proforma-types";
import {
  type ProformaDocumentPayload,
  type ProformaRow,
  type ProformaStatus,
  parseProformaRow,
  serializeProformaPayload,
} from "@/lib/proforma-document";

const proformaColumns =
  "id, document_no, customer_id, status, locale, currency, customer_json, items_json, options_json, created_at, updated_at";

function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function mergeProformaCustomerWithAccount(
  form: ProformaCustomer,
  account: { name: string; email: string } | null | undefined,
): ProformaCustomer {
  if (!account) return form;
  return {
    name: form.name.trim() || account.name,
    email: form.email.trim() || account.email,
    phone: form.phone,
    company: form.company,
  };
}

export function proformaCustomerSlug(customer: ProformaCustomer) {
  const base = customer.company.trim() || customer.name.trim() || "Client";
  const slug = base
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
  return (slug || "Client").slice(0, 48);
}

async function nextDailyProformaNumber(db: D1Database) {
  const day = todayKey();
  const existing = await db
    .prepare("SELECT last_number FROM proforma_daily_counters WHERE day = ?")
    .bind(day)
    .first<{ last_number: number }>();

  const next = (existing?.last_number ?? 0) + 1;
  if (existing) {
    await db.prepare("UPDATE proforma_daily_counters SET last_number = ? WHERE day = ?").bind(next, day).run();
  } else {
    await db.prepare("INSERT INTO proforma_daily_counters (day, last_number) VALUES (?, ?)").bind(day, next).run();
  }
  return next;
}

export async function buildProformaDocumentNumber(
  db: D1Database,
  customer: ProformaCustomer,
  account?: { name: string } | null,
) {
  const year = new Date().getFullYear();
  const dailyNumber = await nextDailyProformaNumber(db);
  const forSlug: ProformaCustomer = {
    ...customer,
    name: customer.name.trim() || customer.company.trim() || account?.name.trim() || "",
  };
  const slug = proformaCustomerSlug(forSlug);
  return `PF-ITS-${year}-${dailyNumber}-${slug}`;
}

export async function listProformas(db: D1Database, limit = 100) {
  const { results } = await db
    .prepare(`SELECT ${proformaColumns} FROM proformas ORDER BY created_at DESC LIMIT ?`)
    .bind(limit)
    .all<ProformaRow>();
  return results.map(parseProformaRow);
}

export async function listProformasForCustomer(db: D1Database, customerId: string, limit = 50) {
  const { results } = await db
    .prepare(`SELECT ${proformaColumns} FROM proformas WHERE customer_id = ? ORDER BY created_at DESC LIMIT ?`)
    .bind(customerId, limit)
    .all<ProformaRow>();
  return results.map(parseProformaRow);
}

export async function getProformaById(db: D1Database, id: string) {
  const row = await db.prepare(`SELECT ${proformaColumns} FROM proformas WHERE id = ?`).bind(id).first<ProformaRow>();
  return row ? parseProformaRow(row) : null;
}

export async function insertProforma(
  db: D1Database,
  input: {
    id: string;
    documentNo: string;
    customerId: string | null;
    status: ProformaStatus;
    payload: ProformaDocumentPayload;
    createdAt: string;
  },
) {
  const serialized = serializeProformaPayload(input.payload);
  await db
    .prepare(
      `INSERT INTO proformas (
        id, document_no, customer_id, status, locale, currency,
        customer_json, items_json, options_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.id,
      input.documentNo,
      input.customerId,
      input.status,
      serialized.locale,
      serialized.currency,
      serialized.customer_json,
      serialized.items_json,
      serialized.options_json,
      input.createdAt,
      input.createdAt,
    )
    .run();
}

export async function updateProforma(
  db: D1Database,
  input: {
    id: string;
    customerId: string | null;
    status: ProformaStatus;
    payload: ProformaDocumentPayload;
    updatedAt: string;
  },
) {
  const serialized = serializeProformaPayload(input.payload);
  await db
    .prepare(
      `UPDATE proformas SET
        customer_id = ?,
        status = ?,
        locale = ?,
        currency = ?,
        customer_json = ?,
        items_json = ?,
        options_json = ?,
        updated_at = ?
      WHERE id = ?`,
    )
    .bind(
      input.customerId,
      input.status,
      serialized.locale,
      serialized.currency,
      serialized.customer_json,
      serialized.items_json,
      serialized.options_json,
      input.updatedAt,
      input.id,
    )
    .run();
}

export async function deleteProforma(db: D1Database, id: string) {
  await db.prepare("DELETE FROM proformas WHERE id = ?").bind(id).run();
}
