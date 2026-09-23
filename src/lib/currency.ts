import type { Dictionary, Locale } from "@/lib/i18n";
import { formatAmount } from "@/lib/format";

export type DisplayCurrency = "MKD" | "EUR" | "USD" | "CHF";

export const DISPLAY_CURRENCIES: DisplayCurrency[] = ["MKD", "EUR", "USD", "CHF"];

export const CURRENCY_COOKIE = "its-currency";

export type ExchangeRateSnapshot = {
  base: "MKD";
  updatedAt: string;
  rates: Record<DisplayCurrency, number>;
};

export function isDisplayCurrency(value: string): value is DisplayCurrency {
  return DISPLAY_CURRENCIES.includes(value as DisplayCurrency);
}

export function convertMkd(amountMkd: number, currency: DisplayCurrency, rates: ExchangeRateSnapshot["rates"]) {
  if (currency === "MKD") return amountMkd;
  const rate = rates[currency];
  if (!rate || rate <= 0) return amountMkd;
  return amountMkd * rate;
}

const onRequestFallback: Record<Locale, string> = {
  mk: "По договор",
  sq: "Sipas kërkesës",
  en: "On request",
};

function localeTag(locale: Locale) {
  return locale === "mk" ? "mk-MK" : locale === "sq" ? "sq-AL" : "en-GB";
}

export function formatPriceWithCurrency(
  amountMkd: number | null,
  locale: Locale,
  currency: DisplayCurrency,
  rates: ExchangeRateSnapshot["rates"],
  dict?: Dictionary,
) {
  if (amountMkd == null || Number.isNaN(amountMkd) || amountMkd <= 0) {
    return dict?.product.onRequest ?? onRequestFallback[locale];
  }

  if (currency === "MKD") {
    const formatted = formatAmount(amountMkd, locale);
    if (locale === "en") return `${formatted} MKD`;
    if (locale === "sq") return `${formatted} den.`;
    return `${formatted} ден.`;
  }

  const converted = convertMkd(amountMkd, currency, rates);
  return new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(converted);
}
