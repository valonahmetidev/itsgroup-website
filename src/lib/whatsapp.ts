import { lineTotal, type InquiryItem } from "@/components/Inquiry";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { DisplayCurrency, ExchangeRateSnapshot } from "@/lib/currency";
import { formatPrice } from "@/lib/format";
import { formatQuantity } from "@/lib/units";
import { generateProformaPdfBlob } from "@/lib/proforma-html";
import type { ProformaCustomer } from "@/lib/proforma-types";

type WhatsAppProformaInput = {
  phoneE164: string;
  customer: ProformaCustomer;
  items: InquiryItem[];
  locale: Locale;
  dict: Dictionary;
  siteName: string;
  currency?: DisplayCurrency;
  rates?: ExchangeRateSnapshot["rates"];
};

export function buildWhatsAppProformaMessage({
  customer,
  items,
  locale,
  dict,
  siteName,
  currency = "MKD",
  rates,
}: Omit<WhatsAppProformaInput, "phoneE164">) {
  const priceLabel = (amount: number | null) => formatPrice(amount, locale, dict, currency, rates);
  const lines = [
    `*${dict.quote.whatsAppInquiryTitle}*`,
    siteName,
    "",
    dict.quote.whatsAppInquiryIntro,
    "",
    `*${dict.contact.name}:* ${customer.name}`,
  ];

  if (customer.phone) lines.push(`*${dict.contact.phone}:* ${customer.phone}`);
  if (customer.email) lines.push(`*${dict.contact.email}:* ${customer.email}`);
  if (customer.company) lines.push(`*${dict.quote.company}:* ${customer.company}`);

  lines.push("", `*${dict.quote.itemsHeading}:*`);
  let total = 0;
  items.forEach((item, index) => {
    const line = lineTotal(item);
    const unitLabel = priceLabel(item.price);
    const lineLabel = priceLabel(line);
    if (line != null && line > 0) total += line;
    const qty = ` × ${formatQuantity(item.quantity, item.unit, locale)}`;
    lines.push(`${index + 1}. ${item.name}${qty} — ${unitLabel} = ${lineLabel}`);
  });
  lines.push("", `*${dict.quote.total}:* ${priceLabel(total > 0 ? total : null)}`);

  return lines.join("\n");
}

export function buildWhatsAppProformaUrl(input: WhatsAppProformaInput) {
  const digits = input.phoneE164.replace(/\D/g, "");
  const message = buildWhatsAppProformaMessage(input);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function shareProformaViaWhatsApp({
  phoneE164,
  customer,
  items,
  locale,
  dict,
  siteName,
  sitePhone,
  siteDomain,
  currency = "MKD",
  rates,
}: WhatsAppProformaInput & {
  sitePhone: string;
  siteDomain: string;
}) {
  const message = buildWhatsAppProformaMessage({
    customer,
    items,
    locale,
    dict,
    siteName,
    currency,
    rates,
  });

  const { blob, filename } = await generateProformaPdfBlob({
    customer,
    items,
    locale,
    dict,
    siteName,
    sitePhone,
    siteDomain,
    currency,
    rates,
  });

  const file = new File([blob], filename, { type: "application/pdf" });
  const shareData = { files: [file], text: message };

  if (typeof navigator !== "undefined" && navigator.share) {
    if (!navigator.canShare || navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
  }

  downloadBlob(blob, filename);
  window.open(buildWhatsAppProformaUrl({ phoneE164, customer, items, locale, dict, siteName, currency, rates }), "_blank", "noopener,noreferrer");
}
