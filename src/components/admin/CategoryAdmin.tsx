"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, FolderTree, Package, Search, X } from "lucide-react";
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

function nodeMatchesQuery(node: AdminMenuCategoryNode, query: string): boolean {
  if (!query) return true;
  const hay = query.toLowerCase();
  if (node.name.toLowerCase().includes(hay)) return true;
  return node.children.some((child) => nodeMatchesQuery(child, query));
}

function CategoryTreeButton({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: AdminMenuCategoryNode;
  depth: number;
  selectedId: number | null;
  onSelect: (node: AdminMenuCategoryNode) => void;
}) {
  const active = selectedId === node.id;
  return (
    <>
      <button
        type="button"
        onClick={() => onSelect(node)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition",
          depth > 0 && "ml-3 border-l border-ink/10 pl-3",
          active ? "bg-ink text-paper shadow-sm" : "hover:bg-surface",
        )}
      >
        <span className={cn("min-w-0 truncate text-sm", depth === 0 && "font-semibold")}>{node.name}</span>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] tabular-nums",
            active ? "bg-paper/15 text-paper" : "bg-ink/5 text-ink/50",
          )}
        >
          {node.productCount}
        </span>
      </button>
      {node.children.map((child) => (
        <CategoryTreeButton key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </>
  );
}

function CategoryDetailBody({
  source,
  selected,
  flat,
  dict,
  nameMk,
  setNameMk,
  nameEn,
  setNameEn,
  nameSq,
  setNameSq,
  slug,
  setSlug,
  parentId,
  setParentId,
  hidden,
  setHidden,
  saving,
  saveCategory,
  products,
  productTotal,
  loadingProducts,
  moveProduct,
  status,
}: {
  source: CatalogSource;
  selected: AdminMenuCategoryNode;
  flat: AdminMenuCategoryNode[];
  dict: ReturnType<typeof useLocale>["dict"];
  nameMk: string;
  setNameMk: (v: string) => void;
  nameEn: string;
  setNameEn: (v: string) => void;
  nameSq: string;
  setNameSq: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  parentId: string;
  setParentId: (v: string) => void;
  hidden: boolean;
  setHidden: (v: boolean) => void;
  saving: boolean;
  saveCategory: (reset?: boolean) => void;
  products: { id: number; name: string }[];
  productTotal: number;
  loadingProducts: boolean;
  moveProduct: (productId: number, categoryId: number) => void;
  status: string;
}) {
  const inputClass = "w-full rounded-xl border border-ink/10 bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-tech";

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      <form
        className="rounded-2xl border border-ink/10 bg-surface/40 p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void saveCategory(false);
        }}
      >
        <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">{dict.admin.editCategory}</h4>
        <div className="mt-3 grid gap-3">
          <label className="grid gap-1.5 text-sm">
            <span className="text-ink/60">{dict.admin.nameMk}</span>
            <input value={nameMk} onChange={(e) => setNameMk(e.target.value)} className={inputClass} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink/60">{dict.admin.nameEn}</span>
              <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className={inputClass} />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink/60">{dict.admin.nameSq}</span>
              <input value={nameSq} onChange={(e) => setNameSq(e.target.value)} className={inputClass} />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink/60">{dict.admin.categorySlug}</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-ink/60">{dict.admin.categoryParent}</span>
              <input value={parentId} onChange={(e) => setParentId(e.target.value)} className={inputClass} />
            </label>
          </div>
          <label className="flex items-center gap-2.5 rounded-xl border border-ink/10 bg-paper px-3 py-2.5 text-sm">
            <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} className="h-4 w-4" />
            <span>{dict.admin.categoryHidden}</span>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="submit" disabled={saving} className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream">
            {dict.admin.save}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveCategory(true)}
            className="rounded-full border border-ink/10 bg-paper px-5 py-2.5 text-sm font-semibold"
          >
            {dict.admin.resetOverride}
          </button>
        </div>
      </form>

      <section className="flex min-h-[16rem] flex-col rounded-2xl border border-ink/10 bg-surface/40 p-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Package className="h-4 w-4 text-tech" />
            {dict.admin.categoryProducts}
          </h4>
          <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs tabular-nums text-ink/55">
            {loadingProducts ? "…" : countProducts(productTotal, dict)}
          </span>
        </div>
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
          {loadingProducts ? (
            <p className="text-sm text-ink/50">{dict.admin.loadingProducts}</p>
          ) : products.length === 0 ? (
            <p className="rounded-xl border border-dashed border-ink/15 px-4 py-8 text-center text-sm text-ink/50">
              {dict.admin.noProducts}
            </p>
          ) : (
            <ul className="space-y-2">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-col gap-2 rounded-xl border border-ink/8 bg-paper px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <Link
                    href={`/admin/products/${source}/${product.id}`}
                    className="text-sm font-medium leading-snug hover:text-tech"
                  >
                    {product.name}
                  </Link>
                  <select
                    className="rounded-lg border border-ink/10 bg-surface px-2 py-1.5 text-xs sm:max-w-[11rem]"
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
        </div>
      </section>

      {status ? <p className="text-sm font-medium text-tech lg:col-span-2">{status}</p> : null}
    </div>
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
  const { dict } = useLocale();
  const flat = useMemo(() => flattenMenu(groups), [groups]);
  const [selected, setSelected] = useState<AdminMenuCategoryNode | null>(null);
  const [search, setSearch] = useState("");

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

  const filteredGroups = useMemo(() => {
    const q = search.trim();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        columns: group.columns.filter((column) => nodeMatchesQuery(column, q)),
      }))
      .filter((group) => group.columns.length > 0);
  }, [groups, search]);

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
    },
    [pushCategoryUrl, source],
  );

  const clearSelection = useCallback(() => {
    setSelected(null);
    pushCategoryUrl(null);
    setProducts([]);
    setProductTotal(0);
    setStatus("");
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

  const detailProps = selected
    ? {
        source,
        selected,
        flat,
        dict,
        nameMk,
        setNameMk,
        nameEn,
        setNameEn,
        nameSq,
        setNameSq,
        slug,
        setSlug,
        parentId,
        setParentId,
        hidden,
        setHidden,
        saving,
        saveCategory,
        products,
        productTotal,
        loadingProducts,
        moveProduct,
        status,
      }
    : null;

  const detailHeader = selected ? (
    <div className="flex items-start justify-between gap-3 border-b border-ink/10 px-4 py-4 sm:px-5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink/45">ID {selected.id}</p>
        <h3 className="mt-0.5 font-display text-2xl leading-tight">{selected.name}</h3>
        <p className="mt-1 text-sm text-ink/55">
          {loadingProducts ? dict.admin.loadingProducts : countProducts(productTotal, dict)}
        </p>
      </div>
      <button
        type="button"
        onClick={clearSelection}
        className="hidden shrink-0 rounded-full border border-ink/10 p-2 text-ink/50 transition hover:bg-surface hover:text-ink lg:flex"
        aria-label={dict.admin.categoryClosePanel}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  ) : null;

  return (
    <div className="lg:grid lg:h-[calc(100vh-7.5rem)] lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-card lg:min-h-0 lg:overflow-hidden">
        <div className="space-y-3 border-b border-ink/10 p-3">
          <div className="flex gap-1 rounded-xl bg-surface p-1">
            {sources.map((value) => (
              <Link
                key={value}
                href={`/admin/categories?source=${value}`}
                className={cn(
                  "flex-1 rounded-lg px-2 py-2 text-center text-xs font-semibold transition sm:text-sm",
                  source === value ? "bg-ink text-paper shadow-sm" : "text-ink/60 hover:text-ink",
                )}
              >
                {catalogSourceName(value)}
              </Link>
            ))}
          </div>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dict.admin.searchCategoryPlaceholder}
              className="w-full rounded-xl border border-ink/10 bg-paper py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-tech"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3 pt-0">
          {filteredGroups.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-ink/50">{dict.admin.searchCategoryPlaceholder}</p>
          ) : (
            filteredGroups.map((group) => (
              <section key={group.key}>
                <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                  {menuGroupTitle(dict, group.key, group.title)}
                </h3>
                <div className="space-y-0.5">
                  {group.columns.map((column) => (
                    <CategoryTreeButton
                      key={column.id}
                      node={column}
                      depth={0}
                      selectedId={selected?.id ?? null}
                      onSelect={selectCategory}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {/* Desktop detail */}
      <div className="mt-4 hidden min-h-0 flex-col overflow-hidden rounded-2xl border border-ink/10 bg-card lg:mt-0 lg:flex">
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tech/10 text-tech">
              <FolderTree className="h-7 w-7" />
            </div>
            <p className="max-w-sm text-sm text-ink/55">{dict.admin.categoryPanelEmpty}</p>
          </div>
        ) : (
          <>
            {detailHeader}
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">{detailProps && <CategoryDetailBody {...detailProps} />}</div>
          </>
        )}
      </div>

      {/* Mobile detail drawer */}
      {selected && detailProps ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-paper lg:hidden">
          <div className="flex items-center gap-2 border-b border-ink/10 px-3 py-3">
            <button
              type="button"
              onClick={clearSelection}
              className="flex items-center gap-1 rounded-full border border-ink/10 px-3 py-2 text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              {dict.admin.categoryClosePanel}
            </button>
          </div>
          {detailHeader}
          <div className="min-h-0 flex-1 overflow-y-auto p-4">{<CategoryDetailBody {...detailProps} />}</div>
        </div>
      ) : (
        <p className="mt-3 text-center text-sm text-ink/45 lg:hidden">{dict.admin.categorySelectHint}</p>
      )}
    </div>
  );
}
