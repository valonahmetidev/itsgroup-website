import { cookies } from "next/headers";
import { CURRENCY_COOKIE, isDisplayCurrency, type DisplayCurrency } from "@/lib/currency";
import { getExchangeRates } from "@/lib/exchange-rates";

export async function getServerCurrency(): Promise<DisplayCurrency> {
  const value = (await cookies()).get(CURRENCY_COOKIE)?.value;
  return value && isDisplayCurrency(value) ? value : "MKD";
}

export async function getServerCurrencyContext() {
  const [currency, rates] = await Promise.all([getServerCurrency(), getExchangeRates()]);
  return { currency, rates };
}
