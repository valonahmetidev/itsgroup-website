"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { ProductGrid } from "@/components/ProductCard";
import { useLocale } from "@/components/LocaleProvider";
import { catalogHref, countProducts } from "@/lib/format";
import { fill } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import type { CatalogQuery, Product } from "@/lib/types";

export function CatalogView({
  query,
  total,
  page,
  pages,
  visible,
}: {
  query: Required<Pick<CatalogQuery, "q" | "source" | "sort" | "page">>;
  total: number;
  page: number;
  pages: number;
  visible: Product[];
}) {
  const { dict } = useLocale();

  return (
    <>
      <PageHeader
        eyebrow={dict.catalog.title}
        title={query.q ? fill(dict.catalog.resultsFor, { query: query.q }) : dict.catalog.title}
        text={fill(dict.catalog.fromBoth, { count: countProducts(total, dict) })}
      />
      <div className="shell flex flex-wrap items-center gap-2 pb-6">
        {(
          [
            ["all", dict.catalog.all],
            ["treco", dict.nav.technology],
            ["tremark", dict.nav.home],
          ] as const
        ).map(([value, label]) => (
          <Link
            key={value}
            href={catalogHref({ ...query, source: value, page: 1 })}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              query.source === value ? "bg-ink text-paper" : "bg-surface",
            )}
          >
            {label}
          </Link>
        ))}
        <span className="mx-2 hidden h-6 w-px bg-ink/10 sm:inline" />
        {(
          [
            ["name", dict.catalog.sortName],
            ["price-asc", dict.catalog.sortPriceAsc],
            ["price-desc", dict.catalog.sortPriceDesc],
          ] as const
        ).map(([value, label]) => (
          <Link
            key={value}
            href={catalogHref({ ...query, sort: value, page: 1 })}
            className={cn(
              "rounded-full px-4 py-2 text-sm",
              query.sort === value ? "bg-tech text-cream" : "bg-surface",
            )}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="shell pb-8">
        <ProductGrid products={visible} />
        <Pagination page={page} pages={pages} hrefFor={(nextPage) => catalogHref({ ...query, page: nextPage })} />
      </div>
    </>
  );
}
