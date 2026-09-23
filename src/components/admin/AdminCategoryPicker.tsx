"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import type { AdminCategoryOption } from "@/components/admin/ProductSearch";
import { useLocale } from "@/components/LocaleProvider";
import { categoryDisplayName } from "@/lib/i18n/catalog-labels";
import { cn } from "@/lib/cn";
import { catalogSourceName } from "@/lib/source-labels";
import type { Source } from "@/lib/types";

function categoryKey(category: AdminCategoryOption | null) {
  return category ? `${category.source}:${category.slug}` : "all";
}

export function AdminCategoryPicker({
  categories,
  source,
  value,
  onChange,
}: {
  categories: AdminCategoryOption[];
  source: "all" | Source;
  value: AdminCategoryOption | null;
  onChange: (category: AdminCategoryOption | null) => void;
}) {
  const { dict, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const visibleCategories = useMemo(
    () => categories.filter((item) => source === "all" || item.source === source),
    [categories, source],
  );

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedSearch) return visibleCategories;
    return visibleCategories.filter((item) => {
      const label = categoryDisplayName(item, locale).toLowerCase();
      const mk = categoryDisplayName(item, "mk").toLowerCase();
      const sq = categoryDisplayName(item, "sq").toLowerCase();
      return (
        label.includes(normalizedSearch) ||
        mk.includes(normalizedSearch) ||
        sq.includes(normalizedSearch) ||
        item.slug.includes(normalizedSearch)
      );
    });
  }, [visibleCategories, normalizedSearch, locale]);

  const grouped = useMemo(() => {
    const groups = new Map<Source, AdminCategoryOption[]>();
    for (const item of filteredCategories) {
      const list = groups.get(item.source) ?? [];
      list.push(item);
      groups.set(item.source, list);
    }
    return groups;
  }, [filteredCategories]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const sources: Source[] = source === "all" ? ["treco", "tremark", "its", "alevado"] : [source];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-ink/10 bg-surface px-3 py-2 text-left text-sm outline-none transition focus:border-tech"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={cn("min-w-0 truncate", !value && "text-ink/55")}>
          {value ? categoryDisplayName(value, locale) : dict.admin.allCategories}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink/40 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-lift">
          <div className="border-b border-ink/10 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
              <input
                ref={searchRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={dict.admin.searchCategoryPlaceholder}
                className="w-full rounded-xl border border-ink/10 bg-surface py-2.5 pl-9 pr-9 text-sm outline-none focus:border-tech"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink/40 hover:bg-ink/5 hover:text-ink"
                  aria-label={dict.catalog.clearFilters}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2" role="listbox">
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={cn(
                "flex w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-surface",
                !value && "bg-tech/10 font-semibold text-tech",
              )}
            >
              {dict.admin.allCategories}
            </button>

            {filteredCategories.length === 0 ? (
              <p className="px-3 py-4 text-sm text-ink/50">{dict.admin.noCategories}</p>
            ) : (
              sources.map((groupSource) => {
                const items = grouped.get(groupSource);
                if (!items?.length) return null;
                return (
                  <div key={groupSource} className="mt-2">
                    {source === "all" && (
                      <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                        {catalogSourceName(groupSource)}
                      </p>
                    )}
                    {items.map((item) => {
                      const selected = categoryKey(value) === categoryKey(item);
                      return (
                        <button
                          key={categoryKey(item)}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => {
                            onChange(item);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex w-full rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-surface",
                            selected && "bg-tech/10 font-semibold text-tech",
                          )}
                        >
                          {categoryDisplayName(item, locale)}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
