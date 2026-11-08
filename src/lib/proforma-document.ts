import type { InquiryItem } from "@/components/Inquiry";
import type { Locale } from "@/lib/i18n";
import { resolveProductName } from "@/lib/product-names";
import type { ProductNames } from "@/lib/product-names";
import type { ProformaCustomer } from "@/lib/proforma-types";
import type { DisplayCurrency } from "@/lib/currency";
import type { ProductUnit } from "@/lib/units";

export function proformaLineDescription(item: InquiryItem, locale: Locale): string {
  const fallback = item.description?.trim() ?? "";
  if (item.descriptions) return resolveProductName(item.descriptions, fallback, locale);
  return fallback;
}

export type ProformaStatus = "draft" | "sent";

export type ProformaRenderOptions = {
  showCustomerSignature: boolean;
  showCompanySignature: boolean;
  showProformaNote: boolean;
  showBankDetails: boolean;
  showValidUntil: boolean;
  validUntil: string;
  poReference: string;
  bankDetails: string;
  customerSignatureLabel: string;
  companySignatureLabel: string;
  /** Document-wide discount applied after line discounts (0–100). */
  generalDiscountPercent?: number;
};

export const defaultProformaRenderOptions = (): ProformaRenderOptions => ({
  showCustomerSignature: false,
  showCompanySignature: false,
  showProformaNote: true,
  showBankDetails: false,
  showValidUntil: false,
  validUntil: "",
  poReference: "",
  bankDetails: "",
  customerSignatureLabel: "",
  companySignatureLabel: "",
  generalDiscountPercent: 0,
});

export type ProformaLineItem = InquiryItem;

export type ProformaDocumentPayload = {
  customer: ProformaCustomer;
  items: ProformaLineItem[];
  locale: Locale;
  currency: DisplayCurrency;
  options: ProformaRenderOptions;
};

export type ProformaRow = {
  id: string;
  document_no: string;
  customer_id: string | null;
  status: ProformaStatus;
  locale: Locale;
  currency: DisplayCurrency;
  customer_json: string;
  items_json: string;
  options_json: string;
  created_at: string;
  updated_at: string;
};

export function parseProformaRow(row: ProformaRow): ProformaDocumentPayload & {
  id: string;
  documentNo: string;
  customerId: string | null;
  status: ProformaStatus;
  createdAt: string;
  updatedAt: string;
} {
  return {
    id: row.id,
    documentNo: row.document_no,
    customerId: row.customer_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customer: JSON.parse(row.customer_json) as ProformaCustomer,
    items: JSON.parse(row.items_json) as ProformaLineItem[],
    locale: row.locale,
    currency: row.currency,
    options: JSON.parse(row.options_json) as ProformaRenderOptions,
  };
}

export function serializeProformaPayload(payload: ProformaDocumentPayload) {
  return {
    customer_json: JSON.stringify(payload.customer),
    items_json: JSON.stringify(payload.items),
    options_json: JSON.stringify(payload.options),
    locale: payload.locale,
    currency: payload.currency,
  };
}

export function newProformaLineKey() {
  return `line-${crypto.randomUUID()}`;
}

export function emptyProformaCustomer(): ProformaCustomer {
  return { name: "", phone: "", email: "", company: "" };
}

export function proformaLineFromProduct(input: {
  source: ProformaLineItem["source"];
  id: number | string;
  name: string;
  price: number | null;
  listPrice?: number | null;
  accountDiscountPercent?: number;
  image: string | null;
  unit?: ProductUnit;
  unitLocked?: boolean;
  description?: string;
  descriptions?: ProductNames;
}): ProformaLineItem {
  const unit = input.unit ?? "pc";
  const description = input.description?.trim() || undefined;
  const listPrice =
    input.listPrice != null && input.price != null && input.listPrice > input.price ? input.listPrice : undefined;
  const accountDiscountPercent =
    input.accountDiscountPercent != null && input.accountDiscountPercent > 0
      ? input.accountDiscountPercent
      : listPrice != null && input.price != null && listPrice > input.price
        ? Math.min(100, Math.round((1 - input.price / listPrice) * 100))
        : undefined;
  return {
    key: newProformaLineKey(),
    source: input.source,
    id: input.id,
    name: input.name,
    price: input.price,
    image: input.image,
    quantity: 1,
    unit,
    unitLocked: Boolean(input.unitLocked),
    ...(listPrice != null ? { listPrice } : {}),
    ...(accountDiscountPercent != null && accountDiscountPercent > 0 ? { accountDiscountPercent } : {}),
    ...(description ? { description } : {}),
    ...(input.descriptions ? { descriptions: input.descriptions } : {}),
  };
}

export function proformaPricingFromProduct(product: {
  price: number | null;
  regularPrice?: number | null;
  customerDiscountPercent?: number;
}) {
  const net = product.price;
  if (net == null || product.customerDiscountPercent == null || product.customerDiscountPercent <= 0) {
    return { listPrice: undefined as number | undefined, accountDiscountPercent: undefined as number | undefined };
  }
  const list =
    product.regularPrice != null && product.regularPrice > net
      ? product.regularPrice
      : Math.round((net * 100) / (100 - product.customerDiscountPercent));
  return {
    listPrice: list > net ? list : undefined,
    accountDiscountPercent: product.customerDiscountPercent,
  };
}
