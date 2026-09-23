"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, CheckSquare, Loader2, Pencil, Plus, Search, Trash2, XCircle } from "lucide-react";
import {
  adminRemoveCustomerProductDiscount,
  adminSaveCustomer,
  adminSaveCustomerProductDiscount,
  adminSaveCustomerProductDiscounts,
  adminSearchProducts,
  type AdminProductListItem,
} from "@/app/admin/actions";
import type { CustomerDiscountView, CustomerRow } from "@/app/admin/actions";
import { CatalogImage } from "@/components/CatalogImage";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { catalogSourceName, sourceLabels } from "@/lib/source-labels";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { Source } from "@/lib/types";

function productKey(source: Source, id: string | number) {
  return `${source}-${id}`;
}

type Tab = "details" | "discounts";

export function CustomerEditForm({
  customer,
  discounts,
}: {
  customer: CustomerRow;
  discounts: CustomerDiscountView[];
}) {
  const router = useRouter();
  const { dict, locale } = useLocale();
  const [tab, setTab] = useState<Tab>("details");
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email);
  const [password, setPassword] = useState("");
  const [generalDiscount, setGeneralDiscount] = useState(customer.discount_percent?.toString() ?? "");
  const [active, setActive] = useState(customer.active === 1);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 320);
  const [results, setResults] = useState<AdminProductListItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("10");
  const [discountValues, setDiscountValues] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("");
  const [adding, setAdding] = useState(false);

  const discountedKeys = useMemo(
    () => new Set(discounts.map((row) => productKey(row.source as Source, row.product_id))),
    [discounts],
  );

  const selectableResults = useMemo(
    () => results.filter((product) => !discountedKeys.has(productKey(product.source, product.id))),
    [results, discountedKeys],
  );

  useEffect(() => {
    setDiscountValues(
      Object.fromEntries(
        discounts.map((row) => [`${row.source}-${row.product_id}`, String(row.discount_percent)]),
      ),
    );
  }, [discounts]);

  async function saveCustomer() {
    const result = await adminSaveCustomer({
      id: customer.id,
      name,
      email,
      password,
      generalDiscount,
      active,
    });
    setStatus(result.ok ? dict.admin.saveDone : dict.admin.saveError);
    router.refresh();
  }

  useEffect(() => {
    const cleaned = debouncedQuery.trim();
    if (cleaned.length < 2) {
      setResults([]);
      setSearched(false);
      setSelected(new Set());
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    void adminSearchProducts(cleaned, "all").then((response) => {
      if (cancelled) return;
      setResults(response.items);
      setSelected(new Set());
      setSearched(true);
      setSearching(false);
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  function toggleSelect(key: string) {
    if (discountedKeys.has(key)) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAllResults() {
    setSelected(new Set(selectableResults.map((product) => productKey(product.source, product.id))));
  }

  async function addSelectedDiscounts() {
    const items = results
      .filter((product) => selected.has(productKey(product.source, product.id)))
      .map((product) => ({ source: product.source, productId: String(product.id) }));
    if (items.length === 0) return;

    setAdding(true);
    const result = await adminSaveCustomerProductDiscounts({
      customerId: customer.id,
      discountPercent,
      items,
    });
    setAdding(false);
    if (!result.ok) {
      setStatus(dict.admin.saveError);
      return;
    }
    setSelected(new Set());
    setStatus(dict.admin.saveDone);
    router.refresh();
  }

  async function updateDiscount(row: CustomerDiscountView) {
    const key = `${row.source}-${row.product_id}`;
    await adminSaveCustomerProductDiscount({
      customerId: customer.id,
      source: row.source as Source,
      productId: row.product_id,
      discountPercent: discountValues[key] ?? String(row.discount_percent),
    });
    router.refresh();
  }

  async function removeDiscount(source: Source, productId: string) {
    await adminRemoveCustomerProductDiscount({ customerId: customer.id, source, productId });
    router.refresh();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "details", label: dict.admin.tabDetails },
    { id: "discounts", label: dict.admin.tabDiscounts },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">{customer.name}</h2>
          <p className="mt-1 text-sm text-ink/55">{customer.email}</p>
        </div>
        <Link href="/admin/customers" className="rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold hover:border-tech hover:text-tech">
          {dict.admin.back}
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-ink/10 bg-card p-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              tab === item.id ? "bg-ink text-paper" : "text-ink/70 hover:bg-surface",
            )}
          >
            {item.label}
            {item.id === "discounts" && discounts.length > 0 && (
              <span className="ml-2 rounded-full bg-tech/20 px-2 py-0.5 text-xs text-tech">{discounts.length}</span>
            )}
          </button>
        ))}
      </div>

      {status && <p className="text-sm text-tech">{status}</p>}

      {tab === "details" && (
        <form
          className="max-w-2xl space-y-4 rounded-3xl border border-ink/10 bg-card p-6"
          onSubmit={(event) => {
            event.preventDefault();
            void saveCustomer();
          }}
        >
          <label className="grid gap-1 text-sm">
            <span>{dict.admin.customerName}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5" />
          </label>
          <label className="grid gap-1 text-sm">
            <span>{dict.admin.customerEmail}</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5" />
          </label>
          <label className="grid gap-1 text-sm">
            <span>{dict.admin.customerPassword}</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5" />
          </label>
          <label className="grid gap-1 text-sm">
            <span>{dict.admin.generalDiscount}</span>
            <input type="number" min={0} max={100} value={generalDiscount} onChange={(e) => setGeneralDiscount(e.target.value)} className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            <span>{dict.admin.activeCustomer}</span>
          </label>
          <button type="submit" className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream">{dict.admin.save}</button>
        </form>
      )}

      {tab === "discounts" && (
        <section className="space-y-6 rounded-3xl border border-ink/10 bg-card p-6">
          <div>
            <h3 className="font-display text-xl">{dict.admin.productDiscounts}</h3>
            <p className="mt-1 text-sm text-ink/55">
              {discounts.length === 1
                ? dict.products.one
                : dict.products.many.replace("{count}", String(discounts.length))}
            </p>
          </div>

          {discounts.length === 0 ? (
            <p className="text-sm text-ink/55">{dict.admin.noProductDiscounts}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {discounts.map((row) => {
                const key = `${row.source}-${row.product_id}`;
                const division = sourceLabels(row.source as Source);

                return (
                  <article key={key} className="rounded-2xl border border-ink/10 bg-surface p-3">
                    <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-xl bg-white">
                      {row.image ? (
                        <CatalogImage src={row.image} alt={row.productName} className="max-h-full max-w-full object-contain p-2" />
                      ) : (
                        <span className="text-[10px] uppercase tracking-wide text-ink/35">{dict.admin.noImage}</span>
                      )}
                      <span className="absolute right-2 top-2 rounded-full bg-tech px-2 py-0.5 text-xs font-bold text-cream">
                        -{row.discount_percent}%
                      </span>
                    </div>
                    <div className="mt-2 space-y-2">
                      <span className="inline-block rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-semibold">
                        {catalogSourceName(row.source as Source)}
                      </span>
                      <p className="line-clamp-2 text-sm font-medium leading-snug">{row.productName}</p>
                      <p className="text-xs text-ink/50">
                        {formatPrice(row.price, locale, dict)} · {row.inStock ? dict.product.inStock : dict.product.checkStock}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={discountValues[key] ?? String(row.discount_percent)}
                          onChange={(event) =>
                            setDiscountValues((current) => ({ ...current, [key]: event.target.value }))
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void updateDiscount(row);
                            }
                          }}
                          className="w-16 rounded-xl border border-ink/10 bg-card px-2 py-1.5 text-sm"
                          aria-label={dict.admin.discountPercent}
                        />
                        <span className="text-xs text-ink/45">%</span>
                        <button
                          type="button"
                          onClick={() => void updateDiscount(row)}
                          className="rounded-full bg-tech px-3 py-1.5 text-xs font-semibold text-cream"
                        >
                          {dict.admin.save}
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeDiscount(row.source as Source, row.product_id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 hover:bg-home/10 hover:text-home"
                          aria-label={dict.quote.remove}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <Link
                        href={`/admin/products/${row.source}/${row.product_id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-tech hover:underline"
                      >
                        <Pencil className="h-3 w-3" />
                        {dict.admin.editProduct}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="space-y-4 border-t border-ink/10 pt-6">
            <h4 className="font-display text-lg">{dict.admin.addProductDiscount}</h4>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <label className="relative min-w-0 flex-1 sm:min-w-[14rem]">
                <span className="sr-only">{dict.admin.search}</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                {(searching || query.trim() !== debouncedQuery.trim()) && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink/35" />
                )}
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={dict.admin.searchPlaceholder}
                  className="w-full rounded-2xl border border-ink/10 bg-surface py-2.5 pl-10 pr-10 text-sm outline-none focus:border-tech"
                />
              </label>
              <label className="flex items-center gap-2 sm:w-auto">
                <span className="shrink-0 text-sm text-ink/55">{dict.admin.discountPercent}</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-20 rounded-2xl border border-ink/10 bg-surface px-3 py-2.5 text-sm"
                  aria-label={dict.admin.discountPercent}
                />
              </label>
            </div>

            {searched && results.length === 0 && (
              <p className="text-sm text-ink/55">{dict.search.noResults}</p>
            )}

            {results.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink/10 bg-surface p-2">
                  <button
                    type="button"
                    onClick={selectAllResults}
                    disabled={selectableResults.length === 0}
                    className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold transition hover:border-tech hover:text-tech disabled:opacity-40"
                  >
                    <CheckSquare className="h-4 w-4" />
                    {dict.admin.selectAllProducts}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    disabled={selected.size === 0}
                    className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold transition hover:border-ink disabled:opacity-40"
                  >
                    <XCircle className="h-4 w-4" />
                    {dict.admin.clearSelection}
                  </button>
                  <button
                    type="button"
                    onClick={() => void addSelectedDiscounts()}
                    disabled={selected.size === 0 || adding}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full bg-tech px-4 py-2 text-sm font-semibold text-cream disabled:opacity-40",
                      selected.size > 0 && "btn-pulse",
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    {dict.admin.addSelectedDiscounts} ({selected.size})
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((product) => {
                    const key = productKey(product.source, product.id);
                    const alreadyAdded = discountedKeys.has(key);
                    const isSelected = selected.has(key);
                    const division = sourceLabels(product.source);

                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => toggleSelect(key)}
                        className={cn(
                          "rounded-2xl border p-3 text-left transition",
                          alreadyAdded
                            ? "cursor-default border-ink/10 opacity-60"
                            : isSelected
                              ? "border-tech bg-tech/5 ring-1 ring-tech/20"
                              : "border-ink/10 hover:border-tech/40 hover:bg-surface/60",
                        )}
                      >
                        <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-xl bg-white">
                          {product.image ? (
                            <CatalogImage
                              src={product.image}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain p-2"
                            />
                          ) : (
                            <span className="px-2 text-center text-[10px] uppercase tracking-wide text-ink/35">
                              {dict.admin.noImage}
                            </span>
                          )}
                          {!alreadyAdded && (
                            <span
                              className={cn(
                                "absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-md border bg-card shadow-sm",
                                isSelected ? "border-tech text-tech" : "border-ink/15 text-transparent",
                              )}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                          {alreadyAdded && (
                            <span className="absolute inset-0 flex items-center justify-center bg-paper/75 text-xs font-semibold text-tech">
                              {dict.admin.alreadyDiscounted}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          <span
                            className={cn(
                              "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              product.source === "treco"
                                ? "bg-tech/15 text-tech"
                                : product.source === "tremark"
                                  ? "bg-home/15 text-home"
                                  : "bg-ink/10 text-ink",
                            )}
                          >
                            {catalogSourceName(product.source)}
                          </span>
                          <p className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</p>
                          <p className="text-xs text-ink/50">
                            {formatPrice(product.price, locale, dict)} ·{" "}
                            {product.inStock ? dict.product.inStock : dict.product.checkStock}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
