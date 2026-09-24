"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  adminAssignProductCategory,
  adminBrowseProducts,
  adminSaveCategoryOverride,
} from "@/app/admin/actions";
import type { AdminMenuCategoryGroup, AdminMenuCategoryNode } from "@/lib/admin-category-menu";

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
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import { countProducts } from "@/lib/format";
import { menuGroupTitle } from "@/lib/i18n/menu";
import { catalogSourceName } from "@/lib/source-labels";
import type { CatalogSource } from "@/lib/types";

const sources: CatalogSource[] = ["treco", "tremark", "alevado"];

export function CategoryAdmin({
  source,
  groups,
}: {
  source: CatalogSource;
  groups: AdminMenuCategoryGroup[];
}) {
  const router = useRouter();
  const { dict } = useLocale();
  const flat = flattenMenu(groups);
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
  const [loadingProducts, setLoadingProducts] = useState(false);

  function selectCategory(node: AdminMenuCategoryNode) {
    setSelected(node);
    setNameMk(node.override?.name_mk ?? node.name);
    setNameEn(node.override?.name_en ?? "");
    setNameSq(node.override?.name_sq ?? "");
    setSlug(node.override?.slug ?? node.slug);
    setParentId(node.override?.parent_id?.toString() ?? String(node.parent || ""));
    setHidden(node.override?.hidden === 1);
    setStatus("");
    setLoadingProducts(true);
    void adminBrowseProducts(source, 0, 200, { source, slug: node.slug }).then((response) => {
      setProducts(
        response.items
          .filter((item) => typeof item.id === "number")
          .map((item) => ({ id: item.id as number, name: item.name })),
      );
      setLoadingProducts(false);
    });
  }

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

      {groups.map((group) => (
        <section key={group.key} className="space-y-4">
          <h2 className="font-display text-3xl">{menuGroupTitle(dict, group.key, group.title)}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {group.columns.map((column) => (
              <article key={column.id} className="rounded-3xl border border-ink/10 bg-card p-5">
                <button
                  type="button"
                  onClick={() => selectCategory(column)}
                  className={cn(
                    "font-display text-2xl leading-tight text-left hover:text-tech",
                    selected?.id === column.id && "text-tech",
                  )}
                >
                  {column.name}
                </button>
                <p className="mt-1 text-sm text-ink/45">{countProducts(column.productCount, dict)}</p>
                {column.children.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {column.children.map((child) => (
                      <li key={child.id}>
                        <button
                          type="button"
                          onClick={() => selectCategory(child)}
                          className={cn(
                            "text-sm hover:text-tech",
                            selected?.id === child.id ? "font-semibold text-tech" : "text-ink/80",
                          )}
                        >
                          {child.name}
                          <span className="ml-2 text-ink/35">{child.productCount}</span>
                        </button>
                        {child.children.length > 0 && (
                          <ul className="mt-1 space-y-1 border-l border-ink/10 pl-3">
                            {child.children.map((nested) => (
                              <li key={nested.id}>
                                <button
                                  type="button"
                                  onClick={() => selectCategory(nested)}
                                  className={cn(
                                    "text-[13px] hover:text-tech",
                                    selected?.id === nested.id ? "font-semibold text-tech" : "text-ink/65",
                                  )}
                                >
                                  {nested.name}
                                  <span className="ml-2 text-ink/35">{nested.productCount}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}

      {selected ? (
        <div className="space-y-4 border-t border-ink/10 pt-6">
          <form
            className="rounded-xl border border-ink/10 bg-card p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void saveCategory(false);
            }}
          >
            <h3 className="font-display text-lg">
              {dict.admin.editCategory}: {selected.name}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm sm:col-span-2">
                <span>{dict.admin.nameMk}</span>
                <input value={nameMk} onChange={(e) => setNameMk(e.target.value)} className="rounded-xl border border-ink/10 bg-surface px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{dict.admin.nameEn}</span>
                <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="rounded-xl border border-ink/10 bg-surface px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{dict.admin.nameSq}</span>
                <input value={nameSq} onChange={(e) => setNameSq(e.target.value)} className="rounded-xl border border-ink/10 bg-surface px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{dict.admin.categorySlug}</span>
                <input value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded-xl border border-ink/10 bg-surface px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm">
                <span>{dict.admin.categoryParent}</span>
                <input value={parentId} onChange={(e) => setParentId(e.target.value)} className="rounded-xl border border-ink/10 bg-surface px-3 py-2" />
              </label>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
                <span>{dict.admin.categoryHidden}</span>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="submit" disabled={saving} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper">
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

          <section className="rounded-xl border border-ink/10 bg-card p-4">
            <h3 className="font-display text-lg">{dict.admin.categoryProducts}</h3>
            {loadingProducts ? (
              <p className="mt-2 text-sm text-ink/50">{dict.admin.loadingProducts}</p>
            ) : products.length === 0 ? (
              <p className="mt-2 text-sm text-ink/50">{dict.admin.noProducts}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {products.map((product) => (
                  <li key={product.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink/8 px-3 py-2">
                    <Link href={`/admin/products/${source}/${product.id}`} className="text-sm font-medium hover:text-tech">
                      {product.name}
                    </Link>
                    <select
                      className="rounded-lg border border-ink/10 bg-surface px-2 py-1 text-xs"
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
        </div>
      ) : (
        <p className="text-sm text-ink/50">{dict.admin.categorySelectHint}</p>
      )}

      {status && <p className="text-sm text-tech">{status}</p>}
    </div>
  );
}
