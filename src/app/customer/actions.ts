"use server";

import { redirect } from "next/navigation";
import { getCustomerSessionId, clearCustomerSession, setCustomerSession } from "@/lib/customer-auth";
import { getDbAsync } from "@/lib/cloudflare";
import { getCustomerByEmail } from "@/lib/customers";
import { getAuthSecretAsync, verifyPassword } from "@/lib/password";
import { getProformaById, listProformasForCustomer } from "@/lib/proformas";
import type { ProformaDocumentPayload } from "@/lib/proforma-document";

export type CustomerProformaSummary = {
  id: string;
  documentNo: string;
  status: "draft" | "sent";
  createdAt: string;
  itemCount: number;
  total: number | null;
};

function summaryFromProforma(row: Awaited<ReturnType<typeof getProformaById>> & object): CustomerProformaSummary {
  const total = row.items.reduce((sum, item) => {
    if (item.price == null || item.price <= 0) return sum;
    return sum + item.price * item.quantity;
  }, 0);
  return {
    id: row.id,
    documentNo: row.documentNo,
    status: row.status,
    createdAt: row.createdAt,
    itemCount: row.items.length,
    total: total > 0 ? total : null,
  };
}

export async function customerLogin(email: string, password: string) {
  try {
    const db = await getDbAsync();
    const secret = await getAuthSecretAsync();
    if (!db || !secret) return { ok: false as const, error: "unavailable" };

    const customer = await getCustomerByEmail(db, email);
    if (!customer || customer.active !== 1) return { ok: false as const, error: "invalid" };
    if (!verifyPassword(password, customer.password_hash, secret)) {
      return { ok: false as const, error: "invalid" };
    }

    await setCustomerSession(customer.id);
    return { ok: true as const, name: customer.name };
  } catch {
    return { ok: false as const, error: "unavailable" };
  }
}

export async function customerLogout() {
  await clearCustomerSession();
  redirect("/");
}

export async function customerListProformas() {
  const customerId = await getCustomerSessionId();
  if (!customerId) return { ok: false as const, error: "unauthorized" as const, items: [] as CustomerProformaSummary[] };

  const db = await getDbAsync();
  if (!db) return { ok: false as const, error: "unavailable" as const, items: [] as CustomerProformaSummary[] };

  try {
    const rows = await listProformasForCustomer(db, customerId);
    return { ok: true as const, items: rows.map((row) => summaryFromProforma(row)) };
  } catch {
    return { ok: false as const, error: "unavailable" as const, items: [] as CustomerProformaSummary[] };
  }
}

export async function customerGetProformaForDownload(id: string) {
  const customerId = await getCustomerSessionId();
  if (!customerId) return { ok: false as const, error: "unauthorized" as const };

  const db = await getDbAsync();
  if (!db) return { ok: false as const, error: "unavailable" as const };

  try {
    const row = await getProformaById(db, id);
    if (!row || row.customerId !== customerId) {
      return { ok: false as const, error: "not_found" as const };
    }
    const payload: ProformaDocumentPayload = {
      customer: row.customer,
      items: row.items,
      locale: row.locale,
      currency: row.currency,
      options: row.options,
    };
    return {
      ok: true as const,
      documentNo: row.documentNo,
      status: row.status,
      createdAt: row.createdAt,
      payload,
    };
  } catch {
    return { ok: false as const, error: "unavailable" as const };
  }
}
