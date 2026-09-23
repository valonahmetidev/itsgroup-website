"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { adminSaveProduct } from "@/app/admin/actions";
import { CatalogImage } from "@/components/CatalogImage";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { UnitSelectField } from "@/components/admin/UnitSelectField";
import { useLocale } from "@/components/LocaleProvider";
import { categoryDisplayName } from "@/lib/i18n/catalog-labels";
import { formatPrice } from "@/lib/format";
import { productHref } from "@/lib/paths";
import { stockAvailabilityLabel } from "@/lib/stock-label";
import { catalogSourceName, sourceLabels } from "@/lib/source-labels";
import type { ProductOverrideRow } from "@/lib/catalog-overrides";
import type { CatalogSource, Product } from "@/lib/types";

const fieldClass =
  "rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech focus:outline-none focus-visible:outline-none";

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
  const [stock, setStock] = useState(
    override?.in_stock === null || override?.in_stock === undefined ? "" : String(override.in_stock),
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
      stock,
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
    <div className="grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:items-start">
      <aside className="space-y-4 xl:sticky xl:top-20">
        <Link
          href={productHref(product)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-surface px-4 py-2 text-sm font-semibold transition hover:border-tech hover:text-tech"
        >
          {dict.admin.viewOnSite}
          <ExternalLink className="h-4 w-4" />
        </Link>
        <div className="rounded-3xl border border-ink/10 bg-card p-5">
          <div className="flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-white">
            {previewImage ? (
              <CatalogImage src={previewImage} alt={product.name} className="max-h-full max-w-full object-contain p-3" />
            ) : (
              <span className="font-display text-ink/25">ITS</span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
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
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
            {dict.admin.catalogOriginal}
          </p>
          <h2 className="mt-1 font-display text-xl leading-snug">{product.name}</h2>
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
        </div>
      </aside>

      <form
        className="rounded-3xl border border-ink/10 bg-card p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void save(false);
        }}
      >
        <h3 className="font-display text-xl">{dict.admin.editProduct}</h3>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
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
          <label className="flex items-center gap-2 text-sm lg:col-span-2">
            <input type="checkbox" checked={hidden} onChange={(event) => setHidden(event.target.checked)} />
            <span>{dict.admin.hideProduct}</span>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-ink/10 pt-5">
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
        {status && <p className="mt-3 text-sm text-tech">{status}</p>}
      </form>
    </div>
  );
}
