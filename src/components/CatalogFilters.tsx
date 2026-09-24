"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import type { Dictionary } from "@/lib/i18n";
import { formatCount } from "@/lib/format";
import {
  getActiveCatalogFilterChips,
  hasVisibleActiveFilters,
  type ParsedCatalogQuery,
} from "@/lib/catalog-filters";
import { cn } from "@/lib/cn";

type PillOption<T extends string> = { value: T; label: string };

function FilterPills<T extends string>({
  label,
  value,
  options,
  hrefFor,
}: {
  label: string;
  value: T;
  options: PillOption<T>[];
  hrefFor: (next: T) => string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Link
            key={option.value}
            href={hrefFor(option.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              value === option.value ? "bg-ink text-paper" : "bg-surface hover:bg-ink/5",
            )}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function CatalogFilterFields({
  query,
  hrefFor,
  priceBounds,
  showSource,
  minValue,
  maxValue,
  setMinValue,
  setMaxValue,
  onApplyPriceRange,
}: {
  query: ParsedCatalogQuery;
  hrefFor: (next: Partial<ParsedCatalogQuery>) => string;
  priceBounds: { min: number; max: number } | null;
  showSource: boolean;
  minValue: string;
  maxValue: string;
  setMinValue: (value: string) => void;
  setMaxValue: (value: string) => void;
  onApplyPriceRange: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const { dict } = useLocale();

  return (
    <div className="space-y-4">
      {showSource && (
        <FilterPills
          label={dict.catalog.sourceLabel}
          value={query.division}
          options={[
            { value: "all", label: dict.catalog.all },
            { value: "technology", label: dict.nav.technology },
            { value: "home", label: dict.nav.home },
            { value: "its", label: dict.catalog.itsProducts },
            { value: "cables", label: dict.catalog.alevadoProducts },
          ]}
          hrefFor={(division) => hrefFor({ division, page: 1 })}
        />
      )}

      <FilterPills
        label={dict.catalog.stockLabel}
        value={query.stock}
        options={[
          { value: "all", label: dict.catalog.stockAll },
          { value: "in", label: dict.catalog.stockIn },
          { value: "out", label: dict.catalog.stockOut },
        ]}
        hrefFor={(stock) => hrefFor({ stock, page: 1 })}
      />

      <FilterPills
        label={dict.catalog.saleLabel}
        value={query.sale}
        options={[
          { value: "all", label: dict.catalog.saleAll },
          { value: "yes", label: dict.catalog.saleYes },
          { value: "no", label: dict.catalog.saleNo },
        ]}
        hrefFor={(sale) => hrefFor({ sale, page: 1 })}
      />

      <FilterPills
        label={dict.catalog.priceTypeLabel}
        value={query.priceType}
        options={[
          { value: "all", label: dict.catalog.priceTypeAll },
          { value: "priced", label: dict.catalog.priceTypePriced },
          { value: "on-request", label: dict.catalog.priceTypeOnRequest },
        ]}
        hrefFor={(priceType) => hrefFor({ priceType, page: 1 })}
      />

      <form className="space-y-2" onSubmit={onApplyPriceRange}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{dict.catalog.priceRange}</p>
        {priceBounds && (
          <p className="text-sm text-ink/50">
            {dict.catalog.priceRangeHint}: {formatCount(priceBounds.min)} – {formatCount(priceBounds.max)}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-ink/60">{dict.catalog.priceMin}</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={minValue}
              onChange={(event) => setMinValue(event.target.value)}
              placeholder={priceBounds ? String(priceBounds.min) : "0"}
              className="w-full rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none transition focus:border-tech"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-ink/60">{dict.catalog.priceMax}</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={maxValue}
              onChange={(event) => setMaxValue(event.target.value)}
              placeholder={priceBounds ? String(priceBounds.max) : "0"}
              className="w-full rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none transition focus:border-tech"
            />
          </label>
        </div>
        <button type="submit" className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream">
          {dict.catalog.applyFilters}
        </button>
      </form>

      <FilterPills
        label={dict.catalog.sortLabel}
        value={query.sort}
        options={[
          { value: "name", label: dict.catalog.sortName },
          { value: "price-asc", label: dict.catalog.sortPriceAsc },
          { value: "price-desc", label: dict.catalog.sortPriceDesc },
        ]}
        hrefFor={(sort) => hrefFor({ sort, page: 1 })}
      />
    </div>
  );
}

function activeFilterLabel(id: string, query: ParsedCatalogQuery, dict: Dictionary) {
  switch (id) {
    case "division":
      if (query.division === "technology") return dict.nav.technology;
      if (query.division === "home") return dict.nav.home;
      if (query.division === "its") return dict.catalog.itsProducts;
      if (query.division === "cables") return dict.catalog.alevadoProducts;
      return dict.catalog.all;
    case "stock":
      return query.stock === "in" ? dict.catalog.stockIn : dict.catalog.stockOut;
    case "sale":
      return query.sale === "yes" ? dict.catalog.saleYes : dict.catalog.saleNo;
    case "priceType":
      return query.priceType === "priced" ? dict.catalog.priceTypePriced : dict.catalog.priceTypeOnRequest;
    case "priceRange": {
      const min = query.min !== undefined ? formatCount(query.min) : null;
      const max = query.max !== undefined ? formatCount(query.max) : null;
      if (min && max) return `${dict.catalog.priceMin} ${min} – ${dict.catalog.priceMax} ${max}`;
      if (min) return `${dict.catalog.priceMin} ${min}`;
      if (max) return `${dict.catalog.priceMax} ${max}`;
      return dict.catalog.priceRange;
    }
    case "sort":
      return query.sort === "price-asc" ? dict.catalog.sortPriceAsc : dict.catalog.sortPriceDesc;
    default:
      return id;
  }
}

export function ActiveCatalogFilters({
  query,
  hrefFor,
  showSource = true,
  className,
}: {
  query: ParsedCatalogQuery;
  hrefFor: (next: Partial<ParsedCatalogQuery>) => string;
  showSource?: boolean;
  className?: string;
}) {
  const { dict } = useLocale();
  const chips = getActiveCatalogFilterChips(query, { showDivision: showSource });

  if (chips.length === 0) return null;

  const clearHref = hrefFor({
    division: showSource ? "all" : query.division,
    stock: "all",
    sale: "all",
    priceType: "all",
    min: undefined,
    max: undefined,
    sort: "name",
    page: 1,
  });

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {chips.map((chip) => (
        <Link
          key={chip.id}
          href={hrefFor(chip.patch)}
          className="inline-flex items-center gap-1.5 rounded-full border border-tech/20 bg-tech/10 px-3 py-1.5 text-sm font-medium text-tech transition hover:border-tech/35 hover:bg-tech/15"
          aria-label={`${dict.catalog.clearFilters}: ${activeFilterLabel(chip.id, query, dict)}`}
        >
          <span>{activeFilterLabel(chip.id, query, dict)}</span>
          <X className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        </Link>
      ))}
      <Link href={clearHref} className="text-sm font-semibold text-ink/50 transition hover:text-tech">
        {dict.catalog.clearFilters}
      </Link>
    </div>
  );
}

export function CatalogFilters({
  query,
  hrefFor,
  priceBounds,
  showSource = true,
  hideDesktopSidebar = false,
}: {
  query: ParsedCatalogQuery;
  hrefFor: (next: Partial<ParsedCatalogQuery>) => string;
  priceBounds: { min: number; max: number } | null;
  showSource?: boolean;
  hideDesktopSidebar?: boolean;
}) {
  const router = useRouter();
  const { dict } = useLocale();
  const [minValue, setMinValue] = useState(query.min?.toString() ?? "");
  const [maxValue, setMaxValue] = useState(query.max?.toString() ?? "");
  const active = hasVisibleActiveFilters(query, { showDivision: showSource });

  function applyPriceRange(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rawMin = minValue.trim() ? Math.max(0, Math.round(Number(minValue))) : undefined;
    const rawMax = maxValue.trim() ? Math.max(0, Math.round(Number(maxValue))) : undefined;
    const min = Number.isFinite(rawMin) ? rawMin : undefined;
    const max = Number.isFinite(rawMax) ? rawMax : undefined;
    const dropEmptyRange = min === 0 && max === 0;
    router.push(
      hrefFor({
        min: dropEmptyRange ? undefined : min,
        max: dropEmptyRange ? undefined : max,
        page: 1,
      }),
    );
  }

  const fields = (
    <CatalogFilterFields
      query={query}
      hrefFor={hrefFor}
      priceBounds={priceBounds}
      showSource={showSource}
      minValue={minValue}
      maxValue={maxValue}
      setMinValue={setMinValue}
      setMaxValue={setMaxValue}
      onApplyPriceRange={applyPriceRange}
    />
  );

  const clearHref = hrefFor({
    stock: "all",
    sale: "all",
    priceType: "all",
    min: undefined,
    max: undefined,
    page: 1,
  });

  return (
    <>
      <details className="group rounded-3xl border border-ink/10 bg-card shadow-sm lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl">{dict.catalog.filters}</h2>
            {active && (
              <span className="rounded-full bg-tech/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-tech">
                •
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-ink/45 transition group-open:rotate-180" />
        </summary>
        <div className="space-y-5 border-t border-ink/10 px-5 pb-5 pt-4">
          {active && (
            <Link href={clearHref} className="inline-block text-sm font-semibold text-tech">
              {dict.catalog.clearFilters}
            </Link>
          )}
          {fields}
        </div>
      </details>

      <aside
        className={cn(
          "hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:self-start",
          hideDesktopSidebar && "lg:hidden",
        )}
      >
        <div className="flex max-h-[calc(100dvh-6rem)] flex-col overflow-hidden rounded-3xl border border-ink/10 bg-card shadow-sm">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
            <h2 className="font-display text-xl">{dict.catalog.filters}</h2>
            {active && (
              <Link href={clearHref} className="text-sm font-semibold text-tech">
                {dict.catalog.clearFilters}
              </Link>
            )}
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5">
            {fields}
          </div>
        </div>
      </aside>
    </>
  );
}
