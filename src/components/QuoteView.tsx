"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { CatalogImage } from "@/components/CatalogImage";
import { lineTotal, QuoteQuantityControl, useInquiry, type InquiryItem } from "@/components/Inquiry";
import { useCurrency } from "@/components/CurrencyProvider";
import { useLocale } from "@/components/LocaleProvider";
import { UnitSelect } from "@/components/UnitSelect";
import { type ProductUnit, unitLabel } from "@/lib/units";
import type { ProformaCustomer } from "@/lib/proforma";
import { productHref } from "@/lib/paths";
import { site } from "@/lib/site";
import { useResolvedName } from "@/lib/use-product-name";
import { validateEmail, validatePhone, validateRequired } from "@/lib/form-validation";
import { shareProformaViaWhatsApp } from "@/lib/whatsapp";
import { customerSaveQuoteProforma } from "@/app/customer/actions";
import { submitQuoteInquiry } from "@/app/inquiry-actions";

// Personalized/custom products are disabled for now.
// import { createCustomProduct, fetchCustomProducts, removeCustomProduct } from "@/app/actions";
// import type { CustomProductRow } from "@/lib/db";
// const LOCAL_CUSTOM_KEY = "itsgroup-custom-catalog";

export function QuoteView() {
  const { items, removeItem, clearItems, setItemUnit } = useInquiry();
  const { dict, locale } = useLocale();
  const { currency, rates, formatPrice } = useCurrency();
  const [customer, setCustomer] = useState<ProformaCustomer>({ name: "", phone: "", email: "", company: "" });
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [savingProforma, setSavingProforma] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [saveNotice, setSaveNotice] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProformaCustomer, string>>>({});

  function hasContactDetailsForSubmit() {
    const nameErr = validateRequired(customer.name, dict);
    const phoneErr = validatePhone(customer.phone, dict, true);
    return !nameErr && !phoneErr;
  }

  function validateCustomerForSubmit() {
    const nameErr = validateRequired(customer.name, dict);
    const phoneErr = validatePhone(customer.phone, dict, true);
    const emailErr = validateEmail(customer.email, dict, false);
    const errors: Partial<Record<keyof ProformaCustomer, string>> = {};
    if (nameErr) errors.name = nameErr;
    if (phoneErr) errors.phone = phoneErr;
    if (emailErr) errors.email = emailErr;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError(dict.validation.fixFields);
      return false;
    }
    setFormError("");
    return true;
  }

  const canSubmitToItsGroup = hasContactDetailsForSubmit();

  const total = items.reduce((sum, item) => sum + (lineTotal(item) ?? 0), 0);

  async function downloadPdf() {
    if (items.length === 0) return;
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

  async function saveProforma() {
    if (items.length === 0 || savingProforma) return;
    setSaveNotice(false);
    setSavingProforma(true);
    try {
      const result = await customerSaveQuoteProforma({
        customer,
        items,
        currency,
      });
      if (!result.ok) {
        if (result.error === "unauthorized") {
          setFormError(dict.quote.signInToSaveProforma);
          return;
        }
        if (result.error === "validation" && result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
          setFormError(dict.validation.fixFields);
          return;
        }
        setFormError(dict.validation.databaseUnavailable);
        return;
      }
      setFormError("");
      setSaveNotice(true);
    } finally {
      setSavingProforma(false);
    }
  }

  async function sendRequest() {
    if (items.length === 0 || sendingRequest) return;
    if (!validateCustomerForSubmit()) return;
    setSendingRequest(true);
    setSubmitSuccess(false);
    try {
      const lines = items.map((item) => ({
        source: item.source,
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
      }));
      const result = await submitQuoteInquiry({
        customer,
        items: lines,
        total: total > 0 ? total : null,
      });
      if (!result.ok) {
        if (result.error === "validation" && result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
          setFormError(dict.validation.fixFields);
          return;
        }
        if (result.error === "rate_limited") {
          setFormError(dict.validation.rateLimited);
          return;
        }
        setFormError(dict.validation.databaseUnavailable);
        return;
      }
      setFormError("");
      setSubmitSuccess(true);
    } finally {
      setSendingRequest(false);
    }
  }

  async function sendWhatsApp() {
    if (items.length === 0 || sendingWhatsApp) return;
    if (!validateCustomerForSubmit()) return;
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

      <p className="mt-4 max-w-2xl text-sm text-ink/60">{dict.quote.quoteListNote}</p>

      <section className="mt-10 rounded-3xl border border-ink/10 bg-card p-6">
        <h2 className="font-display text-2xl">{dict.quote.customerDetails}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-ink/60">{dict.contact.name}</span>
            <input
              value={customer.name}
              onChange={(event) => setCustomer((current) => ({ ...current, name: event.target.value }))}
              aria-invalid={Boolean(fieldErrors.name)}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech aria-[invalid=true]:border-home"
            />
            {fieldErrors.name && <span className="text-sm text-home">{fieldErrors.name}</span>}
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-ink/60">{dict.contact.phone}</span>
            <input
              value={customer.phone}
              onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))}
              aria-invalid={Boolean(fieldErrors.phone)}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech aria-[invalid=true]:border-home"
            />
            {fieldErrors.phone && <span className="text-sm text-home">{fieldErrors.phone}</span>}
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-ink/60">{dict.contact.email}</span>
            <input
              type="email"
              value={customer.email}
              onChange={(event) => setCustomer((current) => ({ ...current, email: event.target.value }))}
              aria-invalid={Boolean(fieldErrors.email)}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech aria-[invalid=true]:border-home"
            />
            {fieldErrors.email && <span className="text-sm text-home">{fieldErrors.email}</span>}
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
        {formError && <p className="mt-4 text-sm text-home">{formError}</p>}
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
          {submitSuccess && (
            <p className="rounded-2xl border border-tech/20 bg-tech/5 px-4 py-3 text-sm text-ink/80">{dict.quote.submitSuccess}</p>
          )}
          {saveNotice && (
            <p className="rounded-2xl border border-tech/20 bg-tech/5 px-4 py-3 text-sm text-ink/80">
              {dict.quote.proformaSaved}{" "}
              <Link href="/profil" className="font-semibold text-tech hover:underline">
                {dict.customer.profile}
              </Link>
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void sendRequest()}
              disabled={!canSubmitToItsGroup || sendingRequest}
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-40"
            >
              {sendingRequest ? dict.quote.sendingRequest : dict.quote.sendRequest}
            </button>
            <button
              type="button"
              onClick={() => void downloadPdf()}
              className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-40"
            >
              {dict.quote.downloadPdf}
            </button>
            <button
              type="button"
              onClick={() => void saveProforma()}
              disabled={savingProforma}
              className="rounded-full border border-tech/30 bg-surface px-5 py-2.5 text-sm font-semibold text-tech hover:border-tech disabled:opacity-40"
            >
              {savingProforma ? dict.quote.savingProforma : dict.quote.saveProforma}
            </button>
            <button
              type="button"
              onClick={() => void sendWhatsApp()}
              disabled={!canSubmitToItsGroup || sendingWhatsApp}
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
          <UnitSelect
            value={item.unit}
            onChange={onUnitChange}
            label={dict.product.unit}
            shape="pill"
            className="shrink-0"
          />
        )}
        <QuoteQuantityControl item={item} />
      </div>
    </article>
  );
}
