"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, FolderTree, Package, Plus, Trash2, X } from "lucide-react";
import {
  adminDeleteStoreCategory,
  adminListStoreCategoryProducts,
  adminSaveStoreCategory,
} from "@/app/admin/actions";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import {
  flattenStoreCategoryTree,
  type StoreCategoryTreeNode,
} from "@/lib/store-categories";
import { catalogSourceName } from "@/lib/source-labels";
import type { CatalogSource } from "@/lib/types";

const catalogSources: CatalogSource[] = ["treco", "tremark", "alevado"];

function TreeButton({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: StoreCategoryTreeNode;
  depth: number;
  selectedId: string | null;
  onSelect: (node: StoreCategoryTreeNode) => void;
}) {
  const active = selectedId === node.id;
  return (
    <div className="min-w-0" style={{ paddingLeft: depth * 14 }}>
      <button
        type="button"
        onClick={() => onSelect(node)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition",
          active ? "bg-ink text-paper shadow-sm" : "hover:bg-surface",
        )}
      >
        <span className={cn("min-w-0 truncate text-sm", depth === 0 && "font-semibold")}>{node.name_mk}</span>
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
        <TreeButton key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}

export function StoreCategoryAdmin({ tree }: { tree: StoreCategoryTreeNode[] }) {
  const router = useRouter();
  const { dict } = useLocale();
  const flat = useMemo(() => flattenStoreCategoryTree(tree), [tree]);

  const [selected, setSelected] = useState<StoreCategoryTreeNode | null>(null);
  const [creating, setCreating] = useState(false);
  const [nameMk, setNameMk] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameSq, setNameSq] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [hidden, setHidden] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const inputClass = "w-full rounded-xl border border-ink/10 bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-tech";

  const resetForm = useCallback(() => {
    setNameMk("");
    setNameEn("");
    setNameSq("");
    setSlug("");
    setParentId("");
    setHidden(false);
    setSortOrder("0");
    setStatus("");
    setProducts([]);
  }, []);

  const startCreate = useCallback(() => {
    setCreating(true);
    setSelected(null);
    resetForm();
  }, [resetForm]);

  const loadCategoryDetail = useCallback((node: StoreCategoryTreeNode) => {
    setCreating(false);
    setSelected(node);
    setNameMk(node.name_mk);
    setNameEn(node.name_en ?? "");
    setNameSq(node.name_sq ?? "");
    setSlug(node.slug);
    setParentId(node.parent_id ?? "");
    setHidden(node.hidden === 1);
    setSortOrder(String(node.sort_order));
    setStatus("");
    setLoadingProducts(true);
    void adminListStoreCategoryProducts(node.id).then((rows) => {
      setProducts(rows);
      setLoadingProducts(false);
    });
  }, []);

  const selectCategory = useCallback(
    (node: StoreCategoryTreeNode) => {
      loadCategoryDetail(node);
    },
    [loadCategoryDetail],
  );

  const clearSelection = useCallback(() => {
    setCreating(false);
    setSelected(null);
    resetForm();
  }, [resetForm]);

  async function save() {
    setSaving(true);
    const result = await adminSaveStoreCategory({
      id: creating ? undefined : selected?.id,
      nameMk,
      nameEn,
      nameSq,
      slug,
      parentId,
      hidden,
      sortOrder,
    });
    setSaving(false);
    if (!result.ok) {
      setStatus(dict.admin.saveError);
      return;
    }
    setStatus(dict.admin.saveDone);
    setCreating(false);
    router.refresh();
  }

  async function remove() {
    if (!selected) return;
    if (!window.confirm(dict.admin.storeCategoryDeleteConfirm)) return;
    setSaving(true);
    const result = await adminDeleteStoreCategory(selected.id);
    setSaving(false);
    if (!result.ok) {
      setStatus(dict.admin.saveError);
      return;
    }
    setSelected(null);
    resetForm();
    router.refresh();
  }

  const showForm = creating || selected;

  const detailHeader =
    selected && !creating ? (
      <div className="flex items-start justify-between gap-3 border-b border-ink/10 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink/45">ID {selected.id}</p>
          <h3 className="mt-0.5 font-display text-2xl leading-tight">{selected.name_mk}</h3>
          <p className="mt-1 text-sm text-ink/55">
            {loadingProducts ? dict.admin.loadingProducts : `${selected.productCount} products`}
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

  const detailBody = showForm ? (
    <div className="p-4 sm:p-5">
      {creating && <h3 className="font-display text-xl">{dict.admin.storeCategoryCreate}</h3>}
      <form
        className={cn("grid gap-3", creating ? "mt-4" : "")}
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label className="grid gap-1.5 text-sm">
          <span className="text-ink/60">{dict.admin.nameMk}</span>
          <input value={nameMk} onChange={(e) => setNameMk(e.target.value)} required className={inputClass} />
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
            <select value={parentId || ""} onChange={(e) => setParentId(e.target.value)} className={inputClass}>
              <option value="">{dict.admin.categoryParentRoot}</option>
              {flat
                .filter(({ node }) => node.id !== selected?.id)
                .map(({ node, depth }) => (
                  <option key={node.id} value={node.id}>
                    {`${depth > 0 ? `${"— ".repeat(depth)}` : ""}${node.name_mk}`}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <label className="grid gap-1.5 text-sm sm:max-w-[10rem]">
          <span className="text-ink/60">{dict.admin.storeCategorySort}</span>
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={inputClass} />
        </label>
        <label className="flex items-center gap-2.5 rounded-xl border border-ink/10 bg-paper px-3 py-2.5 text-sm">
          <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} className="h-4 w-4" />
          <span>{dict.admin.categoryHidden}</span>
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-50"
          >
            {dict.admin.save}
          </button>
          {selected && !creating && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void remove()}
              className="inline-flex items-center gap-1 rounded-full border border-home/30 px-5 py-2.5 text-sm font-semibold text-home"
            >
              <Trash2 className="h-4 w-4" />
              {dict.admin.storeCategoryDelete}
            </button>
          )}
        </div>
      </form>

      {selected && !creating && (
        <section className="mt-6 rounded-2xl border border-ink/10 bg-surface/40 p-4">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <Package className="h-4 w-4 text-tech" />
            {dict.admin.categoryProducts}
          </h4>
          <ul className="mt-3 space-y-2">
            {loadingProducts ? (
              <li className="text-sm text-ink/50">{dict.admin.loadingProducts}</li>
            ) : products.length === 0 ? (
              <li className="text-sm text-ink/50">{dict.admin.noProducts}</li>
            ) : (
              products.map((product) => (
                <li key={product.id}>
                  <Link href={`/admin/products/its/${product.id}`} className="text-sm font-medium hover:text-tech">
                    {product.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
      )}

      {status ? <p className="mt-4 text-sm font-medium text-tech">{status}</p> : null}
    </div>
  ) : null;

  return (
    <div className="lg:grid lg:min-h-[calc(100vh-7.5rem)] lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-card lg:min-h-0 lg:overflow-hidden">
        <div className="space-y-3 border-b border-ink/10 p-3">
          <div className="flex flex-wrap gap-1 rounded-xl bg-surface p-1">
            {catalogSources.map((value) => (
              <Link
                key={value}
                href={`/admin/categories?source=${value}`}
                className="flex-1 rounded-lg px-2 py-2 text-center text-xs font-semibold text-ink/60 transition hover:text-ink sm:text-sm"
              >
                {catalogSourceName(value)}
              </Link>
            ))}
            <span className="flex-1 rounded-lg bg-ink px-2 py-2 text-center text-xs font-semibold text-paper shadow-sm sm:text-sm">
              {dict.admin.custom}
            </span>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-tech px-4 py-2 text-sm font-semibold text-cream"
          >
            <Plus className="h-4 w-4" />
            {dict.admin.storeCategoryCreate}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {tree.length === 0 ? (
            <p className="px-2 py-4 text-sm text-ink/50">{dict.admin.storeCategoriesEmpty}</p>
          ) : (
            tree.map((node) => (
              <TreeButton key={node.id} node={node} depth={0} selectedId={selected?.id ?? null} onSelect={selectCategory} />
            ))
          )}
        </div>
      </div>

      <div className="mt-4 hidden min-h-0 flex-col overflow-hidden rounded-2xl border border-ink/10 bg-card lg:mt-0 lg:flex">
        {!showForm ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center text-ink/50">
            <FolderTree className="h-10 w-10 text-ink/25" />
            <p className="text-sm">{dict.admin.storeCategoriesSelectHint}</p>
          </div>
        ) : (
          <>
            {detailHeader}
            <div className="min-h-0 flex-1 overflow-y-auto">{detailBody}</div>
          </>
        )}
      </div>

      {showForm ? (
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
          <div className="min-h-0 flex-1 overflow-y-auto">{detailBody}</div>
        </div>
      ) : (
        <p className="mt-3 text-center text-sm text-ink/45 lg:hidden">{dict.admin.categorySelectHint}</p>
      )}
    </div>
  );
}
