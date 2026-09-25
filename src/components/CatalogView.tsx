"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ProformaCatalogMode } from "@/components/ProformaCatalogMode";
import { CatalogProductsSection } from "@/components/CatalogProductsSection";
import { useLocale } from "@/components/LocaleProvider";
import { catalogHref, countProducts } from "@/lib/format";
import { fill } from "@/lib/i18n";
import type { ParsedCatalogQuery } from "@/lib/catalog-filters";
import type { Product } from "@/lib/types";

export function CatalogView({
  query,
  total,
  page,
  pages,
  visible,
  priceBounds,
}: {
  query: ParsedCatalogQuery;
  total: number;
  page: number;
  pages: number;
  visible: Product[];
  priceBounds: { min: number; max: number } | null;
}) {
  const { dict } = useLocale();

  return (
    <>
      <Suspense fallback={null}>
        <ProformaCatalogMode />
      </Suspense>
      <PageHeader
        eyebrow={dict.catalog.title}
        title={query.q ? fill(dict.catalog.resultsFor, { query: query.q }) : dict.catalog.title}
        text={fill(dict.catalog.fromBoth, { count: countProducts(total, dict) })}
      />
      <CatalogProductsSection
        className="shell pb-8"
        query={query}
        priceBounds={priceBounds}
        hrefFor={(next) => catalogHref({ ...query, ...next })}
        page={page}
        pages={pages}
        visible={visible}
      />
    </>
  );
}
