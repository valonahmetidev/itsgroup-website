import type { CatalogQuery, Source } from "@/lib/types";
import type { Dictionary, Locale } from "@/lib/i18n";
import { fill } from "@/lib/i18n";
import { formatPriceWithCurrency, type DisplayCurrency, type ExchangeRateSnapshot } from "@/lib/currency";

export function formatCount(value: number) {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function countProducts(count: number, dict?: Dictionary) {
  if (dict) {
    if (count === 1) return dict.products.one;
    return fill(dict.products.many, { count: formatCount(count) });
  }
  if (count === 1) return "1 product";
  return `${formatCount(count)} products`;
}

export function formatAmount(amount: number, locale: Locale) {
  const value = Math.round(amount).toString();
  const separator = locale === "en" ? "," : ".";
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

const onRequestFallback: Record<Locale, string> = {
  mk: "По договор",
  sq: "Sipas kërkesës",
  en: "On request",
};

export function formatPrice(
  amount: number | null,
  locale: Locale = "mk",
  dict?: Dictionary,
  currency: DisplayCurrency = "MKD",
  rates?: ExchangeRateSnapshot["rates"],
) {
  if (currency !== "MKD" && rates) {
    return formatPriceWithCurrency(amount, locale, currency, rates, dict);
  }
  if (amount == null || Number.isNaN(amount) || amount <= 0) {
    return dict?.product.onRequest ?? onRequestFallback[locale];
  }
  const formatted = formatAmount(amount, locale);
  if (locale === "en") return `${formatted} MKD`;
  if (locale === "sq") return `${formatted} den.`;
  return `${formatted} ден.`;
}

export function formatDate(iso: string, locale: Locale = "mk") {
  const tag = locale === "en" ? "en-GB" : locale === "sq" ? "sq-AL" : "mk-MK";
  return new Intl.DateTimeFormat(tag, { dateStyle: "long" }).format(new Date(iso));
}

export function salePercent(price: number | null, regularPrice: number | null) {
  if (price == null || regularPrice == null || regularPrice <= price) return null;
  return Math.round((1 - price / regularPrice) * 100);
}

export function catalogSearchParams(query: CatalogQuery = {}) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.source && query.source !== "all") params.set("source", query.source);
  if (query.sort && query.sort !== "name") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (query.min !== undefined) params.set("min", String(query.min));
  if (query.max !== undefined) params.set("max", String(query.max));
  if (query.stock && query.stock !== "all") params.set("stock", query.stock);
  if (query.sale && query.sale !== "all") params.set("sale", query.sale);
  if (query.priceType && query.priceType !== "all") params.set("priceType", query.priceType);
  return params;
}

export function catalogHref(query: CatalogQuery = {}) {
  const value = catalogSearchParams(query).toString();
  return value ? `/katalog?${value}` : "/katalog";
}

export function categoryCatalogHref(category: { source: Source; id: number }, query: CatalogQuery = {}) {
  const value = catalogSearchParams(query).toString();
  const base = `/kategorija/${category.source}/${category.id}`;
  return value ? `${base}?${value}` : base;
}
