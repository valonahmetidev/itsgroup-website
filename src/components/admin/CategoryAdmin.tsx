"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  adminAssignProductCategory,
  adminBrowseProducts,
  adminSaveCategoryOverride,
} from "@/app/admin/actions";
import type { AdminMenuCategoryGroup, AdminMenuCategoryNode } from "@/lib/admin-category-menu";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import { countProducts } from "@/lib/format";
import { menuGroupTitle } from "@/lib/i18n/menu";
import { catalogSourceName } from "@/lib/source-labels";
import type { CatalogSource } from "@/lib/types";

const sources: CatalogSource[] = ["treco", "tremark", "alevado"];

function flattenMenu(groups: AdminMenuCategoryGroup[]) {
  const flat: AdminMenuCategoryNode[] = [];
  function walk(node: AdminMenuCategoryNode) {
    flat.push(node);
    for (const child of node.children) walk(child);
  }
  for (const group of groups) {
    for (const column of group.columns) walk(column);
  }
  return flat;
}

function categoryRowClass(selected: boolean) {
  return cn(
    "w-full rounded-xl px-3 py-2 text-left transition",
    selected
      ? "bg-tech/15 font-semibold text-tech ring-1 ring-tech/30"
      : "text-ink/80 hover:bg-ink/5 hover:text-tech",
  );
}

export function CategoryAdmin({
  source,
  groups,
  initialCategoryId,
}: {
  source: CatalogSource;
  groups: AdminMenuCategoryGroup[];
  initialCategoryId: number | null;
}) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const { dict } = useLocale();
  const flat = useMemo(() => flattenMenu(groups), [groups]);
  const [selected, setSelected] = useState<AdminMenuCategoryNode | null>(null);

  const [nameMk, setNameMk] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameSq, setNameSq] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [hidden, setHidden] = useState(false);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [productTotal, setProductTotal] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const pushCategoryUrl = useCallback(
    (categoryId: number | null) => {
      const params = new URLSearchParams({ source });
      if (categoryId != null) params.set("category", String(categoryId));
      router.replace(`/admin/categories?${params.toString()}`, { scroll: false });
    },
    [router, source],
  );

  const selectCategory = useCallback(
    (node: AdminMenuCategoryNode) => {
      setSelected(node);
      pushCategoryUrl(node.id);
      setNameMk(node.override?.name_mk ?? node.name);
      setNameEn(node.override?.name_en ?? "");
      setNameSq(node.override?.name_sq ?? "");
      setSlug(node.override?.slug ?? node.slug);
      setParentId(node.override?.parent_id?.toString() ?? String(node.parent || ""));
      setHidden(node.override?.hidden === 1);
      setStatus("");
      setLoadingProducts(true);
      void adminBrowseProducts(source, 0, 500, { source, slug: node.slug, id: node.id }).then((response) => {
        setProductTotal(response.total);
        setProducts(
          response.items
            .filter((item) => typeof item.id === "number")
            .map((item) => ({ id: item.id as number, name: item.name })),
        );
        setLoadingProducts(false);
      });
      requestAnimationFrame(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    },
    [pushCategoryUrl, source],
  );

  const clearSelection = useCallback(() => {
    setSelected(null);
    pushCategoryUrl(null);
    setProducts([]);
    setProductTotal(0);
  }, [pushCategoryUrl]);

  useEffect(() => {
    if (!initialCategoryId || selected?.id === initialCategoryId) return;
    const node = flat.find((entry) => entry.id === initialCategoryId);
    if (node) selectCategory(node);
  }, [flat, initialCategoryId, selectCategory, selected?.id]);

  async function saveCategory(reset = false) {
    if (!selected) return;
    setSaving(true);
    const result = await adminSaveCategoryOverride({
      source,
      categoryId: selected.id,
      nameMk,
      nameEn,
      nameSq,
      slug,
      parentId,
      hidden,
      reset,
    });
    setSaving(false);
    setStatus(result.ok ? dict.admin.saveDone : dict.admin.saveError);
    router.refresh();
  }

  async function moveProduct(productId: number, categoryId: number) {
    const result = await adminAssignProductCategory({ source, productId, categoryId });
    setStatus(result.ok ? dict.admin.categoryMoved : dict.admin.saveError);
    if (selected) selectCategory(selected);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5">
        {sources.map((value) => (
          <Link
            key={value}
            href={`/admin/categories?source=${value}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-semibold",
              source === value ? "bg-ink text-paper" : "border border-ink/10 hover:border-tech hover:text-tech",
            )}
          >
            {catalogSourceName(value)}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] xl:items-start">
        <div className="space-y-8 min-w-0">
          {groups.map((group) => (
            <section key={group.key} className="space-y-4">
              <h2 className="font-display text-2xl md:text-3xl">{menuGroupTitle(dict, group.key, group.title)}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {group.columns.map((column) => {
                  const columnSelected = selected?.id === column.id;
                  return (
                    <article
                      key={column.id}
                      className={cn(
                        "rounded-3xl border bg-card p-5 transition",
                        columnSelected ? "border-tech/40 ring-2 ring-tech/25 shadow-sm" : "border-ink/10",
                      )}
                    >
                      <button type="button" onClick={() => selectCategory(column)} className={categoryRowClass(columnSelected)}>
                        <span className="font-display text-xl leading-tight">{column.name}</span>
                        <span className="mt-0.5 block text-xs font-normal text-ink/45">
                          {countProducts(column.productCount, dict)}
                        </span>
                      </button>
                      {column.children.length > 0 && (
                        <ul className="mt-3 space-y-1 border-t border-ink/8 pt-3">
                          {column.children.map((child) => {
                            const childSelected = selected?.id === child.id;
                            return (
                              <li key={child.id}>
                                <button
                                  type="button"
                                  onClick={() => selectCategory(child)}
                                  className={categoryRowClass(childSelected)}
                                >
                                  <span className="text-sm">{child.name}</span>
                                  <span className="ml-2 text-xs font-normal text-ink/40">{child.productCount}</span>
                                </button>
                                {child.children.length > 0 && (
                                  <ul className="mt-1 space-y-1 border-l border-ink/10 pl-2">
                                    {child.children.map((nested) => {
                                      const nestedSelected = selected?.id === nested.id;
                                      return (
                                        <li key={nested.id}>
                                          <button
                                            type="button"
                                            onClick={() => selectCategory(nested)}
                                            className={cn(categoryRowClass(nestedSelected), "py-1.5 text-[13px]")}
                                          >
                                            {nested.name}
                                            <span className="ml-2 text-xs font-normal text-ink/40">{nested.productCount}</span>
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <aside
          ref={panelRef}
          className={cn(
            "rounded-3xl border border-ink/10 bg-card shadow-sm xl:sticky xl:top-4 xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto",
            !selected && "hidden xl:flex xl:min-h-[12rem] xl:items-center xl:justify-center xl:p-6",
          )}
        >
          {!selected ? (
            <p className="text-center text-sm text-ink/50">{dict.admin.categoryPanelEmpty}</p>
          ) : (
            <div className="space-y-4 p-4 md:p-5">
              <div className="flex items-start justify-between gap-3 border-b border-ink/10 pb-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-tech">{dict.admin.editCategory}</p>
                  <h3 className="mt-1 font-display text-xl leading-tight">{selected.name}</h3>
                  <p className="mt-1 text-sm text-ink/50">
                    {loadingProducts ? "…" : countProducts(productTotal, dict)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="shrink-0 rounded-full border border-ink/10 p-2 text-ink/50 transition hover:border-ink/20 hover:text-ink"
                  aria-label={dict.admin.categoryClosePanel}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveCategory(false);
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm sm:col-span-2">
                    <span>{dict.admin.nameMk}</span>
                    <input
                      value={nameMk}
                      onChange={(e) => setNameMk(e.target.value)}
                      className="rounded-xl border border-ink/10 bg-surface px-3 py-2"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span>{dict.admin.nameEn}</span>
                    <input
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      className="rounded-xl border border-ink/10 bg-surface px-3 py-2"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span>{dict.admin.nameSq}</span>
                    <input
                      value={nameSq}
                      onChange={(e) => setNameSq(e.target.value)}
                      className="rounded-xl border border-ink/10 bg-surface px-3 py-2"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span>{dict.admin.categorySlug}</span>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="rounded-xl border border-ink/10 bg-surface px-3 py-2"
                    />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span>{dict.admin.categoryParent}</span>
                    <input
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="rounded-xl border border-ink/10 bg-surface px-3 py-2"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
                    <span>{dict.admin.categoryHidden}</span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper"
                  >
                    {dict.admin.save}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveCategory(true)}
                    className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold"
                  >
                    {dict.admin.resetOverride}
                  </button>
                </div>
              </form>

              <section className="rounded-2xl border border-ink/10 bg-surface/50 p-3">
                <h4 className="text-sm font-semibold">{dict.admin.categoryProducts}</h4>
                {loadingProducts ? (
                  <p className="mt-2 text-sm text-ink/50">{dict.admin.loadingProducts}</p>
                ) : products.length === 0 ? (
                  <p className="mt-2 text-sm text-ink/50">{dict.admin.noProducts}</p>
                ) : (
                  <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                    {products.map((product) => (
                      <li
                        key={product.id}
                        className="flex flex-col gap-2 rounded-lg border border-ink/8 bg-card px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <Link
                          href={`/admin/products/${source}/${product.id}`}
                          className="text-sm font-medium hover:text-tech"
                        >
                          {product.name}
                        </Link>
                        <select
                          className="w-full rounded-lg border border-ink/10 bg-surface px-2 py-1 text-xs sm:w-auto"
                          defaultValue=""
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            if (!value) return;
                            void moveProduct(product.id, value);
                            event.currentTarget.value = "";
                          }}
                        >
                          <option value="">{dict.admin.moveToCategory}</option>
                          {flat
                            .filter((option) => option.id !== selected.id)
                            .map((option) => (
                              <option key={option.id} value={option.id}>{option.name}</option>
                            ))}
                        </select>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {status && <p className="text-sm text-tech">{status}</p>}
            </div>
          )}
        </aside>
      </div>

      {!selected && (
        <p className="text-sm text-ink/50 xl:hidden">{dict.admin.categorySelectHint}</p>
      )}
    </div>
  );
}
