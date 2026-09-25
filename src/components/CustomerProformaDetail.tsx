"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { customerDeleteProforma } from "@/app/customer/actions";
import { useCurrency } from "@/components/CurrencyProvider";
import { useLocale } from "@/components/LocaleProvider";
import { formatPrice } from "@/lib/format";
import type { ProformaDocumentPayload } from "@/lib/proforma-document";
import { site } from "@/lib/site";
import { unitLabel } from "@/lib/units";

export function CustomerProformaDetail({
  proformaId,
  documentNo,
  status,
  createdAt,
  payload,
}: {
  proformaId: string;
  documentNo: string;
  status: "draft" | "sent";
  createdAt: string;
  payload: ProformaDocumentPayload;
}) {
  const router = useRouter();
  const { dict, locale } = useLocale();
  const { rates } = useCurrency();
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

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

  async function onDelete() {
    if (!window.confirm(dict.customer.deleteProformaConfirm)) return;
    setDeleting(true);
    setError("");
    try {
      const result = await customerDeleteProforma(proformaId);
      if (!result.ok) {
        setError(dict.validation.databaseUnavailable);
        return;
      }
      router.push("/profil");
      router.refresh();
    } finally {
      setDeleting(false);
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
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/ponuda?proforma=${proformaId}`}
            className="rounded-full border border-tech/30 bg-surface px-5 py-2.5 text-sm font-semibold text-tech hover:border-tech"
          >
            {dict.customer.editProformaInQuote}
          </Link>
          <button
            type="button"
            onClick={() => void onDownload()}
            disabled={downloading}
            className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-40"
          >
            {downloading ? dict.quote.sendingRequest : dict.quote.downloadPdf}
          </button>
          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={deleting}
            className="rounded-full border border-home/30 px-5 py-2.5 text-sm font-semibold text-home hover:border-home disabled:opacity-40"
          >
            {deleting ? dict.quote.savingProforma : dict.customer.deleteProforma}
          </button>
        </div>
        {error && <p className="mt-4 text-sm text-home">{error}</p>}
      </section>
    </div>
  );
}
