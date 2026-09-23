"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { findProducts } from "@/app/actions";
import { CatalogImage } from "@/components/CatalogImage";
import { useCurrency } from "@/components/CurrencyProvider";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import { catalogHref } from "@/lib/format";

type Result = {
  key: string;
  href: string;
  name: string;
  priceMkd: number | null;
  division: string;
  image: string | null;
  inStock: boolean;
};

export function SearchBox({
  onNavigate,
  expandable = false,
}: {
  onNavigate?: () => void;
  expandable?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { dict } = useLocale();
  const { formatPrice } = useCurrency();
  const onAdmin = pathname.startsWith("/admin");
  const rootRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);
  const [expanded, setExpanded] = useState(!expandable);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (expanded) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(timer);
    }
  }, [expanded]);

  useEffect(() => {
    if (!expandable || !expanded || onAdmin) {
      document.body.style.removeProperty("overflow");
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [expanded, expandable, onAdmin]);

  useEffect(() => {
    setExpanded(expandable ? false : true);
    setQuery("");
    setResults([]);
    setOpen(false);
    setActiveIndex(-1);
    document.body.style.removeProperty("overflow");
  }, [pathname, expandable]);

  useEffect(() => {
    const cleaned = query.trim();
    if (cleaned.length < 2) {
      setResults([]);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    const requestId = ++requestRef.current;
    setLoading(true);
    const handle = window.setTimeout(() => {
      void findProducts(cleaned).then((items) => {
        if (requestRef.current !== requestId) return;
        setResults(items);
        setLoading(false);
        setActiveIndex(items.length > 0 ? 0 : -1);
        setOpen(true);
      });
    }, 220);

    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (!open && !expanded) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (expandable && expanded) {
          collapse();
          return;
        }
        setOpen(false);
        return;
      }

      if (!results.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((current) => (current + 1) % results.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
      } else if (event.key === "Enter" && activeIndex >= 0 && activeIndex < results.length) {
        event.preventDefault();
        navigate();
        router.push(results[activeIndex].href);
      }
    }

    function onPointer(event: PointerEvent) {
      if (!expandable && !formRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, expanded, expandable, query, results, activeIndex, router]);

  useEffect(() => {
    if (!listRef.current || activeIndex < 0) return;
    const active = listRef.current.querySelector(`[data-search-index="${activeIndex}"]`);
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  function close() {
    setOpen(false);
    setActiveIndex(-1);
  }

  function navigate() {
    close();
    if (expandable) setExpanded(false);
    onNavigate?.();
  }

  function collapse() {
    setQuery("");
    setResults([]);
    close();
    setExpanded(false);
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const cleaned = query.trim();
    if (!cleaned) return;
    if (activeIndex >= 0 && activeIndex < results.length) {
      navigate();
      router.push(results[activeIndex].href);
      return;
    }
    navigate();
    router.push(catalogHref({ q: cleaned }));
  }

  const cleaned = query.trim();
  const showPanel = open && cleaned.length >= 2;
  const hasResults = results.length > 0;

  if (expandable && !expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-surface hover:bg-paper"
        aria-label={dict.search.label}
      >
        <Search className="h-4 w-4 text-ink/60" />
      </button>
    );
  }

  const modalSearch = expandable && expanded;

  if (modalSearch) {
    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto px-4 pb-8 pt-[12vh] sm:px-5 sm:pt-[14vh]">
        <button
          type="button"
          className="search-backdrop fixed inset-0 bg-ink/55"
          aria-label="Close"
          onClick={collapse}
        />
        <div ref={rootRef} className="search-modal relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-lift">
          <form onSubmit={submitSearch}>
            <label className="sr-only" htmlFor="catalog-search-expand">{dict.search.label}</label>
            <div className="flex items-center gap-2 border-b border-ink/10 px-3 py-3">
              <Search className="h-4 w-4 shrink-0 text-ink/40" />
              <input
                ref={inputRef}
                id="catalog-search-expand"
                value={query}
                onChange={(event) => {
                  const next = event.target.value;
                  setQuery(next);
                  if (next.trim().length < 2) close();
                  else setOpen(true);
                }}
                onFocus={() => {
                  if (cleaned.length >= 2) setOpen(true);
                }}
                placeholder={dict.search.placeholder}
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-base outline-none sm:text-sm"
              />
              {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink/35" />}
              <button
                type="button"
                onClick={collapse}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/45 transition hover:bg-paper hover:text-ink"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </form>

          {cleaned.length >= 2 && (
            <div
              ref={listRef}
              className="search-panel max-h-[min(58vh,26rem)] overflow-x-hidden overflow-y-auto"
            >
              {loading && !hasResults && (
                <p className="px-4 py-4 text-sm text-ink/55">{dict.search.loading}</p>
              )}
              {!loading && !hasResults && (
                <p className="px-4 py-4 text-sm text-ink/55">{dict.search.noResults}</p>
              )}
              {hasResults &&
                results.map((result, index) => (
                  <Link
                    key={result.key}
                    href={result.href}
                    data-search-index={index}
                    onClick={navigate}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      "flex items-center gap-3 border-b border-ink/5 px-3 py-2.5 transition last:border-b-0",
                      index === activeIndex ? "bg-paper" : "hover:bg-paper",
                    )}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface">
                      {result.image ? (
                        <CatalogImage src={result.image} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-ink/40">{dict.product.placeholderInitials}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1 overflow-hidden">
                      <span className="block truncate text-sm font-medium leading-snug">{result.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-ink/50">
                        {result.division} · {formatPrice(result.priceMkd)}
                        {!result.inStock ? ` · ${dict.product.checkStock}` : ""}
                      </span>
                    </span>
                  </Link>
                ))}
              {!loading && (
                <Link
                  href={catalogHref({ q: cleaned })}
                  onClick={navigate}
                  className="block border-t border-ink/10 px-4 py-3 text-sm font-semibold text-tech"
                >
                  {hasResults ? dict.search.allResults : dict.search.searchCatalog}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>,
      document.body,
    );
  }

  return (
    <form ref={formRef} className="relative" onSubmit={submitSearch}>
      <label className="sr-only" htmlFor="catalog-search">{dict.search.label}</label>
      <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-surface px-3 py-1.5 transition focus-within:border-tech/50 focus-within:ring-2 focus-within:ring-tech/15">
        <Search className="h-4 w-4 shrink-0 text-ink/40" />
        <input
          ref={inputRef}
          id="catalog-search"
          value={query}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            if (next.trim().length < 2) close();
            else setOpen(true);
          }}
          onFocus={() => {
            if (cleaned.length >= 2) setOpen(true);
          }}
          placeholder={dict.search.placeholder}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm outline-none"
        />
        {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink/35" />}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              close();
              inputRef.current?.focus();
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink/45 hover:bg-paper hover:text-ink"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {showPanel && (
        <div
          ref={listRef}
          className="absolute right-0 top-[calc(100%+10px)] z-50 max-h-[min(70vh,28rem)] w-[min(28rem,calc(100vw-1.5rem))] overflow-x-hidden overflow-y-auto rounded-2xl border border-ink/10 bg-card shadow-lift"
        >
          {loading && !hasResults && (
            <p className="px-4 py-4 text-sm text-ink/55">{dict.search.loading}</p>
          )}
          {!loading && !hasResults && (
            <p className="px-4 py-4 text-sm text-ink/55">{dict.search.noResults}</p>
          )}
          {hasResults &&
            results.map((result, index) => (
              <Link
                key={result.key}
                href={result.href}
                data-search-index={index}
                onClick={navigate}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 transition",
                  index === activeIndex ? "bg-paper" : "hover:bg-paper",
                )}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-paper">
                  {result.image ? (
                    <CatalogImage src={result.image} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-ink/40">{dict.product.placeholderInitials}</span>
                  )}
                </span>
                <span className="min-w-0 flex-1 overflow-hidden">
                  <span className="block truncate text-sm font-medium leading-snug">{result.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-ink/50">
                    {result.division} · {formatPrice(result.priceMkd)}
                    {!result.inStock ? ` · ${dict.product.checkStock}` : ""}
                  </span>
                </span>
              </Link>
            ))}
          {!loading && cleaned.length >= 2 && (
            <Link
              href={catalogHref({ q: cleaned })}
              onClick={navigate}
              className="block border-t border-ink/10 px-4 py-3 text-sm font-semibold text-tech"
            >
              {hasResults ? dict.search.allResults : dict.search.searchCatalog}
            </Link>
          )}
        </div>
      )}
    </form>
  );
}
