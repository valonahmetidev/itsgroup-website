import type { InquiryItem } from "@/components/Inquiry";

export function clampDiscountPercent(value: unknown): number {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(100, Math.round(n));
}

export function lineListUnitPrice(item: InquiryItem): number | null {
  if (item.listPrice != null && item.listPrice > 0) return item.listPrice;
  return item.price;
}

export function lineAccountDiscountPercent(item: InquiryItem): number {
  if (item.accountDiscountPercent != null && item.accountDiscountPercent > 0) {
    return Math.min(100, Math.round(item.accountDiscountPercent));
  }
  const list = item.listPrice;
  const unit = item.price;
  if (list == null || unit == null || list <= unit) return 0;
  return Math.min(100, Math.round((1 - unit / list) * 100));
}

export function lineCatalogSubtotal(item: InquiryItem): number | null {
  const unit = lineListUnitPrice(item);
  if (unit == null || unit <= 0) return null;
  return unit * item.quantity;
}

export function lineAccountDiscountAmount(item: InquiryItem): number {
  const catalog = lineCatalogSubtotal(item);
  const net = lineSubtotal(item);
  if (catalog == null || net == null || catalog <= net) return 0;
  return catalog - net;
}

export function lineSubtotal(item: InquiryItem): number | null {
  if (item.price == null || item.price <= 0) return null;
  return item.price * item.quantity;
}

export function lineTotal(item: InquiryItem): number | null {
  const subtotal = lineSubtotal(item);
  if (subtotal == null) return null;
  const percent = clampDiscountPercent(item.discountPercent);
  if (percent <= 0) return subtotal;
  return Math.max(0, Math.round(subtotal * (100 - percent) / 100));
}

export type ProformaTotals = {
  catalogSubtotal: number;
  accountDiscountAmount: number;
  subtotal: number;
  lineDiscountAmount: number;
  afterLineDiscounts: number;
  generalDiscountPercent: number;
  generalDiscountAmount: number;
  total: number;
};

export function computeProformaTotals(
  items: InquiryItem[],
  generalDiscountPercent?: number | null,
): ProformaTotals {
  let catalogSubtotal = 0;
  let accountDiscountAmount = 0;
  let subtotal = 0;
  let afterLineDiscounts = 0;

  for (const item of items) {
    const catalog = lineCatalogSubtotal(item);
    const gross = lineSubtotal(item);
    const net = lineTotal(item);
    if (catalog != null) catalogSubtotal += catalog;
    accountDiscountAmount += lineAccountDiscountAmount(item);
    if (gross != null) subtotal += gross;
    if (net != null) afterLineDiscounts += net;
  }

  const generalPct = clampDiscountPercent(generalDiscountPercent);
  const generalDiscountAmount =
    generalPct > 0 && afterLineDiscounts > 0
      ? Math.round(afterLineDiscounts * generalPct / 100)
      : 0;
  const total = Math.max(0, afterLineDiscounts - generalDiscountAmount);

  return {
    catalogSubtotal,
    accountDiscountAmount: Math.max(0, accountDiscountAmount),
    subtotal,
    lineDiscountAmount: Math.max(0, subtotal - afterLineDiscounts),
    afterLineDiscounts,
    generalDiscountPercent: generalPct,
    generalDiscountAmount,
    total,
  };
}
