"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ProformaCatalogMode } from "@/components/ProformaCatalogMode";
import { CatalogProductsSection } from "@/components/CatalogProductsSection";
import { useCustomerSession } from "@/components/CustomerSessionProvider";
import { useLocale } from "@/components/LocaleProvider";
import {
  applyCatalogFilters,
  filterCatalogByDivision,
  getPriceBounds,
  parseCatalogSearchParams,
  sortCatalogProducts,
  type ParsedCatalogQuery,
} from "@/lib/catalog-filters";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog-pagination";
import { applyCustomerPricingList } from "@/lib/customer-pricing";
import { catalogHref, countProducts } from "@/lib/format";
import { fill } from "@/lib/i18n";
import { searchAndRankProducts } from "@/lib/product-search";
import type { Product } from "@/lib/types";

const defaultQuery: ParsedCatalogQuery = parseCatalogSearchParams({});

function queryFromSearchParams(searchParams: { forEach: (fn: (value: string, key: string) => void) => void }) {
  const raw: Record<string, string | undefined> = {};
  searchParams.forEach((value, key) => {
    raw[key] = value;
  });
  return parseCatalogSearchParams(raw);
}

export function CatalogView({ products }: { products: Product[] }) {
  return (
    <Suspense fallback={<CatalogListing products={products} query={defaultQuery} />}>
      <CatalogListingFromUrl products={products} />
    </Suspense>
  );
}

function CatalogListingFromUrl({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const query = useMemo(() => queryFromSearchParams(searchParams), [searchParams]);
  return <CatalogListing products={products} query={query} />;
}

function CatalogListing({ products, query }: { products: Product[]; query: ParsedCatalogQuery }) {
  const { dict, locale } = useLocale();
  const { pricing } = useCustomerSession();
  const priced = useMemo(() => applyCustomerPricingList(products, pricing), [products, pricing]);

  const { page, pages, visible, total, priceBounds } = useMemo(() => {
    const scoped = filterCatalogByDivision(priced, query.division);
    const base = query.q ? searchAndRankProducts(scoped, query.q, locale) : scoped;
    const bounds = getPriceBounds(base);
    const filtered = applyCatalogFilters(base, query);
    const matched = query.q && query.sort === "name" ? filtered : sortCatalogProducts(filtered, query.sort);
    const pageCount = Math.max(1, Math.ceil(matched.length / CATALOG_PAGE_SIZE));
    const currentPage = Math.min(query.page, pageCount);
    return {
      page: currentPage,
      pages: pageCount,
      visible: matched.slice((currentPage - 1) * CATALOG_PAGE_SIZE, currentPage * CATALOG_PAGE_SIZE),
      total: matched.length,
      priceBounds: bounds,
    };
  }, [priced, query, locale]);

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
