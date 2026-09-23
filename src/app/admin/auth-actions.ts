"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  getAdminSecretAsync,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function adminLogin(password: string) {
  try {
    const secret = await getAdminSecretAsync();
    if (!verifyAdminPassword(password, secret)) {
      return { ok: false as const };
    }
    await setAdminSession();
    return { ok: true as const };
  } catch {
    return { ok: false as const };
  }
}

export async function adminLogout() {
  await clearAdminSession();
  redirect("/admin/login");
}
