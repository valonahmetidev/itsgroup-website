"use client";

import Link from "next/link";
import { CatalogFilters } from "@/components/CatalogFilters";
import { Pagination } from "@/components/Pagination";
import { ProductGrid } from "@/components/ProductCard";
import { useLocale } from "@/components/LocaleProvider";
import { categoryHref } from "@/lib/catalog";
import { categoryCatalogHref, countProducts } from "@/lib/format";
import { useCategoryLabel } from "@/lib/i18n/catalog-labels";
import { customerDivisionLabel } from "@/lib/division-display";
import { sourceMeta } from "@/lib/site";
import type { ParsedCatalogQuery } from "@/lib/catalog-filters";
import type { Category, Product, Source } from "@/lib/types";

export function CategoryView({
  category,
  trail,
  children,
  query,
  total,
  page,
  pages,
  visible,
  priceBounds,
}: {
  category: Category;
  trail: Category[];
  children: Category[];
  query: ParsedCatalogQuery;
  total: number;
  page: number;
  pages: number;
  visible: Product[];
  priceBounds: { min: number; max: number } | null;
}) {
  const { dict, locale } = useLocale();
  const categoryLabel = useCategoryLabel();
  const meta = sourceMeta[category.source];
  const division = customerDivisionLabel(category.source, locale, dict);

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
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start">
        <CatalogFilters
          query={query}
          priceBounds={priceBounds}
          showSource={false}
          hrefFor={(next) => categoryCatalogHref(category, { ...query, ...next })}
        />
        <div>
          <ProductGrid products={visible} />
          <Pagination
            page={page}
            pages={pages}
            hrefFor={(nextPage) => categoryCatalogHref(category, { ...query, page: nextPage })}
          />
        </div>
      </div>
    </div>
  );
}
