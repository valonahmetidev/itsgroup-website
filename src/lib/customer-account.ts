/** Stored when no contact email is set on a customer account (unique per id). */
export const CUSTOMER_CONTACT_EMAIL_SUFFIX = "@contact.none";

export function normalizeCustomerUsername(value: string) {
  return value.trim().toLowerCase();
}

export function isCustomerContactEmailPlaceholder(email: string) {
  return email.trim().toLowerCase().endsWith(CUSTOMER_CONTACT_EMAIL_SUFFIX);
}

export function customerContactEmailFromRow(email: string | null | undefined): string {
  const trimmed = (email ?? "").trim();
  if (!trimmed || isCustomerContactEmailPlaceholder(trimmed)) return "";
  return trimmed;
}

export function placeholderContactEmail(customerId: string) {
  return `${customerId}${CUSTOMER_CONTACT_EMAIL_SUFFIX}`;
}

export function customerLoginName(row: { username: string | null; email: string }) {
  return (row.username?.trim() || row.email).trim();
}
