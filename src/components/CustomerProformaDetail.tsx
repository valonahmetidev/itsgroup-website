"use client";

import Link from "next/link";
import { useState } from "react";
import { useCurrency } from "@/components/CurrencyProvider";
import { useLocale } from "@/components/LocaleProvider";
import { formatPrice } from "@/lib/format";
import type { ProformaDocumentPayload } from "@/lib/proforma-document";
import { site } from "@/lib/site";
import { unitLabel } from "@/lib/units";

export function CustomerProformaDetail({
  documentNo,
  status,
  createdAt,
  payload,
}: {
  documentNo: string;
  status: "draft" | "sent";
  createdAt: string;
  payload: ProformaDocumentPayload;
}) {
  const { dict, locale } = useLocale();
  const { rates } = useCurrency();
  const [downloading, setDownloading] = useState(false);

  const total = payload.items.reduce((sum, item) => {
    if (item.price == null || item.price <= 0) return sum;
    return sum + item.price * item.quantity;
  }, 0);

  async function onDownload() {
    setDownloading(true);
    try {
      const { downloadProformaPdf } = await import("@/lib/proforma");
      await downloadProformaPdf({
        customer: payload.customer,
        items: payload.items,
        locale: payload.locale,
        dict,
        siteName: dict.meta.siteName,
        sitePhone: site.phone,
        siteDomain: site.domain,
        currency: payload.currency,
        rates: rates.rates,
        documentNo,
        documentDate: createdAt,
        options: payload.options,
      });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="shell py-12">
      <Link href="/profil" className="text-sm font-semibold text-tech hover:underline">
        ← {dict.customer.profile}
      </Link>
      <h1 className="mt-4 font-display text-4xl">{dict.customer.proformaDetail}</h1>
      <p className="mt-2 text-lg text-ink/60">{documentNo}</p>
      <p className="mt-1 text-sm text-ink/50">
        {new Date(createdAt).toLocaleString(locale)} ·{" "}
        {status === "sent" ? dict.admin.proformaStatusSent : dict.admin.proformaStatusDraft}
      </p>

      <section className="mt-8 rounded-3xl border border-ink/10 bg-card p-6">
        <h2 className="font-display text-xl">{dict.quote.itemsHeading}</h2>
        <ul className="mt-4 space-y-3">
          {payload.items.map((item) => (
            <li key={item.key} className="flex justify-between gap-4 border-b border-ink/8 pb-3 text-sm last:border-0">
              <span className="min-w-0">
                {item.name} × {item.quantity} {unitLabel(item.unit, locale)}
              </span>
              <span className="shrink-0 font-medium tabular-nums">
                {item.price != null ? formatPrice(item.price * item.quantity, locale, dict) : dict.product.onRequest}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-ink/10 pt-4 font-display text-xl">
          <span>{dict.quote.total}</span>
          <span>{formatPrice(total > 0 ? total : null, locale, dict)}</span>
        </div>
        <button
          type="button"
          onClick={() => void onDownload()}
          disabled={downloading}
          className="mt-6 rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-40"
        >
          {downloading ? dict.quote.sendingRequest : dict.quote.downloadPdf}
        </button>
      </section>
    </div>
  );
}
