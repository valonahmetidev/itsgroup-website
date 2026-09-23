"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CatalogImage } from "@/components/CatalogImage";
import { useLocale } from "@/components/LocaleProvider";
import { categoryDisplayName } from "@/lib/i18n/catalog-labels";
import { formatPrice } from "@/lib/format";
import { productHref } from "@/lib/paths";
import { stockAvailabilityLabel } from "@/lib/stock-label";
import { catalogSourceName } from "@/lib/source-labels";
import type { AdminProductListItem } from "@/app/admin/actions";

export function AdminProductCard({ product }: { product: AdminProductListItem }) {
  const { dict, locale } = useLocale();
  const categoryLabel = product.category ? categoryDisplayName(product.category, locale) : null;
  const publicHref = productHref(product);

  return (
    <article className="group relative rounded-xl border border-ink/10 bg-card p-2 transition hover:border-tech">
      <Link href={`/admin/products/${product.source}/${product.id}`} className="flex gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
          {product.image ? (
            <CatalogImage
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain p-1.5"
            />
          ) : (
            <span className="px-1 text-center text-[9px] uppercase tracking-wide text-ink/35">{dict.admin.noImage}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 pr-7">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={
                product.source === "treco"
                  ? "rounded-full bg-tech/15 px-2 py-0.5 text-[11px] font-semibold text-tech"
                  : product.source === "tremark"
                    ? "rounded-full bg-home/15 px-2 py-0.5 text-[11px] font-semibold text-home"
                    : "rounded-full bg-ink/10 px-2 py-0.5 text-[11px] font-semibold text-ink"
              }
            >
              {catalogSourceName(product.source)}
            </span>
            {categoryLabel && <span className="truncate text-[11px] text-ink/45">{categoryLabel}</span>}
          </div>
          <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug">{product.name}</p>
          <p className="mt-0.5 text-xs text-ink/55">
            {formatPrice(product.price, locale, dict)} · {stockAvailabilityLabel(product, dict)}
          </p>
        </div>
      </Link>
      <Link
        href={publicHref}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-ink/10 bg-surface text-ink/45 transition hover:border-tech hover:text-tech"
        aria-label={dict.admin.viewOnSite}
        title={dict.admin.viewOnSite}
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}
