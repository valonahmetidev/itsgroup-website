"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { adminBrowseProducts, adminSearchProducts, type AdminCategoryFilter } from "@/app/admin/actions";
import type { AdminProductListItem } from "@/app/admin/actions";
import { AdminCategoryPicker } from "@/components/admin/AdminCategoryPicker";
import { AdminProductCard } from "@/components/admin/AdminProductCard";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { Source } from "@/lib/types";

type SourceFilter = "all" | Source;

export type AdminCategoryOption = {
  source: Source;
  slug: string;
  name: string;
};

const PAGE_SIZE = 24;

const pillClass = "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:px-3 sm:py-1.5 sm:text-sm";

function categoryKey(category: AdminCategoryOption | null) {
  return category ? `${category.source}:${category.slug}` : "all";
}

function toCategoryFilter(item: AdminCategoryOption | null): AdminCategoryFilter {
  return item ? { source: item.source, slug: item.slug } : null;
}

export function ProductSearch({
  categories,
  initialEditedOnly = false,
}: {
  categories: AdminCategoryOption[];
  initialEditedOnly?: boolean;
}) {
  const router = useRouter();
  const { dict } = useLocale();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 320);
  const [source, setSource] = useState<SourceFilter>("all");
  const [editedOnly, setEditedOnly] = useState(initialEditedOnly);
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
  const activeEditedOnlyRef = useRef(initialEditedOnly);
  const requestRef = useRef(0);

  useEffect(() => {
    setEditedOnly(initialEditedOnly);
  }, [initialEditedOnly]);

  const selectedCategoryKey = categoryKey(category);
  const typing = query.trim() !== debouncedQuery.trim();

  const loadPage = useCallback(
    async (
      nextQuery: string,
      nextSource: SourceFilter,
      nextCategory: AdminCategoryFilter,
      nextEditedOnly: boolean,
      offset: number,
      append: boolean,
    ) => {
      if (offset === 0) setLoading(true);
      else setLoadingMore(true);

      const requestId = ++requestRef.current;
      const response = nextQuery.trim().length >= 2
        ? await adminSearchProducts(nextQuery, nextSource, offset, PAGE_SIZE, nextCategory, nextEditedOnly)
        : await adminBrowseProducts(nextSource, offset, PAGE_SIZE, nextCategory, nextEditedOnly);

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
    activeEditedOnlyRef.current = editedOnly;
    void loadPage(debouncedQuery, source, nextCategory, editedOnly, 0, false);
  }, [source, selectedCategoryKey, debouncedQuery, loadPage, category, editedOnly]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (editedOnly) params.set("edited", "1");
    const next = params.toString();
    router.replace(next ? `/admin/products?${next}` : "/admin/products", { scroll: false });
  }, [editedOnly, router]);

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
          activeEditedOnlyRef.current,
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
    { value: "alevado", label: dict.catalog.alevadoProducts },
    { value: "its", label: "ITS" },
  ];

  const showSpinner = loading || typing;

  return (
    <div className="space-y-3">
      <div className="space-y-2.5 rounded-xl border border-ink/10 bg-card p-3">
        <label className="relative block">
          <span className="sr-only">{dict.admin.search}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          {showSpinner && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink/35" />
          )}
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dict.admin.searchPlaceholder}
            className="w-full rounded-xl border border-ink/10 bg-surface py-2 pl-9 pr-9 text-sm outline-none transition focus:border-tech"
          />
        </label>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEditedOnly((current) => !current)}
            className={cn(pillClass, editedOnly ? "bg-home text-white" : "bg-surface hover:bg-ink/5")}
          >
            {dict.admin.overrides}
          </button>
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
                pillClass,
                source === filter.value ? "bg-ink text-paper" : "bg-surface hover:bg-ink/5",
              )}
            >
              {filter.label}
            </button>
          ))}
          {!loading && total > 0 && (
            <span className="ml-auto text-xs text-ink/45">
              {results.length} / {total}
            </span>
          )}
        </div>

        <AdminCategoryPicker
          categories={categories}
          source={source}
          value={category}
          onChange={setCategory}
        />
      </div>

      {loading ? (
        <p className="text-sm text-ink/55">{dict.admin.loadingProducts}</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-ink/55">{dict.admin.noProducts}</p>
      ) : (
        <div className="grid gap-2 lg:grid-cols-2">
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
