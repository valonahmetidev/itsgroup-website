"use client";

import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ActiveCatalogFilters, CatalogFilters } from "@/components/CatalogFilters";
import { hasVisibleActiveFilters } from "@/lib/catalog-filters";
import { Pagination } from "@/components/Pagination";
import { ProductGrid } from "@/components/ProductCard";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import type { ParsedCatalogQuery } from "@/lib/catalog-filters";
import type { Product } from "@/lib/types";

const STORAGE_KEY = "itsgroup-catalog-filters";

export function CatalogProductsSection({
  query,
  priceBounds,
  hrefFor,
  showSource = true,
  page,
  pages,
  visible,
  className,
}: {
  query: ParsedCatalogQuery;
  priceBounds: { min: number; max: number } | null;
  hrefFor: (next: Partial<ParsedCatalogQuery>) => string;
  showSource?: boolean;
  page: number;
  pages: number;
  visible: Product[];
  className?: string;
}) {
  const { dict } = useLocale();
  const [filtersVisible, setFiltersVisible] = useState(true);
  const activeFilters = hasVisibleActiveFilters(query, { showSource });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "false") setFiltersVisible(false);
  }, []);

  function toggleFilters() {
    setFiltersVisible((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <div
      className={cn(
        "grid gap-6 lg:items-start",
        filtersVisible && "lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]",
        className,
      )}
    >
      <CatalogFilters
        query={query}
        priceBounds={priceBounds}
        showSource={showSource}
        hrefFor={hrefFor}
        hideDesktopSidebar={!filtersVisible}
      />

      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggleFilters}
            className="hidden items-center gap-2 rounded-full border border-ink/10 bg-surface px-4 py-2 text-sm font-semibold transition hover:border-tech hover:text-tech lg:inline-flex"
          >
            {filtersVisible ? (
              <>
                <PanelLeftClose className="h-4 w-4" />
                {dict.catalog.hideFilters}
              </>
            ) : (
              <>
                <PanelLeftOpen className="h-4 w-4" />
                {dict.catalog.showFilters}
              </>
            )}
          </button>

          {activeFilters && (
            <ActiveCatalogFilters
              query={query}
              hrefFor={hrefFor}
              showSource={showSource}
              className={cn(filtersVisible && "lg:hidden")}
            />
          )}
        </div>

        <ProductGrid products={visible} wide={!filtersVisible} />
        <Pagination page={page} pages={pages} hrefFor={(nextPage) => hrefFor({ page: nextPage })} />
      </div>
    </div>
  );
}
