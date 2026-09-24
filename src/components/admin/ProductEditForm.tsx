"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { adminAssignProductCategory, adminSaveProduct } from "@/app/admin/actions";
import { CatalogImage } from "@/components/CatalogImage";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { UnitSelectField } from "@/components/admin/UnitSelectField";
import { useLocale } from "@/components/LocaleProvider";
import { categoryDisplayName } from "@/lib/i18n/catalog-labels";
import { formatPrice } from "@/lib/format";
import { productHref } from "@/lib/paths";
import { TagsInputField } from "@/components/admin/TagsInputField";
import { formatTagsInput, parseProductTags } from "@/lib/product-tags";
import { stockAvailabilityLabel } from "@/lib/stock-label";
import { catalogSourceName, sourceLabels } from "@/lib/source-labels";
import type { ProductOverrideRow } from "@/lib/catalog-overrides";
import type { CatalogSource, Product } from "@/lib/types";

const fieldClass =
  "rounded-xl border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-tech focus:outline-none focus-visible:outline-none";

export function ProductEditForm({
  product,
  override,
  categoryOptions,
  assignedCategoryId,
}: {
  product: Product;
  override: ProductOverrideRow | null;
  categoryOptions: { id: number; name: string }[];
  assignedCategoryId: number | null;
}) {
  const router = useRouter();
  const { dict, locale } = useLocale();
  const [nameMk, setNameMk] = useState(override?.name_mk ?? override?.name ?? product.names?.mk ?? product.name);
  const [nameEn, setNameEn] = useState(override?.name_en ?? product.names?.en ?? "");
  const [nameSq, setNameSq] = useState(override?.name_sq ?? product.names?.sq ?? "");
  const [excerptMk, setExcerptMk] = useState(override?.excerpt_mk ?? product.excerpt ?? "");
  const [excerptEn, setExcerptEn] = useState(override?.excerpt_en ?? "");
  const [excerptSq, setExcerptSq] = useState(override?.excerpt_sq ?? "");
  const [imageUrl, setImageUrl] = useState(override?.image_url ?? product.image ?? "");
  const [price, setPrice] = useState(override?.price?.toString() ?? product.price?.toString() ?? "");
  const [regularPrice, setRegularPrice] = useState(
    override?.regular_price?.toString() ?? product.regularPrice?.toString() ?? "",
  );
  const [stock, setStock] = useState(
    override?.in_stock === null || override?.in_stock === undefined ? "" : String(override.in_stock),
  );
  const [hidden, setHidden] = useState(Boolean(override?.hidden));
  const [unit, setUnit] = useState(override?.unit ?? "");
  const [tags, setTags] = useState(formatTagsInput(parseProductTags(override?.tags)));
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const catalogCategoryId = product.categories[0]?.id ?? null;
  const [categoryId, setCategoryId] = useState(
    String(assignedCategoryId ?? catalogCategoryId ?? ""),
  );

  async function save(reset = false) {
    setLoading(true);
    const result = await adminSaveProduct({
      source: product.source as CatalogSource,
      productId: product.id as number,
      nameMk,
      nameEn,
      nameSq,
      excerptMk,
      excerptEn,
      excerptSq,
      imageUrl,
      price,
      regularPrice,
      stock,
      hidden,
      unit,
      tags,
      reset,
    });
    if (!result.ok) {
      setLoading(false);
      setStatus(dict.admin.saveError);
      return;
    }

    if (typeof product.id === "number") {
      const selected = categoryId ? Number(categoryId) : catalogCategoryId;
      if (selected === catalogCategoryId) {
        await adminAssignProductCategory({
          source: product.source as CatalogSource,
          productId: product.id,
          categoryId: null,
        });
      } else if (selected) {
        await adminAssignProductCategory({
          source: product.source as CatalogSource,
          productId: product.id,
          categoryId: selected,
        });
      }
    }

    setLoading(false);
    setStatus(reset ? dict.admin.resetDone : dict.admin.saveDone);
    router.refresh();
  }

  const division = sourceLabels(product.source);
  const primaryCategory = product.categories[0];
  const categoryMk = primaryCategory
    ? categoryDisplayName({ source: product.source as CatalogSource, slug: primaryCategory.slug, name: primaryCategory.name }, "mk")
    : null;
  const categorySq = primaryCategory
    ? categoryDisplayName({ source: product.source as CatalogSource, slug: primaryCategory.slug, name: primaryCategory.name }, "sq")
    : null;
  const previewImage = imageUrl || product.image;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] xl:items-start">
      <aside className="space-y-3 xl:sticky xl:top-14">
        <Link
          href={productHref(product)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-surface px-3 py-1.5 text-xs font-semibold transition hover:border-tech hover:text-tech sm:text-sm"
        >
          {dict.admin.viewOnSite}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <div className="rounded-xl border border-ink/10 bg-card p-3">
          <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg bg-white">
            {previewImage ? (
              <CatalogImage src={previewImage} alt={product.name} className="max-h-full max-w-full object-contain p-3" />
            ) : (
              <span className="font-display text-ink/25">ITS</span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span
              className={
                product.source === "treco"
                  ? "rounded-full bg-tech/15 px-2.5 py-1 text-xs font-semibold text-tech"
                  : "rounded-full bg-home/15 px-2.5 py-1 text-xs font-semibold text-home"
              }
            >
              {catalogSourceName(product.source)}
            </span>
            <span className="text-xs text-ink/50">{division.mk} · {division.sq}</span>
          </div>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">
            {dict.admin.catalogOriginal}
          </p>
          <h2 className="mt-0.5 font-display text-base leading-snug">{product.name}</h2>
          {categoryMk && categorySq && (
            <p className="mt-2 text-sm text-ink/60">
              <span className="font-medium">{dict.admin.langMk}:</span> {categoryMk}
              <span className="mx-2 text-ink/25">·</span>
              <span className="font-medium">{dict.admin.langSq}:</span> {categorySq}
            </p>
          )}
          <p className="mt-2 text-sm text-ink/60">
            {formatPrice(product.price, locale, dict)} · {stockAvailabilityLabel(product, dict)}
          </p>
          {product.excerpt && (
            <div className="mt-3 border-t border-ink/10 pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                {dict.admin.catalogDescription}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink/60">{product.excerpt}</p>
            </div>
          )}
        </div>
      </aside>

      <form
        className="rounded-xl border border-ink/10 bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save(false);
        }}
      >
        <h3 className="font-display text-lg">{dict.admin.editProduct}</h3>

        {categoryOptions.length > 0 && (
          <label className="mt-4 grid gap-1 text-sm">
            <span>{dict.admin.productCategory}</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className={fieldClass}
            >
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </label>
        )}

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <label className="grid gap-1 text-sm lg:col-span-2">
            <span>{dict.admin.nameMk}</span>
            <input value={nameMk} onChange={(event) => setNameMk(event.target.value)} className={fieldClass} />
          </label>
          <label className="grid gap-1 text-sm">
            <span>{dict.admin.nameEn}</span>
            <input value={nameEn} onChange={(event) => setNameEn(event.target.value)} className={fieldClass} />
          </label>
          <label className="grid gap-1 text-sm">
            <span>{dict.admin.nameSq}</span>
            <input value={nameSq} onChange={(event) => setNameSq(event.target.value)} className={fieldClass} />
          </label>
          <label className="grid gap-1 text-sm lg:col-span-2">
            <span>{dict.admin.descriptionMk}</span>
            <textarea
              value={excerptMk}
              onChange={(event) => setExcerptMk(event.target.value)}
              rows={4}
              className={`${fieldClass} resize-y`}
            />
          </label>
          <label className="grid gap-1 text-sm lg:col-span-2">
            <span>{dict.admin.descriptionEn}</span>
            <textarea
              value={excerptEn}
              onChange={(event) => setExcerptEn(event.target.value)}
              rows={4}
              className={`${fieldClass} resize-y`}
            />
          </label>
          <label className="grid gap-1 text-sm lg:col-span-2">
            <span>{dict.admin.descriptionSq}</span>
            <textarea
              value={excerptSq}
              onChange={(event) => setExcerptSq(event.target.value)}
              rows={4}
              className={`${fieldClass} resize-y`}
            />
          </label>
          <div className="lg:col-span-2">
            <ImageUploadField value={imageUrl} onChange={setImageUrl} alt={nameMk || product.name} />
          </div>
          <label className="grid gap-1 text-sm">
            <span>{dict.admin.price}</span>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>{dict.admin.regularPrice}</span>
            <input
              type="number"
              min={0}
              value={regularPrice}
              onChange={(event) => setRegularPrice(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>{dict.admin.stock}</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              placeholder={dict.admin.stockDefault}
              className={fieldClass}
            />
            <span className="text-xs text-ink/50">{dict.admin.stockHint}</span>
          </label>
          <UnitSelectField value={unit} onChange={setUnit} />
          <TagsInputField value={tags} onChange={setTags} className="lg:col-span-2" />
          <label className="flex items-center gap-2 text-sm lg:col-span-2">
            <input type="checkbox" checked={hidden} onChange={(event) => setHidden(event.target.checked)} />
            <span>{dict.admin.hideProduct}</span>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-tech px-4 py-2 text-sm font-semibold text-cream disabled:opacity-50"
          >
            {dict.admin.save}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void save(true)}
            className="rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold hover:border-home hover:text-home"
          >
            {dict.admin.resetOverride}
          </button>
        </div>
        {status && <p className="mt-3 text-sm text-tech">{status}</p>}
      </form>
    </div>
  );
}
