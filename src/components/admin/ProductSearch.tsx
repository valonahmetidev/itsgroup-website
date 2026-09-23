"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { adminBrowseProducts, adminSearchProducts, type AdminCategoryFilter } from "@/app/admin/actions";
import type { AdminProductListItem } from "@/app/admin/actions";
import { AdminProductCard } from "@/components/admin/AdminProductCard";
import { useLocale } from "@/components/LocaleProvider";
import { categoryDisplayName } from "@/lib/i18n/catalog-labels";
import { cn } from "@/lib/cn";
import { catalogSourceName } from "@/lib/source-labels";
import { useDebouncedValue } from "@/lib/use-debounced-value";
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

function toCategoryFilter(item: AdminCategoryOption | null): AdminCategoryFilter {
  return item ? { source: item.source, slug: item.slug } : null;
}

export function ProductSearch({ categories }: { categories: AdminCategoryOption[] }) {
  const { dict, locale } = useLocale();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 320);
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
  const typing = query.trim() !== debouncedQuery.trim();

  const visibleCategories = useMemo(
    () => categories.filter((item) => source === "all" || item.source === source),
    [categories, source],
  );

  const groupedCategories = useMemo(() => {
    const groups = new Map<Source, AdminCategoryOption[]>();
    for (const item of visibleCategories) {
      const list = groups.get(item.source) ?? [];
      list.push(item);
      groups.set(item.source, list);
    }
    return groups;
  }, [visibleCategories]);

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
    activeQueryRef.current = debouncedQuery;
    activeSourceRef.current = source;
    activeCategoryRef.current = nextCategory;
    void loadPage(debouncedQuery, source, nextCategory, 0, false);
  }, [source, selectedCategoryKey, debouncedQuery, loadPage, category]);

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

  const showSpinner = loading || typing;

  return (
    <div className="space-y-5">
      <label className="relative block">
        <span className="sr-only">{dict.admin.search}</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
        {showSpinner && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink/35" />
        )}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={dict.admin.searchPlaceholder}
          className="w-full rounded-2xl border border-ink/10 bg-surface py-3 pl-11 pr-11 text-sm outline-none transition focus:border-tech"
        />
      </label>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium",
              source === filter.value ? "bg-ink text-paper" : "bg-surface hover:bg-ink/5",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
          {dict.admin.categoryFilter}
        </span>
        <select
          value={selectedCategoryKey}
          onChange={(event) => {
            const key = event.target.value;
            if (key === "all") {
              setCategory(null);
              return;
            }
            const match = visibleCategories.find((item) => categoryKey(item) === key);
            setCategory(match ?? null);
          }}
          className="w-full rounded-2xl border border-ink/10 bg-surface px-4 py-3 text-sm outline-none transition focus:border-tech"
        >
          <option value="all">{dict.admin.allCategories}</option>
          {source === "all"
            ? (["treco", "tremark", "its"] as Source[]).map((groupSource) => {
                const items = groupedCategories.get(groupSource);
                if (!items?.length) return null;
                return (
                  <optgroup key={groupSource} label={catalogSourceName(groupSource)}>
                    {items.map((item) => (
                      <option key={categoryKey(item)} value={categoryKey(item)}>
                        {categoryDisplayName(item, locale)}
                      </option>
                    ))}
                  </optgroup>
                );
              })
            : visibleCategories.map((item) => (
                <option key={categoryKey(item)} value={categoryKey(item)}>
                  {categoryDisplayName(item, locale)}
                </option>
              ))}
        </select>
      </label>

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
        <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
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
