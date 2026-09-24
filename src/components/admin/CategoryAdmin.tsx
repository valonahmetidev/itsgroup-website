"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  adminAssignProductCategory,
  adminBrowseProducts,
  adminSaveCategoryOverride,
  type AdminCategoryRow,
} from "@/app/admin/actions";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import { catalogSourceName } from "@/lib/source-labels";
import type { CatalogSource } from "@/lib/types";

const sources: CatalogSource[] = ["treco", "tremark", "alevado"];

export function CategoryAdmin({
  source,
  categories,
}: {
  source: CatalogSource;
  categories: AdminCategoryRow[];
}) {
  const router = useRouter();
  const { dict } = useLocale();
  const [selectedId, setSelectedId] = useState<number | null>(categories[0]?.id ?? null);
  const selected = categories.find((category) => category.id === selectedId) ?? null;

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

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ id: category.id, name: category.name })),
    [categories],
  );

  function selectCategory(category: AdminCategoryRow) {
    setSelectedId(category.id);
    setNameMk(category.override?.name_mk ?? category.name);
    setNameEn(category.override?.name_en ?? "");
    setNameSq(category.override?.name_sq ?? "");
    setSlug(category.override?.slug ?? category.slug);
    setParentId(category.override?.parent_id?.toString() ?? String(category.parent || ""));
    setHidden(category.override?.hidden === 1);
    setStatus("");
    setLoadingProducts(true);
    void adminBrowseProducts(source, 0, 200, { source, slug: category.slug }).then((response) => {
      setProducts(
        response.items
          .filter((item) => typeof item.id === "number")
          .map((item) => ({ id: item.id as number, name: item.name })),
      );
      setLoadingProducts(false);
    });
  }

  useEffect(() => {
    if (categories.length > 0) selectCategory(categories[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

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
    <div className="space-y-4">
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
        <ul className="max-h-[32rem] space-y-1 overflow-y-auto rounded-xl border border-ink/10 bg-card p-2">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => selectCategory(category)}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                  selectedId === category.id ? "bg-ink text-paper" : "hover:bg-surface",
                )}
              >
                <p className="font-medium leading-snug">{category.name}</p>
                <p className={cn("text-xs", selectedId === category.id ? "text-paper/70" : "text-ink/45")}>
                  {category.productCount} · {category.slug}
                </p>
              </button>
            </li>
          ))}
        </ul>

        {selected ? (
          <div className="space-y-4">
            <form
              className="rounded-xl border border-ink/10 bg-card p-4"
              onSubmit={(event) => {
                event.preventDefault();
                void saveCategory(false);
              }}
            >
              <h3 className="font-display text-lg">{dict.admin.editCategory}</h3>
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
                        {categoryOptions
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
          <p className="text-sm text-ink/50">{dict.admin.noCategories}</p>
        )}
      </div>

      {status && <p className="text-sm text-tech">{status}</p>}
    </div>
  );
}
