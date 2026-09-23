import { getCustomerSessionId } from "@/lib/customer-auth";
import { getDbAsync } from "@/lib/cloudflare";
import { getCustomerById } from "@/lib/customers";

export async function getCustomerProfile() {
  const customerId = await getCustomerSessionId();
  if (!customerId) return null;

  const db = await getDbAsync();
  if (!db) return null;

  try {
    const customer = await getCustomerById(db, customerId);
    if (!customer || customer.active !== 1) return null;
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      discountPercent: customer.discount_percent,
    };
  } catch {
    return null;
  }
}
