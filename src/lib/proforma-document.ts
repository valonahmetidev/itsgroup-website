import type { InquiryItem } from "@/components/Inquiry";
import type { ProformaCustomer } from "@/lib/proforma-types";
import type { DisplayCurrency } from "@/lib/currency";
import type { Locale } from "@/lib/i18n";
import type { ProductUnit } from "@/lib/units";

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
  image: string | null;
  unit?: ProductUnit;
  unitLocked?: boolean;
}): ProformaLineItem {
  const unit = input.unit ?? "pc";
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
  };
}
