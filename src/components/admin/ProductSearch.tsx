"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminBrowseProducts, adminSearchProducts, type AdminCategoryFilter } from "@/app/admin/actions";
import type { AdminProductListItem } from "@/app/admin/actions";
import { AdminProductCard } from "@/components/admin/AdminProductCard";
import { useLocale } from "@/components/LocaleProvider";
import { categoryDisplayName } from "@/lib/i18n/catalog-labels";
import { cn } from "@/lib/cn";
import type { Source } from "@/lib/types";

type SourceFilter = "all" | Source;

export type AdminCategoryOption = {
  source: Source;
  slug: string;
  name: string;
};

const PAGE_SIZE = 24;

function categoryKey(category: AdminCategoryOption | null) {
  return category ? `${category.source}:${category.slug}` : "all";
}

export function ProductSearch({ categories }: { categories: AdminCategoryOption[] }) {
  const { dict, locale } = useLocale();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [category, setCategory] = useState<AdminCategoryOption | null>(null);
  const [results, setResults] = useState<AdminProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const activeQueryRef = useRef("");
  const activeSourceRef = useRef<SourceFilter>("all");
  const activeCategoryRef = useRef<AdminCategoryFilter>(null);
  const requestRef = useRef(0);

  const selectedCategoryKey = categoryKey(category);

  const visibleCategories = categories.filter((item) => source === "all" || item.source === source);

  function toCategoryFilter(item: AdminCategoryOption | null): AdminCategoryFilter {
    return item ? { source: item.source, slug: item.slug } : null;
  }

  const loadPage = useCallback(
    async (
      nextQuery: string,
      nextSource: SourceFilter,
      nextCategory: AdminCategoryFilter,
      offset: number,
      append: boolean,
    ) => {
      if (offset === 0) setLoading(true);
      else setLoadingMore(true);

      const requestId = ++requestRef.current;
      const response = nextQuery.trim().length >= 2
        ? await adminSearchProducts(nextQuery, nextSource, offset, PAGE_SIZE, nextCategory)
        : await adminBrowseProducts(nextSource, offset, PAGE_SIZE, nextCategory);

      if (requestId !== requestRef.current) return;

      setResults((current) => (append ? [...current, ...response.items] : response.items));
      setHasMore(response.hasMore);
      setTotal(response.total);
      setLoading(false);
      setLoadingMore(false);
    },
    [],
  );

  useEffect(() => {
    const nextCategory = toCategoryFilter(category);
    activeQueryRef.current = "";
    activeSourceRef.current = source;
    activeCategoryRef.current = nextCategory;
    void loadPage("", source, nextCategory, 0, false);
  }, [source, selectedCategoryKey, category, loadPage]);

  async function search(event: React.FormEvent) {
    event.preventDefault();
    activeQueryRef.current = query;
    activeSourceRef.current = source;
    activeCategoryRef.current = toCategoryFilter(category);
    await loadPage(query, source, toCategoryFilter(category), 0, false);
  }

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        void loadPage(
          activeQueryRef.current,
          activeSourceRef.current,
          activeCategoryRef.current,
          results.length,
          true,
        );
      },
      { rootMargin: "240px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadPage, results.length]);

  const filters: { value: SourceFilter; label: string }[] = [
    { value: "all", label: dict.catalog.all },
    { value: "treco", label: "Treco" },
    { value: "tremark", label: "Tremark" },
    { value: "its", label: "ITS" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setSource(filter.value);
              if (category && filter.value !== "all" && category.source !== filter.value) {
                setCategory(null);
              }
            }}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              source === filter.value ? "bg-ink text-paper" : "bg-surface hover:bg-ink/5",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{dict.admin.categoryFilter}</p>
        <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-ink/10 bg-surface p-3">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium",
              !category ? "bg-ink text-paper" : "bg-card hover:bg-paper",
            )}
          >
            {dict.admin.allCategories}
          </button>
          {visibleCategories.map((item) => (
            <button
              key={categoryKey(item)}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium",
                categoryKey(category) === categoryKey(item) ? "bg-ink text-paper" : "bg-card hover:bg-paper",
              )}
            >
              {categoryDisplayName(item, locale)}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={search} className="flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={dict.admin.searchPlaceholder}
          className="min-w-[16rem] flex-1 rounded-2xl border border-ink/10 bg-surface px-4 py-3 outline-none focus:border-tech"
        />
        <button type="submit" disabled={loading} className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper">
          {dict.admin.search}
        </button>
      </form>

      {!loading && total > 0 && (
        <p className="text-sm text-ink/55">
          {results.length} / {total}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink/55">{dict.admin.loadingProducts}</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-ink/55">{dict.admin.noProducts}</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {results.map((product) => (
            <AdminProductCard key={`${product.source}-${product.id}`} product={product} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
      {loadingMore && <p className="text-sm text-ink/55">{dict.admin.loadMore}</p>}
    </div>
  );
}
