import type { CatalogQuery } from "@/lib/types";
import type { Dictionary, Locale } from "@/lib/i18n";
import { fill } from "@/lib/i18n";

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
  if (count === 1) return "1 производ";
  return `${formatCount(count)} производи`;
}

function formatAmount(amount: number, locale: Locale) {
  const value = Math.round(amount).toString();
  const separator = locale === "en" ? "," : ".";
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

export function formatPrice(amount: number | null, locale: Locale = "mk", dict?: Dictionary) {
  if (amount == null || Number.isNaN(amount) || amount <= 0) {
    return dict?.product.onRequest ?? "По договор";
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

export function catalogHref(query: CatalogQuery = {}) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.source && query.source !== "all") params.set("source", query.source);
  if (query.sort && query.sort !== "name") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const value = params.toString();
  return value ? `/katalog?${value}` : "/katalog";
}
