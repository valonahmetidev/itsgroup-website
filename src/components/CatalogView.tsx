"use client";

import { PageHeader } from "@/components/PageHeader";
import { CatalogFilters } from "@/components/CatalogFilters";
import { Pagination } from "@/components/Pagination";
import { ProductGrid } from "@/components/ProductCard";
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
      <PageHeader
        eyebrow={dict.catalog.title}
        title={query.q ? fill(dict.catalog.resultsFor, { query: query.q }) : dict.catalog.title}
        text={fill(dict.catalog.fromBoth, { count: countProducts(total, dict) })}
      />
      <div className="shell grid gap-6 pb-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start">
        <CatalogFilters
          query={query}
          priceBounds={priceBounds}
          hrefFor={(next) => catalogHref({ ...query, ...next })}
        />
        <div>
          <ProductGrid products={visible} />
          <Pagination page={page} pages={pages} hrefFor={(nextPage) => catalogHref({ ...query, page: nextPage })} />
        </div>
      </div>
    </>
  );
}
