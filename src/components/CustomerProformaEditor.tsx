"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  customerDeleteProforma,
  customerUpdateProforma,
} from "@/app/customer/actions";
import { CatalogImage } from "@/components/CatalogImage";
import { useCurrency } from "@/components/CurrencyProvider";
import { QuantityControl, lineTotal, type InquiryItem } from "@/components/Inquiry";
import { useLocale } from "@/components/LocaleProvider";
import { UnitSelect } from "@/components/UnitSelect";
import { validateEmail } from "@/lib/form-validation";
import type { ProformaDocumentPayload } from "@/lib/proforma-document";
import type { ProformaCustomer } from "@/lib/proforma-types";
import {
  PROFORMA_DRAFT_CHANGED,
  clearProformaCatalogTarget,
  readProformaDraftBundle,
  setProformaCatalogTarget,
  writeProformaDraftBundle,
} from "@/lib/proforma-catalog-bridge";
import { productHref } from "@/lib/paths";
import { site } from "@/lib/site";
import { type ProductUnit, unitLabel, clampQuantity, normalizeProductUnit } from "@/lib/units";
import { useResolvedName } from "@/lib/use-product-name";

export function CustomerProformaEditor({
  proformaId,
  documentNo,
  createdAt,
  initialPayload,
}: {
  proformaId: string;
  documentNo: string;
  createdAt: string;
  initialPayload: ProformaDocumentPayload;
}) {
  const router = useRouter();
  const { dict, locale } = useLocale();
  const { currency, rates, formatPrice: formatMoney } = useCurrency();
  const [customer, setCustomer] = useState<ProformaCustomer>(() => {
    return readProformaDraftBundle(proformaId)?.customer ?? initialPayload.customer;
  });
  const [items, setItems] = useState<InquiryItem[]>(() => {
    return readProformaDraftBundle(proformaId)?.items ?? initialPayload.items;
  });
  const draftReady = useRef(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProformaCustomer, string>>>({});

  const syncFromDraft = useCallback(() => {
    const bundle = readProformaDraftBundle(proformaId);
    if (!bundle) return;
    setItems(bundle.items);
    setCustomer(bundle.customer);
  }, [proformaId]);

  useEffect(() => {
    if (!readProformaDraftBundle(proformaId)) {
      writeProformaDraftBundle(proformaId, {
        items: initialPayload.items,
        customer: initialPayload.customer,
        currency,
      });
    }
    draftReady.current = true;
  }, [proformaId, currency, initialPayload.customer, initialPayload.items]);

  useEffect(() => {
    if (!draftReady.current) return;
    writeProformaDraftBundle(proformaId, { items, customer, currency });
  }, [proformaId, items, customer, currency]);

  useEffect(() => {
    const onDraft = (event: Event) => {
      const detail = (event as CustomEvent<{ proformaId: string }>).detail;
      if (detail?.proformaId === proformaId) syncFromDraft();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") syncFromDraft();
    };
    window.addEventListener(PROFORMA_DRAFT_CHANGED, onDraft);
    window.addEventListener("focus", syncFromDraft);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener(PROFORMA_DRAFT_CHANGED, onDraft);
      window.removeEventListener("focus", syncFromDraft);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [proformaId, syncFromDraft]);

  const total = items.reduce((sum, item) => sum + (lineTotal(item) ?? 0), 0);

  function setItemQuantity(key: string, quantity: number) {
    setItems((current) =>
      current.map((item) =>
        item.key === key ? { ...item, quantity: clampQuantity(quantity, item.unit) } : item,
      ),
    );
  }

  function setItemUnit(key: string, unit: ProductUnit) {
    setItems((current) =>
      current.map((item) =>
        item.key === key && !item.unitLocked
          ? { ...item, unit: normalizeProductUnit(unit), quantity: clampQuantity(item.quantity, unit) }
          : item,
      ),
    );
  }

  function removeItem(key: string) {
    setItems((current) => current.filter((item) => item.key !== key));
  }

  function openCatalogForProforma() {
    writeProformaDraftBundle(proformaId, { items, customer, currency });
    setProformaCatalogTarget(proformaId);
    router.push(`/katalog?forProforma=${proformaId}`);
  }

  async function onSave() {
    if (!items.length || saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    const emailErr = validateEmail(customer.email, dict, false);
    if (emailErr) {
      setFieldErrors({ email: emailErr });
      setError(dict.validation.fixFields);
      setSaving(false);
      return;
    }
    setFieldErrors({});
    try {
      const result = await customerUpdateProforma({
        id: proformaId,
        customer,
        items,
        currency,
      });
      if (!result.ok) {
        setError(dict.validation.databaseUnavailable);
        return;
      }
      setNotice(dict.quote.proformaUpdated);
      router.refresh();
    } finally {
      setSaving(false);
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
      clearProformaCatalogTarget();
      window.location.href = "/profil";
    } finally {
      setDeleting(false);
    }
  }

  async function onDownload() {
    setDownloading(true);
    try {
      const { downloadProformaPdf } = await import("@/lib/proforma");
      await downloadProformaPdf({
        customer,
        items,
        locale: initialPayload.locale,
        dict,
        siteName: dict.meta.siteName,
        sitePhone: site.phone,
        siteDomain: site.domain,
        currency,
        rates: rates.rates,
        documentNo,
        documentDate: createdAt,
        options: initialPayload.options,
      });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="shell py-12">
      <Link href={`/profil/ponuda/${proformaId}`} className="text-sm font-semibold text-tech hover:underline">
        ← {documentNo}
      </Link>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-tech">{dict.customer.editProforma}</p>
      <h1 className="mt-2 font-display text-4xl">{dict.customer.proformaDetail}</h1>
      <p className="mt-3 max-w-2xl text-sm text-ink/65">{dict.customer.proformaEditorNote}</p>

      <section className="mt-8 rounded-3xl border border-ink/10 bg-card p-6">
        <h2 className="font-display text-2xl">{dict.quote.customerDetails}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-ink/60">{dict.contact.name}</span>
            <input
              value={customer.name}
              onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-ink/60">{dict.contact.phone}</span>
            <input
              value={customer.phone}
              onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-ink/60">{dict.contact.email}</span>
            <input
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
              aria-invalid={Boolean(fieldErrors.email)}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech aria-[invalid=true]:border-home"
            />
            {fieldErrors.email && <span className="text-sm text-home">{fieldErrors.email}</span>}
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-ink/60">{dict.quote.company}</span>
            <input
              value={customer.company}
              onChange={(e) => setCustomer((c) => ({ ...c, company: e.target.value }))}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
            />
          </label>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">{dict.quote.itemsHeading}</h2>
          <button
            type="button"
            onClick={openCatalogForProforma}
            className="rounded-full border border-tech/30 bg-surface px-5 py-2.5 text-sm font-semibold text-tech hover:border-tech"
          >
            {dict.customer.addProductsToProforma}
          </button>
        </div>

        {items.length === 0 ? (
          <p className="mt-6 rounded-3xl border border-dashed border-ink/15 px-6 py-12 text-center text-sm text-ink/55">
            {dict.admin.proformaNoItems}
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <EditorItemRow
                key={item.key}
                item={item}
                onRemove={() => removeItem(item.key)}
                onUnitChange={(unit) => setItemUnit(item.key, unit)}
                onQuantityChange={(qty) => {
                  if (qty <= 0) removeItem(item.key);
                  else setItemQuantity(item.key, qty);
                }}
              />
            ))}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-card px-5 py-4">
              <p className="font-display text-xl">{dict.quote.total}</p>
              <p className="font-display text-2xl">{formatMoney(total > 0 ? total : null)}</p>
            </div>
          </div>
        )}
      </section>

      {notice && <p className="mt-6 rounded-2xl border border-tech/20 bg-tech/5 px-4 py-3 text-sm text-ink/80">{notice}</p>}
      {error && <p className="mt-4 text-sm text-home">{error}</p>}

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={saving || items.length === 0}
          className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-40"
        >
          {saving ? dict.quote.savingProforma : dict.quote.updateProforma}
        </button>
        <button
          type="button"
          onClick={() => void onDownload()}
          disabled={downloading || items.length === 0}
          className="rounded-full border border-ink/10 bg-surface px-5 py-2.5 text-sm font-semibold hover:border-tech disabled:opacity-40"
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
    </div>
  );
}

function EditorItemRow({
  item,
  onRemove,
  onUnitChange,
  onQuantityChange,
}: {
  item: InquiryItem;
  onRemove: () => void;
  onUnitChange: (unit: ProductUnit) => void;
  onQuantityChange: (quantity: number) => void;
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
                <Link href={productHref({ source: item.source, id: item.id })} className="block font-medium leading-snug hover:text-tech">
                  {itemName}
                </Link>
              )}
              <p className="mt-1 text-sm text-ink/55">
                {formatPrice(item.price)} / {unitLabel(item.unit, locale)}
              </p>
            </div>
            <p className="shrink-0 text-right text-sm font-semibold tabular-nums">{formatPrice(lineTotal(item))}</p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-3">
        {item.unitLocked ? (
          <span className="text-xs font-medium text-ink/55">{unitLabel(item.unit, locale)}</span>
        ) : (
          <UnitSelect
            value={item.unit}
            onChange={onUnitChange}
            label={dict.product.unit}
            shape="pill"
            size="compact"
            hideLabel
            fullWidth={false}
            className="min-w-[6.5rem] shrink-0"
          />
        )}
        <QuantityControl quantity={item.quantity} unit={item.unit} onChange={onQuantityChange} compact />
      </div>
    </article>
  );
}
