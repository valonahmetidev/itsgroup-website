"use server";

import { redirect } from "next/navigation";
import { clearCustomerSession, setCustomerSession } from "@/lib/customer-auth";
import { getDbAsync } from "@/lib/cloudflare";
import { getCustomerByEmail } from "@/lib/customers";
import { getAuthSecretAsync, verifyPassword } from "@/lib/password";

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
