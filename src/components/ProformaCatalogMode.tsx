"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { customerUpdateProforma } from "@/app/customer/actions";
import { useCurrency } from "@/components/CurrencyProvider";
import { useLocale } from "@/components/LocaleProvider";
import { readProformaDraftBundle, setProformaCatalogTarget } from "@/lib/proforma-catalog-bridge";
import { useProformaCatalogDraft } from "@/lib/use-proforma-catalog-draft";

export function ProformaCatalogMode() {
  const searchParams = useSearchParams();
  const forProforma = searchParams.get("forProforma");
  const { dict } = useLocale();

  useEffect(() => {
    if (forProforma) setProformaCatalogTarget(forProforma);
  }, [forProforma]);

  if (!forProforma) return null;

  return (
    <>
      <div className="shell pb-3">
        <div className="rounded-2xl border border-tech/25 bg-tech/5 px-4 py-3 text-sm text-ink/80">
          <p>{dict.catalog.addingToProforma}</p>
        </div>
      </div>
      <ProformaCatalogBar proformaId={forProforma} />
    </>
  );
}

function ProformaCatalogBar({ proformaId }: { proformaId: string }) {
  const router = useRouter();
  const { dict } = useLocale();
  const { currency } = useCurrency();
  const { items } = useProformaCatalogDraft(proformaId);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function onSave() {
    const bundle = readProformaDraftBundle(proformaId);
    if (!bundle?.items.length || saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await customerUpdateProforma({
        id: proformaId,
        customer: bundle.customer,
        items: bundle.items,
        currency: bundle.currency ?? currency,
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

  const countLabel = dict.catalog.proformaItemCount.replace("{count}", String(items.length));

  return (
    <div className="sticky bottom-0 z-30 border-t border-ink/10 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
      <div className="shell flex flex-wrap items-center justify-between gap-3 py-3">
        <p className="text-sm font-medium text-ink/75">{countLabel}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/profil/ponuda/${proformaId}/uredi`}
            className="rounded-full border border-ink/10 bg-surface px-4 py-2 text-sm font-semibold hover:border-tech"
          >
            {dict.customer.backToProformaEditor}
          </Link>
          <button
            type="button"
            onClick={() => void onSave()}
            disabled={saving || items.length === 0}
            className="rounded-full bg-tech px-5 py-2 text-sm font-semibold text-cream disabled:opacity-40"
          >
            {saving ? dict.quote.savingProforma : dict.catalog.saveProforma}
          </button>
        </div>
      </div>
      {(notice || error) && (
        <div className="shell pb-3">
          {notice && <p className="text-sm text-tech">{notice}</p>}
          {error && <p className="text-sm text-home">{error}</p>}
        </div>
      )}
    </div>
  );
}
