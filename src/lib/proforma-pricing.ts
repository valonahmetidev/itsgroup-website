import type { InquiryItem } from "@/components/Inquiry";

export function clampDiscountPercent(value: unknown): number {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(100, Math.round(n));
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
  let subtotal = 0;
  let afterLineDiscounts = 0;

  for (const item of items) {
    const gross = lineSubtotal(item);
    const net = lineTotal(item);
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
    subtotal,
    lineDiscountAmount: Math.max(0, subtotal - afterLineDiscounts),
    afterLineDiscounts,
    generalDiscountPercent: generalPct,
    generalDiscountAmount,
    total,
  };
}
