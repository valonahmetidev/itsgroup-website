"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CatalogImage } from "@/components/CatalogImage";
import { useLocale } from "@/components/LocaleProvider";
import { categoryDisplayName } from "@/lib/i18n/catalog-labels";
import { formatPrice } from "@/lib/format";
import { productHref } from "@/lib/paths";
import { stockAvailabilityLabel } from "@/lib/stock-label";
import { catalogSourceName, sourceLabels } from "@/lib/source-labels";
import type { AdminProductListItem } from "@/app/admin/actions";

export function AdminProductCard({ product }: { product: AdminProductListItem }) {
  const { dict, locale } = useLocale();
  const division = sourceLabels(product.source);
  const categoryMk = product.category ? categoryDisplayName(product.category, "mk") : null;
  const categorySq = product.category ? categoryDisplayName(product.category, "sq") : null;
  const publicHref = productHref(product);

  return (
    <article className="group relative rounded-3xl border border-ink/10 bg-card p-3 transition hover:border-tech hover:shadow-sm">
      <Link href={`/admin/products/${product.source}/${product.id}`} className="flex gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
          {product.image ? (
            <CatalogImage
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="px-2 text-center text-[10px] uppercase tracking-wide text-ink/35">{dict.admin.noImage}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={
                product.source === "treco"
                  ? "rounded-full bg-tech/15 px-2.5 py-1 text-xs font-semibold text-tech"
                  : product.source === "tremark"
                    ? "rounded-full bg-home/15 px-2.5 py-1 text-xs font-semibold text-home"
                    : "rounded-full bg-ink/10 px-2.5 py-1 text-xs font-semibold text-ink"
              }
            >
              {catalogSourceName(product.source)}
            </span>
            <span className="text-xs text-ink/50">
              {product.source === "its" ? dict.admin.storeProducts : `${division.mk} · ${division.sq}`}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 font-medium leading-6">{product.name}</p>
          {categoryMk && categorySq && (
            <p className="mt-1 text-xs text-ink/55">
              <span className="font-medium text-ink/70">{dict.admin.langMk}:</span> {categoryMk}
              <span className="mx-1.5 text-ink/25">·</span>
              <span className="font-medium text-ink/70">{dict.admin.langSq}:</span> {categorySq}
            </p>
          )}
          <p className="mt-2 text-sm text-ink/55">
            {formatPrice(product.price, locale, dict)} · {stockAvailabilityLabel(product, dict)}
          </p>
        </div>
      </Link>
      <Link
        href={publicHref}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 bg-surface text-ink/45 transition hover:border-tech hover:text-tech"
        aria-label={dict.admin.viewOnSite}
        title={dict.admin.viewOnSite}
      >
        <ExternalLink className="h-4 w-4" />
      </Link>
    </article>
  );
}
