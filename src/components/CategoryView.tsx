"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { CatalogProductsSection } from "@/components/CatalogProductsSection";
import { useCustomerSession } from "@/components/CustomerSessionProvider";
import { useLocale } from "@/components/LocaleProvider";
import { categoryHref } from "@/lib/catalog";
import {
  applyCatalogFilters,
  getPriceBounds,
  parseCatalogSearchParams,
  sortCatalogProducts,
  type ParsedCatalogQuery,
} from "@/lib/catalog-filters";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog-pagination";
import { applyCustomerPricingList } from "@/lib/customer-pricing";
import { categoryCatalogHref, countProducts } from "@/lib/format";
import { useCategoryLabel } from "@/lib/i18n/catalog-labels";
import { customerDivisionLabel } from "@/lib/division-display";
import { sourceMeta } from "@/lib/site";
import type { Category, Product } from "@/lib/types";

const defaultQuery: ParsedCatalogQuery = { ...parseCatalogSearchParams({}), division: "all" };

function queryFromSearchParams(searchParams: { forEach: (fn: (value: string, key: string) => void) => void }) {
  const raw: Record<string, string | undefined> = {};
  searchParams.forEach((value, key) => {
    raw[key] = value;
  });
  return { ...parseCatalogSearchParams(raw), division: "all" as const };
}

type CategoryViewProps = {
  category: Category;
  trail: Category[];
  children: Category[];
  products: Product[];
};

export function CategoryView(props: CategoryViewProps) {
  return (
    <Suspense fallback={<CategoryListing {...props} query={defaultQuery} />}>
      <CategoryListingFromUrl {...props} />
    </Suspense>
  );
}

function CategoryListingFromUrl(props: CategoryViewProps) {
  const searchParams = useSearchParams();
  const query = useMemo(() => queryFromSearchParams(searchParams), [searchParams]);
  return <CategoryListing {...props} query={query} />;
}

function CategoryListing({
  category,
  trail,
  children,
  products,
  query,
}: CategoryViewProps & { query: ParsedCatalogQuery }) {
  const { pricing } = useCustomerSession();
  const { dict, locale } = useLocale();
  const categoryLabel = useCategoryLabel();
  const meta = sourceMeta[category.source];
  const division = customerDivisionLabel(category.source, locale, dict);
  const pricedProducts = useMemo(
    () => applyCustomerPricingList(products, pricing),
    [products, pricing],
  );

  const priceBounds = useMemo(() => getPriceBounds(pricedProducts), [pricedProducts]);

  const { page, pages, visible, total } = useMemo(() => {
    const filtered = applyCatalogFilters(pricedProducts, query);
    const sorted = sortCatalogProducts(filtered, query.sort);
    const pageCount = Math.max(1, Math.ceil(sorted.length / CATALOG_PAGE_SIZE));
    const currentPage = Math.min(query.page, pageCount);
    const slice = sorted.slice(
      (currentPage - 1) * CATALOG_PAGE_SIZE,
      currentPage * CATALOG_PAGE_SIZE,
    );
    return {
      page: currentPage,
      pages: pageCount,
      visible: slice,
      total: sorted.length,
    };
  }, [pricedProducts, query]);

  return (
    <div className="shell py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink/50">
        <Link href={meta.href}>{division}</Link>
        {trail.map((item) => (
          <span key={item.id} className="flex items-center gap-2">
            <span>/</span>
            <Link href={categoryHref(item)} className={item.id === category.id ? "text-ink" : ""}>
              {categoryLabel(item)}
            </Link>
          </span>
        ))}
      </nav>
      <h1 className="max-w-4xl font-display text-4xl leading-tight md:text-6xl">{categoryLabel(category)}</h1>
      <p className="mt-3 text-ink/60">
        {countProducts(total, dict)} · {division}
      </p>
      {children.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {children.map((child) => (
            <Link key={child.id} href={categoryHref(child)} className="rounded-full bg-surface px-4 py-2 text-sm hover:text-tech">
              {categoryLabel(child)}
            </Link>
          ))}
        </div>
      )}
      <CatalogProductsSection
        className="mt-8"
        query={query}
        priceBounds={priceBounds}
        showSource={false}
        hrefFor={(next) => categoryCatalogHref(category, { ...query, ...next })}
        page={page}
        pages={pages}
        visible={visible}
      />
    </div>
  );
}
