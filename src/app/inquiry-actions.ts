"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCustomerSessionId } from "@/lib/customer-auth";
import type { D1Database } from "@/lib/db";
import { getDictionary } from "@/lib/i18n";
import { getServerI18n } from "@/lib/i18n/server";
import { insertInquiry, isInquiryRateLimited } from "@/lib/inquiries";
import type { ProformaCustomer } from "@/lib/proforma-types";
import type { ProductUnit } from "@/lib/units";
import { validateEmail, validateMinLength, validatePhone, validateRequired } from "@/lib/form-validation";

function getDb(): D1Database | null {
  try {
    const { env } = getCloudflareContext();
    return (env as { DB?: D1Database }).DB ?? null;
  } catch {
    return null;
  }
}

export type QuoteInquiryLine = {
  source: string;
  id: string | number;
  name: string;
  quantity: number;
  unit: ProductUnit;
  price: number | null;
};

type FieldErrors = Record<string, string>;

function validateContactFields(
  dict: ReturnType<typeof getDictionary>,
  input: { name: string; email: string; message: string },
) {
  const errors: FieldErrors = {};
  const nameErr = validateRequired(input.name, dict);
  if (nameErr) errors.name = nameErr;
  const messageErr = validateRequired(input.message, dict) || validateMinLength(input.message, 10, dict);
  if (messageErr) errors.message = messageErr;
  const emailErr = validateEmail(input.email, dict, false);
  if (emailErr) errors.email = emailErr;
  return errors;
}

function validateQuoteCustomer(dict: ReturnType<typeof getDictionary>, customer: ProformaCustomer) {
  const errors: Partial<Record<keyof ProformaCustomer, string>> = {};
  const nameErr = validateRequired(customer.name, dict);
  if (nameErr) errors.name = nameErr;
  const phoneErr = validatePhone(customer.phone, dict, true);
  if (phoneErr) errors.phone = phoneErr;
  const emailErr = validateEmail(customer.email, dict, false);
  if (emailErr) errors.email = emailErr;
  return errors;
}

export async function submitContactInquiry(input: {
  website?: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}) {
  if (String(input.website ?? "").trim()) {
    return { ok: false as const, error: "honeypot" as const };
  }

  const { locale } = await getServerI18n();
  const dict = getDictionary(locale);
  const errors = validateContactFields(dict, input);
  if (Object.keys(errors).length > 0) {
    return { ok: false as const, error: "validation" as const, fieldErrors: errors };
  }

  const db = getDb();
  if (!db) return { ok: false as const, error: "database_unavailable" as const };

  const email = input.email.trim();
  if (email && (await isInquiryRateLimited(db, email))) {
    return { ok: false as const, error: "rate_limited" as const };
  }

  const customerId = await getCustomerSessionId();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await insertInquiry(db, {
    id,
    type: "contact",
    name: input.name,
    phone: input.phone,
    email: input.email,
    message: input.message,
    locale,
    customerId,
    createdAt,
  });

  return { ok: true as const };
}

export async function submitQuoteInquiry(input: {
  customer: ProformaCustomer;
  items: QuoteInquiryLine[];
  total: number | null;
}) {
  const customerId = await getCustomerSessionId();
  if (!customerId) {
    return { ok: false as const, error: "unauthorized" as const };
  }

  const { locale } = await getServerI18n();
  const dict = getDictionary(locale);
  const fieldErrors = validateQuoteCustomer(dict, input.customer);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false as const, error: "validation" as const, fieldErrors };
  }

  if (!input.items.length) {
    return { ok: false as const, error: "empty_cart" as const };
  }

  const db = getDb();
  if (!db) return { ok: false as const, error: "database_unavailable" as const };

  const email = input.customer.email.trim();
  if (email && (await isInquiryRateLimited(db, email))) {
    return { ok: false as const, error: "rate_limited" as const };
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const payloadJson = JSON.stringify({
    items: input.items,
    total: input.total,
    customer: input.customer,
  });

  await insertInquiry(db, {
    id,
    type: "quote",
    name: input.customer.name,
    phone: input.customer.phone || null,
    email: input.customer.email || null,
    company: input.customer.company || null,
    payloadJson,
    locale,
    customerId,
    createdAt,
  });

  return { ok: true as const };
}
