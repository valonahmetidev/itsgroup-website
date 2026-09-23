"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminSaveProduct } from "@/app/admin/actions";
import { CatalogImage } from "@/components/CatalogImage";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { UnitSelectField } from "@/components/admin/UnitSelectField";
import { useLocale } from "@/components/LocaleProvider";
import { categoryDisplayName } from "@/lib/i18n/catalog-labels";
import { formatPrice } from "@/lib/format";
import { sourceLabels } from "@/lib/source-labels";
import type { ProductOverrideRow } from "@/lib/catalog-overrides";
import type { CatalogSource, Product } from "@/lib/types";

export function ProductEditForm({
  product,
  override,
}: {
  product: Product;
  override: ProductOverrideRow | null;
}) {
  const router = useRouter();
  const { dict, locale } = useLocale();
  const [nameMk, setNameMk] = useState(override?.name_mk ?? override?.name ?? product.names?.mk ?? product.name);
  const [nameEn, setNameEn] = useState(override?.name_en ?? product.names?.en ?? "");
  const [nameSq, setNameSq] = useState(override?.name_sq ?? product.names?.sq ?? "");
  const [imageUrl, setImageUrl] = useState(override?.image_url ?? product.image ?? "");
  const [price, setPrice] = useState(override?.price?.toString() ?? product.price?.toString() ?? "");
  const [regularPrice, setRegularPrice] = useState(
    override?.regular_price?.toString() ?? product.regularPrice?.toString() ?? "",
  );
  const [inStock, setInStock] = useState<"default" | "yes" | "no">(
    override?.in_stock === null || override?.in_stock === undefined
      ? "default"
      : override.in_stock === 1
        ? "yes"
        : "no",
  );
  const [hidden, setHidden] = useState(Boolean(override?.hidden));
  const [unit, setUnit] = useState(override?.unit ?? "");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function save(reset = false) {
    setLoading(true);
    const result = await adminSaveProduct({
      source: product.source as CatalogSource,
      productId: product.id as number,
      nameMk,
      nameEn,
      nameSq,
      imageUrl,
      price,
      regularPrice,
      inStock,
      hidden,
      unit,
      reset,
    });
    setLoading(false);
    if (!result.ok) {
      setStatus(dict.admin.saveError);
      return;
    }
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
    <div className="max-w-2xl space-y-6">
      <div className="rounded-3xl border border-ink/10 bg-card p-6">
        <div className="flex flex-wrap items-start gap-4">
          {previewImage && (
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
              <CatalogImage src={previewImage} alt={product.name} className="h-full w-full object-contain p-2" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={
                  product.source === "treco"
                    ? "rounded-full bg-tech/15 px-2.5 py-1 text-xs font-semibold text-tech"
                    : "rounded-full bg-home/15 px-2.5 py-1 text-xs font-semibold text-home"
                }
              >
                {division.brand}
              </span>
              <span className="text-xs text-ink/50">{division.mk} · {division.sq}</span>
            </div>
            <p className="mt-3 text-sm text-ink/55">{dict.admin.catalogOriginal}</p>
            <h2 className="mt-1 font-display text-2xl">{product.name}</h2>
            {categoryMk && categorySq && (
              <p className="mt-2 text-sm text-ink/60">
                <span className="font-medium">{dict.admin.langMk}:</span> {categoryMk}
                <span className="mx-2 text-ink/25">·</span>
                <span className="font-medium">{dict.admin.langSq}:</span> {categorySq}
              </p>
            )}
            <p className="mt-2 text-sm text-ink/60">
              {formatPrice(product.price, locale, dict)} · {product.inStock ? dict.product.inStock : dict.product.checkStock}
            </p>
          </div>
        </div>
      </div>

      <form
        className="space-y-4 rounded-3xl border border-ink/10 bg-card p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void save(false);
        }}
      >
        <h3 className="font-display text-xl">{dict.admin.editProduct}</h3>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.nameMk}</span>
          <input
            value={nameMk}
            onChange={(event) => setNameMk(event.target.value)}
            className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.nameEn}</span>
          <input
            value={nameEn}
            onChange={(event) => setNameEn(event.target.value)}
            className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.nameSq}</span>
          <input
            value={nameSq}
            onChange={(event) => setNameSq(event.target.value)}
            className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
          />
        </label>
        <ImageUploadField value={imageUrl} onChange={setImageUrl} alt={nameMk || product.name} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span>{dict.admin.price}</span>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>{dict.admin.regularPrice}</span>
            <input
              type="number"
              min={0}
              value={regularPrice}
              onChange={(event) => setRegularPrice(event.target.value)}
              className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
            />
          </label>
        </div>
        <UnitSelectField value={unit} onChange={setUnit} />
        <label className="grid gap-1 text-sm">
          <span>{dict.admin.stock}</span>
          <select
            value={inStock}
            onChange={(event) => setInStock(event.target.value as "default" | "yes" | "no")}
            className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
          >
            <option value="default">{dict.admin.stockDefault}</option>
            <option value="yes">{dict.product.inStock}</option>
            <option value="no">{dict.product.checkStock}</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={hidden} onChange={(event) => setHidden(event.target.checked)} />
          <span>{dict.admin.hideProduct}</span>
        </label>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-tech px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-50"
          >
            {dict.admin.save}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void save(true)}
            className="rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold hover:border-home hover:text-home"
          >
            {dict.admin.resetOverride}
          </button>
        </div>
        {status && <p className="text-sm text-tech">{status}</p>}
      </form>
    </div>
  );
}
