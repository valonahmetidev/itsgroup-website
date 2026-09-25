"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { setProformaCatalogTarget } from "@/lib/proforma-catalog-bridge";

export function ProformaCatalogMode() {
  const searchParams = useSearchParams();
  const forProforma = searchParams.get("forProforma");
  const { dict } = useLocale();

  useEffect(() => {
    if (forProforma) setProformaCatalogTarget(forProforma);
  }, [forProforma]);

  if (!forProforma) return null;

  return (
    <div className="shell pb-4">
      <div className="rounded-2xl border border-tech/25 bg-tech/5 px-4 py-3 text-sm text-ink/80">
        <p>{dict.catalog.addingToProforma}</p>
        <Link href={`/profil/ponuda/${forProforma}/uredi`} className="mt-2 inline-block font-semibold text-tech hover:underline">
          {dict.customer.backToProformaEditor}
        </Link>
      </div>
    </div>
  );
}
