import { lineTotal, type InquiryItem } from "@/components/Inquiry";
import type { Dictionary, Locale } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import { formatQuantity } from "@/lib/units";
import type { ProformaCustomer } from "@/lib/proforma-types";

export function buildWhatsAppProformaUrl({
  phoneE164,
  customer,
  items,
  locale,
  dict,
  siteName,
}: {
  phoneE164: string;
  customer: ProformaCustomer;
  items: InquiryItem[];
  locale: Locale;
  dict: Dictionary;
  siteName: string;
}) {
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
    const unitLabel = formatPrice(item.price, locale, dict);
    const lineLabel = formatPrice(line, locale, dict);
    if (line != null && line > 0) total += line;
    const qty = ` × ${formatQuantity(item.quantity, item.unit, locale)}`;
    lines.push(`${index + 1}. ${item.name}${qty} — ${unitLabel} = ${lineLabel}`);
  });
  lines.push("", `*${dict.quote.total}:* ${formatPrice(total > 0 ? total : null, locale, dict)}`);
  lines.push("", dict.quote.whatsAppProformaNote);

  const digits = phoneE164.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`;
}
