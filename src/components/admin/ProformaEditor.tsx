"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import {
  adminBuildProformaLineItem,
  adminCreateProforma,
  adminDeleteProforma,
  adminSearchProducts,
  adminUpdateProforma,
  type AdminProductListItem,
} from "@/app/admin/actions";
import type { CustomerRow } from "@/app/admin/actions";
import { lineSubtotal, lineTotal } from "@/components/Inquiry";
import { clampDiscountPercent, computeProformaTotals } from "@/lib/proforma-pricing";
import { useCurrency } from "@/components/CurrencyProvider";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import type { DisplayCurrency } from "@/lib/currency";
import { formatPrice } from "@/lib/format";
import { getDictionary, locales, type Locale } from "@/lib/i18n";
import {
  defaultProformaRenderOptions,
  emptyProformaCustomer,
  newProformaLineKey,
  proformaLineFromProduct,
  type ProformaDocumentPayload,
  type ProformaLineItem,
  type ProformaRenderOptions,
  type ProformaStatus,
} from "@/lib/proforma-document";
import {
  proformaServicePresetLabel,
  proformaServicePresets,
  type ProformaServicePresetKey,
} from "@/lib/proforma-service-presets";
import { site } from "@/lib/site";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { ProductUnit } from "@/lib/units";

type InitialProforma = ProformaDocumentPayload & {
  id: string;
  documentNo: string;
  customerId: string | null;
  status: ProformaStatus;
};

function adminDefaultOptions(): ProformaRenderOptions {
  return {
    ...defaultProformaRenderOptions(),
    showCustomerSignature: true,
    showCompanySignature: true,
    showProformaNote: true,
  };
}

export function ProformaEditor({
  initial,
  customers,
  presetCustomerId,
  presetCustomer,
  backHref = "/admin/proformas",
}: {
  initial: InitialProforma | null;
  customers: CustomerRow[];
  presetCustomerId?: string;
  presetCustomer?: CustomerRow | null;
  backHref?: string;
}) {
  const router = useRouter();
  const { dict, locale: adminLocale } = useLocale();
  const { currency: uiCurrency, rates, setCurrency } = useCurrency();

  const [documentNo, setDocumentNo] = useState(initial?.documentNo ?? "");
  const [customerId, setCustomerId] = useState(initial?.customerId ?? presetCustomerId ?? "");
  const [status, setStatus] = useState<ProformaStatus>(initial?.status ?? "draft");
  const [docLocale, setDocLocale] = useState<Locale>(initial?.locale ?? adminLocale);
  const [currency, setDocCurrency] = useState<DisplayCurrency>(initial?.currency ?? uiCurrency);
  const [customer, setCustomer] = useState(
    initial?.customer ??
      (presetCustomer
        ? { name: presetCustomer.name, email: presetCustomer.email, phone: "", company: presetCustomer.name }
        : emptyProformaCustomer()),
  );
  const [items, setItems] = useState<ProformaLineItem[]>(initial?.items ?? []);
  const [options, setOptions] = useState<ProformaRenderOptions>(
    initial?.options ? { ...adminDefaultOptions(), ...initial.options } : adminDefaultOptions(),
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 320);
  const [results, setResults] = useState<AdminProductListItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState("");

  const docDict = useMemo(() => getDictionary(docLocale), [docLocale]);
  const totals = useMemo(
    () => computeProformaTotals(items, options.generalDiscountPercent),
    [items, options.generalDiscountPercent],
  );

  useEffect(() => {
    setDocCurrency(uiCurrency);
  }, [uiCurrency]);

  useEffect(() => {
    const cleaned = debouncedQuery.trim();
    if (cleaned.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    void adminSearchProducts(cleaned, "all").then((response) => {
      if (cancelled) return;
      setResults(response.items);
      setSearching(false);
    });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  function patchOption<K extends keyof ProformaRenderOptions>(key: K, value: ProformaRenderOptions[K]) {
    setOptions((current) => ({ ...current, [key]: value }));
  }

  function updateItem(key: string, patch: Partial<ProformaLineItem>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function removeItem(key: string) {
    setItems((current) => current.filter((item) => item.key !== key));
  }

  async function addProductLine(product: AdminProductListItem) {
    const line = await adminBuildProformaLineItem({
      customerId: customerId || null,
      source: product.source,
      productId: String(product.id),
      locale: docLocale,
    });
    if (line) {
      setItems((current) => [...current, line]);
      return;
    }
    setItems((current) => [
      ...current,
      proformaLineFromProduct({
        source: product.source,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      }),
    ]);
  }

  function addManualLine() {
    const name = manualName.trim();
    if (!name) return;
    const price = manualPrice.trim() ? Number(manualPrice) : null;
    setItems((current) => [
      ...current,
      {
        key: newProformaLineKey(),
        source: "custom",
        id: newProformaLineKey(),
        name,
        price: Number.isFinite(price) ? price : null,
        image: null,
        quantity: 1,
        unit: "pc",
        unitLocked: false,
      },
    ]);
    setManualName("");
    setManualPrice("");
  }

  function addPresetLine(key: ProformaServicePresetKey) {
    const preset = proformaServicePresets.find((row) => row.key === key);
    setItems((current) => [
      ...current,
      {
        key: newProformaLineKey(),
        source: "custom",
        id: key,
        name: proformaServicePresetLabel(key, docLocale),
        price: preset?.defaultPrice ?? null,
        image: null,
        quantity: 1,
        unit: "pc",
        unitLocked: false,
      },
    ]);
  }

  function onCustomerSelect(id: string) {
    setCustomerId(id);
    const row = customers.find((entry) => entry.id === id);
    if (!row) return;
    setCustomer((current) => ({
      ...current,
      name: row.name,
      email: row.email,
      company: current.company || row.name,
    }));
  }

  function buildPayload(): ProformaDocumentPayload {
    return {
      customer,
      items,
      locale: docLocale,
      currency,
      options,
    };
  }

  async function saveDocument(nextStatus?: ProformaStatus) {
    if (!customer.name.trim()) {
      setStatusMessage(dict.admin.saveError);
      return;
    }
    setSaving(true);
    const payload = buildPayload();
    const resolvedStatus = nextStatus ?? status;
    const result = initial
      ? await adminUpdateProforma({
          id: initial.id,
          customerId: customerId || null,
          status: resolvedStatus,
          payload,
        })
      : await adminCreateProforma({
          customerId: customerId || null,
          status: resolvedStatus,
          payload,
        });
    setSaving(false);
    if (!result.ok) {
      setStatusMessage(dict.admin.saveError);
      return;
    }
    setStatus(resolvedStatus);
    setStatusMessage(dict.admin.proformaCreated);
    if (!initial && result.id) {
      router.replace(`/admin/proformas/${result.id}`);
      router.refresh();
      return;
    }
    if (result.documentNo) setDocumentNo(result.documentNo);
    router.refresh();
  }

  async function downloadPdf() {
    if (!customer.name.trim() || items.length === 0) return;
    const { downloadProformaPdf } = await import("@/lib/proforma");
    await downloadProformaPdf({
      customer,
      items,
      locale: docLocale,
      dict: docDict,
      siteName: docDict.meta.siteName,
      sitePhone: site.phone,
      siteDomain: site.domain,
      currency,
      rates: rates.rates,
      documentNo: documentNo || undefined,
      options,
    });
  }

  async function onDelete() {
    if (!initial) return;
    if (!window.confirm(dict.admin.proformaDelete)) return;
    const result = await adminDeleteProforma(initial.id);
    if (!result.ok) {
      setStatusMessage(dict.admin.saveError);
      return;
    }
    router.push(backHref);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">{initial ? dict.admin.editProforma : dict.admin.newProforma}</h2>
          {documentNo && <p className="mt-1 text-sm text-ink/55">{documentNo}</p>}
        </div>
        <Link href={backHref} className="rounded-full border border-ink/10 px-4 py-1.5 text-sm font-semibold hover:border-tech hover:text-tech">
          {dict.admin.back}
        </Link>
      </div>

      {statusMessage && <p className="text-sm text-tech">{statusMessage}</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-ink/10 bg-card p-4">
            <h3 className="font-display text-lg">{dict.quote.customerDetails}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm sm:col-span-2">
                <span>{dict.admin.proformaSelectCustomer}</span>
                <select
                  value={customerId}
                  onChange={(event) => onCustomerSelect(event.target.value)}
                  className="rounded-2xl border border-ink/10 bg-surface px-3 py-2"
                >
                  <option value="">—</option>
                  {customers.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.name} ({row.email})
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span>{dict.contact.name}</span>
                <input
                  value={customer.name}
                  onChange={(event) => setCustomer((c) => ({ ...c, name: event.target.value }))}
                  className="rounded-2xl border border-ink/10 bg-surface px-3 py-2"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{dict.quote.company}</span>
                <input
                  value={customer.company}
                  onChange={(event) => setCustomer((c) => ({ ...c, company: event.target.value }))}
                  className="rounded-2xl border border-ink/10 bg-surface px-3 py-2"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{dict.contact.phone}</span>
                <input
                  value={customer.phone}
                  onChange={(event) => setCustomer((c) => ({ ...c, phone: event.target.value }))}
                  className="rounded-2xl border border-ink/10 bg-surface px-3 py-2"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{dict.contact.email}</span>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(event) => setCustomer((c) => ({ ...c, email: event.target.value }))}
                  className="rounded-2xl border border-ink/10 bg-surface px-3 py-2"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-card p-4">
            <h3 className="font-display text-lg">{dict.admin.proformaLines}</h3>

            <div className="mt-4 rounded-xl border border-dashed border-tech/25 bg-tech/5 p-4">
              <h4 className="text-sm font-semibold text-ink">{dict.admin.proformaCustomLinesTitle}</h4>
              <p className="mt-1 text-xs text-ink/55">{dict.admin.proformaCustomLinesHint}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {proformaServicePresets.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => addPresetLine(preset.key)}
                    className="rounded-full border border-ink/10 bg-card px-3 py-1 text-xs font-semibold hover:border-tech hover:text-tech"
                  >
                    + {proformaServicePresetLabel(preset.key, docLocale)}
                  </button>
                ))}
              </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_auto]">
              <input
                value={manualName}
                onChange={(event) => setManualName(event.target.value)}
                placeholder={dict.admin.proformaManualLine}
                className="rounded-2xl border border-ink/10 bg-surface px-3 py-2 text-sm"
              />
              <input
                value={manualPrice}
                onChange={(event) => setManualPrice(event.target.value)}
                placeholder={dict.admin.price}
                type="number"
                min={0}
                className="rounded-2xl border border-ink/10 bg-surface px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addManualLine}
                className="inline-flex items-center justify-center gap-1 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper"
              >
                <Plus className="h-4 w-4" />
                {dict.admin.proformaAddLine}
              </button>
            </div>
            </div>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={dict.admin.searchPlaceholder}
                className="w-full rounded-2xl border border-ink/10 bg-surface py-2 pl-9 pr-3 text-sm"
              />
            </div>
            {searching && (
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-ink/50">
                <Loader2 className="h-4 w-4 animate-spin" />
                {dict.admin.loadingProducts}
              </p>
            )}
            {results.length > 0 && (
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-ink/10 p-2">
                {results.map((product) => (
                  <li key={`${product.source}-${product.id}`}>
                    <button
                      type="button"
                      onClick={() => void addProductLine(product)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface"
                    >
                      <span className="truncate">{product.name}</span>
                      <span className="shrink-0 text-xs text-ink/45">
                        {product.price != null ? formatPrice(product.price, docLocale, docDict) : dict.product.onRequest}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {items.length === 0 ? (
              <p className="mt-4 text-sm text-ink/50">{dict.admin.proformaNoItems}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {items.map((item) => (
                  <li key={item.key} className="rounded-xl border border-ink/10 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <input
                        value={item.name}
                        onChange={(event) => updateItem(item.key, { name: event.target.value })}
                        className="min-w-0 flex-1 rounded-lg border border-ink/10 bg-surface px-2 py-1 text-sm font-medium"
                      />
                      <button type="button" onClick={() => removeItem(item.key)} className="text-ink/45 hover:text-home">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <label className="grid gap-0.5 text-xs">
                        <span className="text-ink/45">{dict.product.quantity}</span>
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(item.key, { quantity: Math.max(0, Number(event.target.value) || 0) })
                          }
                          className="rounded-lg border border-ink/10 bg-surface px-2 py-1"
                        />
                      </label>
                      <label className="grid gap-0.5 text-xs">
                        <span className="text-ink/45">{dict.product.unit}</span>
                        <select
                          value={item.unit}
                          disabled={item.unitLocked}
                          onChange={(event) =>
                            updateItem(item.key, { unit: event.target.value as ProductUnit })
                          }
                          className="rounded-lg border border-ink/10 bg-surface px-2 py-1 disabled:opacity-60"
                        >
                          {(["pc", "m", "m2", "kg", "l", "set"] as ProductUnit[]).map((unit) => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-0.5 text-xs">
                        <span className="text-ink/45">{dict.quote.productPrice}</span>
                        <input
                          type="number"
                          min={0}
                          value={item.price ?? ""}
                          onChange={(event) => {
                            const raw = event.target.value;
                            updateItem(item.key, {
                              price: raw === "" ? null : Math.max(0, Number(raw) || 0),
                            });
                          }}
                          className="rounded-lg border border-ink/10 bg-surface px-2 py-1"
                        />
                      </label>
                      <label className="grid gap-0.5 text-xs">
                        <span className="text-ink/45">{dict.admin.proformaLineDiscount}</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={item.discountPercent ?? ""}
                          onChange={(event) => {
                            const raw = event.target.value;
                            updateItem(item.key, {
                              discountPercent: raw === "" ? undefined : clampDiscountPercent(raw),
                            });
                          }}
                          className="rounded-lg border border-ink/10 bg-surface px-2 py-1"
                        />
                      </label>
                    </div>
                    {item.discountPercent && item.discountPercent > 0 && lineSubtotal(item) != null && (
                      <p className="mt-1 text-xs text-ink/45 line-through">
                        {formatPrice(lineSubtotal(item), docLocale, docDict)}
                      </p>
                    )}
                    <p className="mt-2 text-right text-sm font-semibold text-tech">
                      {formatPrice(lineTotal(item), docLocale, docDict)}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 space-y-1 text-right text-sm">
              {totals.subtotal > 0 && totals.lineDiscountAmount + totals.generalDiscountAmount > 0 && (
                <p className="text-ink/55">
                  {dict.admin.proformaSubtotal}: {formatPrice(totals.subtotal, docLocale, docDict)}
                </p>
              )}
              {totals.lineDiscountAmount > 0 && (
                <p className="text-home">
                  −{formatPrice(totals.lineDiscountAmount, docLocale, docDict)} ({dict.admin.proformaLineDiscount})
                </p>
              )}
              {totals.generalDiscountAmount > 0 && (
                <p className="text-home">
                  −{formatPrice(totals.generalDiscountAmount, docLocale, docDict)} ({dict.admin.proformaGeneralDiscount}{" "}
                  {totals.generalDiscountPercent}%)
                </p>
              )}
              <p className="font-display text-xl text-ink">
                {dict.quote.total}: {formatPrice(totals.total > 0 ? totals.total : null, docLocale, docDict)}
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-ink/10 bg-card p-4">
            <h3 className="font-display text-lg">{dict.admin.proformaLocale}</h3>
            <div className="mt-3 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span>{dict.admin.proformaLocale}</span>
                <select
                  value={docLocale}
                  onChange={(event) => setDocLocale(event.target.value as Locale)}
                  className="rounded-2xl border border-ink/10 bg-surface px-3 py-2"
                >
                  {locales.map((entry) => (
                    <option key={entry.code} value={entry.code}>{entry.name}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span>{dict.admin.proformaCurrency}</span>
                <select
                  value={currency}
                  onChange={(event) => {
                    const next = event.target.value as DisplayCurrency;
                    setDocCurrency(next);
                    setCurrency(next);
                  }}
                  className="rounded-2xl border border-ink/10 bg-surface px-3 py-2"
                >
                  <option value="MKD">MKD</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span>{dict.admin.proformaStatus}</span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ProformaStatus)}
                  className="rounded-2xl border border-ink/10 bg-surface px-3 py-2"
                >
                  <option value="draft">{dict.admin.proformaStatusDraft}</option>
                  <option value="sent">{dict.admin.proformaStatusSent}</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-card p-4">
            <h3 className="font-display text-lg">{dict.admin.proformaOptions}</h3>
            <label className="mt-3 grid gap-1 text-sm">
              <span>{dict.admin.proformaGeneralDiscount}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={options.generalDiscountPercent ?? ""}
                onChange={(event) => {
                  const raw = event.target.value;
                  patchOption(
                    "generalDiscountPercent",
                    raw === "" ? 0 : clampDiscountPercent(raw),
                  );
                }}
                className="rounded-2xl border border-ink/10 bg-surface px-3 py-2"
              />
            </label>
            <div className="mt-3 space-y-2 text-sm">
              {(
                [
                  ["showCustomerSignature", dict.admin.proformaShowCustomerSignature],
                  ["showCompanySignature", dict.admin.proformaShowCompanySignature],
                  ["showProformaNote", dict.admin.proformaShowNote],
                  ["showBankDetails", dict.admin.proformaShowBank],
                  ["showValidUntil", dict.admin.proformaShowValidUntil],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options[key]}
                    onChange={(event) => patchOption(key, event.target.checked)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {options.showValidUntil && (
              <label className="mt-3 grid gap-1 text-sm">
                <span>{dict.admin.proformaValidUntil}</span>
                <input
                  type="date"
                  value={options.validUntil}
                  onChange={(event) => patchOption("validUntil", event.target.value)}
                  className="rounded-2xl border border-ink/10 bg-surface px-3 py-2"
                />
              </label>
            )}
            <label className="mt-3 grid gap-1 text-sm">
              <span>{dict.admin.proformaPoReference}</span>
              <input
                value={options.poReference}
                onChange={(event) => patchOption("poReference", event.target.value)}
                className="rounded-2xl border border-ink/10 bg-surface px-3 py-2"
              />
            </label>
            {options.showBankDetails && (
              <label className="mt-3 grid gap-1 text-sm">
                <span>{dict.admin.proformaBankDetails}</span>
                <textarea
                  value={options.bankDetails}
                  onChange={(event) => patchOption("bankDetails", event.target.value)}
                  rows={3}
                  className="rounded-2xl border border-ink/10 bg-surface px-3 py-2"
                />
              </label>
            )}
            <label className="mt-3 grid gap-1 text-sm">
              <span>{dict.admin.proformaCustomerSignatureLabel}</span>
              <input
                value={options.customerSignatureLabel}
                onChange={(event) => patchOption("customerSignatureLabel", event.target.value)}
                className="rounded-2xl border border-ink/10 bg-surface px-3 py-2"
              />
            </label>
            <label className="mt-3 grid gap-1 text-sm">
              <span>{dict.admin.proformaCompanySignatureLabel}</span>
              <input
                value={options.companySignatureLabel}
                onChange={(event) => patchOption("companySignatureLabel", event.target.value)}
                className="rounded-2xl border border-ink/10 bg-surface px-3 py-2"
              />
            </label>
          </section>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveDocument()}
              className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-60"
            >
              {saving ? dict.admin.loggingIn : dict.admin.proformaSave}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveDocument("sent")}
              className="rounded-full border border-ink/10 px-4 py-2.5 text-sm font-semibold hover:border-tech hover:text-tech"
            >
              {dict.admin.proformaMarkSent}
            </button>
            <button
              type="button"
              onClick={() => void downloadPdf()}
              className="rounded-full border border-tech/30 px-4 py-2.5 text-sm font-semibold text-tech"
            >
              {dict.admin.proformaDownloadPdf}
            </button>
            {initial && (
              <button
                type="button"
                onClick={() => void onDelete()}
                className={cn("rounded-full border border-home/30 px-4 py-2.5 text-sm font-semibold text-home")}
              >
                {dict.admin.proformaDelete}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
