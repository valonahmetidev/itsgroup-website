import { cookies } from "next/headers";
import { getDictionary, isLocale, LOCALE_COOKIE } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export async function getServerLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return value && isLocale(value) ? value : "mk";
}

export async function getServerI18n() {
  const locale = await getServerLocale();
  return { locale, dict: getDictionary(locale) };
}
