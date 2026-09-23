"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { CatalogImage } from "@/components/CatalogImage";
import { lineTotal, QuoteQuantityControl, useInquiry, type InquiryItem } from "@/components/Inquiry";
import { useCurrency } from "@/components/CurrencyProvider";
import { useLocale } from "@/components/LocaleProvider";
import { PRODUCT_UNITS, type ProductUnit, unitLabel } from "@/lib/units";
import type { ProformaCustomer } from "@/lib/proforma";
import { productHref } from "@/lib/paths";
import { site } from "@/lib/site";
import { useResolvedName } from "@/lib/use-product-name";
import { shareProformaViaWhatsApp } from "@/lib/whatsapp";

// Personalized/custom products are disabled for now.
// import { createCustomProduct, fetchCustomProducts, removeCustomProduct } from "@/app/actions";
// import type { CustomProductRow } from "@/lib/db";
// const LOCAL_CUSTOM_KEY = "itsgroup-custom-catalog";

export function QuoteView() {
  const { items, messages, removeItem, clearItems, setItemUnit } = useInquiry();
  const { dict, locale } = useLocale();
  const { currency, rates, formatPrice } = useCurrency();
  const [customer, setCustomer] = useState<ProformaCustomer>({ name: "", phone: "", email: "", company: "" });
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  const total = items.reduce((sum, item) => sum + (lineTotal(item) ?? 0), 0);

  async function downloadPdf() {
    if (!customer.name.trim() || items.length === 0) return;
    const { downloadProformaPdf } = await import("@/lib/proforma");
    await downloadProformaPdf({
      customer,
      items,
      locale,
      dict,
      siteName: dict.meta.siteName,
      sitePhone: site.phone,
      siteDomain: site.domain,
      currency,
      rates: rates.rates,
    });
  }

  async function sendWhatsApp() {
    if (!customer.name.trim() || items.length === 0 || sendingWhatsApp) return;
    setSendingWhatsApp(true);
    try {
      await shareProformaViaWhatsApp({
        phoneE164: site.whatsapp,
        customer,
        items,
        locale,
        dict,
        siteName: dict.meta.siteName,
        sitePhone: site.phone,
        siteDomain: site.domain,
        currency,
        rates: rates.rates,
      });
    } finally {
      setSendingWhatsApp(false);
    }
  }

  return (
    <div className="shell py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tech">{dict.quote.title}</p>
      <h1 className="mt-3 font-display text-5xl">{dict.quote.heading}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/70">{dict.quote.text}</p>

      <section className="mt-10 rounded-3xl border border-ink/10 bg-card p-6">
        <h2 className="font-display text-2xl">{dict.quote.customerDetails}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-ink/60">{dict.contact.name}</span>
            <input
              value={customer.name}
              onChange={(event) => setCustomer((current) => ({ ...current, name: event.target.value }))}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-ink/60">{dict.contact.phone}</span>
            <input
              value={customer.phone}
              onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-ink/60">{dict.contact.email}</span>
            <input
              type="email"
              value={customer.email}
              onChange={(event) => setCustomer((current) => ({ ...current, email: event.target.value }))}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-ink/60">{dict.quote.company}</span>
            <input
              value={customer.company}
              onChange={(event) => setCustomer((current) => ({ ...current, company: event.target.value }))}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
            />
          </label>
        </div>
      </section>

      {items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-ink/15 px-6 py-16 text-center">
          <p>{dict.quote.empty}</p>
          <Link href="/katalog" className="mt-4 inline-block font-semibold text-tech">
            {dict.quote.openCatalog}
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {items.map((item) => (
            <QuoteItemRow
              key={item.key}
              item={item}
              onRemove={() => removeItem(item.key)}
              onUnitChange={(unit) => setItemUnit(item.key, unit)}
            />
          ))}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-card px-5 py-4">
            <p className="font-display text-xl">{dict.quote.total}</p>
            <p className="font-display text-2xl">{formatPrice(total > 0 ? total : null)}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadPdf}
              disabled={!customer.name.trim()}
              className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-40"
            >
              {dict.quote.downloadPdf}
            </button>
            <button
              type="button"
              onClick={() => void sendWhatsApp()}
              disabled={!customer.name.trim() || sendingWhatsApp}
              className="rounded-full border border-ink/10 bg-surface px-5 py-2.5 text-sm font-semibold hover:border-tech hover:text-tech disabled:opacity-40"
            >
              {sendingWhatsApp ? dict.quote.sendingWhatsApp : dict.quote.sendWhatsApp}
            </button>
            <button type="button" onClick={clearItems} className="text-sm font-semibold text-ink/50">
              {dict.quote.clear}
            </button>
          </div>
        </div>
      )}

      {/*
      Personalized/custom products — disabled for now.
      <section className="mt-12 rounded-3xl border border-ink/10 bg-card p-6">...</section>
      */}

      {messages.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-3xl">{dict.quote.messages}</h2>
          <div className="mt-4 space-y-3">
            {messages.map((message) => (
              <article key={message.id} className="rounded-3xl bg-card p-5">
                <p className="font-semibold">{message.name}</p>
                <p className="text-sm text-ink/50">{[message.phone, message.email].filter(Boolean).join(" · ")}</p>
                <p className="mt-2 leading-6">{message.message}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function QuoteItemRow({
  item,
  onRemove,
  onUnitChange,
}: {
  item: InquiryItem;
  onRemove: () => void;
  onUnitChange: (unit: ProductUnit) => void;
}) {
  const { dict, locale } = useLocale();
  const { formatPrice } = useCurrency();
  const itemName = useResolvedName(item.name, item.names);

  return (
    <article className="relative rounded-3xl border border-ink/10 bg-card p-4 sm:p-5">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition hover:bg-home/10 hover:text-home"
        aria-label={dict.quote.remove}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <div className="flex gap-4 pr-8">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
          {item.image ? (
            <CatalogImage src={item.image} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs text-ink/30">{dict.product.placeholderInitials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {item.source === "custom" ? (
                <p className="font-medium leading-snug">{itemName}</p>
              ) : (
                <Link
                  href={productHref({ source: item.source, id: item.id })}
                  className="block font-medium leading-snug hover:text-tech"
                >
                  {itemName}
                </Link>
              )}
              <p className="mt-1 text-sm text-ink/55">
                {formatPrice(item.price)} / {unitLabel(item.unit, locale)}
              </p>
            </div>
            <p className="shrink-0 text-right text-sm font-semibold tabular-nums">
              {formatPrice(lineTotal(item))}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-ink/10 pt-4">
        {item.unitLocked ? (
          <div className="shrink-0">
            <p className="mb-1 text-xs text-ink/55">{dict.product.unit}</p>
            <span className="inline-flex rounded-full border border-ink/10 bg-surface px-3 py-2 text-sm font-medium">
              {unitLabel(item.unit, locale)}
            </span>
          </div>
        ) : (
          <label className="shrink-0">
            <span className="mb-1 block text-xs text-ink/55">{dict.product.unit}</span>
            <select
              value={item.unit}
              onChange={(event) => onUnitChange(event.target.value as ProductUnit)}
              className="rounded-full border border-ink/10 bg-surface px-3 py-2 text-sm font-medium outline-none focus:border-tech"
            >
              {PRODUCT_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unitLabel(unit, locale)}
                </option>
              ))}
            </select>
          </label>
        )}
        <QuoteQuantityControl item={item} />
      </div>
    </article>
  );
}
