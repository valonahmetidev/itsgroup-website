"use client";

import Link from "next/link";
import { CatalogImage } from "@/components/CatalogImage";
import { AddButton } from "@/components/Inquiry";
import { ProductGrid } from "@/components/ProductCard";
import { useCurrency } from "@/components/CurrencyProvider";
import { useLocale } from "@/components/LocaleProvider";
import { categoryHref } from "@/lib/catalog";
import { customerDivisionLabel, customerDivisionTone } from "@/lib/division-display";
import { salePercent } from "@/lib/format";
import { stockAvailabilityLabel } from "@/lib/stock-label";
import { useCategoryLabel } from "@/lib/i18n/catalog-labels";
import { categoryDisplayName } from "@/lib/i18n/catalog-labels";
import { ProductTypesTable } from "@/components/ProductTypesTable";
import { ProductTags } from "@/components/ui/ProductTags";
import { useProductExcerpt, useProductName } from "@/lib/use-product-name";
import type { Category, Product } from "@/lib/types";

export function ProductView({
  product,
  category,
  related,
  initialTypeId,
}: {
  product: Product;
  category?: Category;
  related: Product[];
  initialTypeId?: string;
}) {
  const { dict, locale } = useLocale();
  const { formatPrice } = useCurrency();
  const productName = useProductName(product);
  const productExcerpt = useProductExcerpt(product);
  const categoryLabel = useCategoryLabel();
  const discount = product.onSale ? salePercent(product.price, product.regularPrice) : null;
  const divisionLabel = customerDivisionLabel(product.source, locale, dict);
  const tone = customerDivisionTone(product.source);
  const categoryMk = category ? categoryDisplayName(category, "mk") : null;
  const categorySq = category ? categoryDisplayName(category, "sq") : null;
  const divisionHref =
    product.source === "tremark"
      ? "/dom"
      : product.source === "its"
        ? "/katalog?division=its"
        : product.source === "alevado"
          ? "/tehnologija"
          : "/tehnologija";

  return (
    <div className="shell min-w-0 py-6 sm:py-10">
      <nav className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink/50 sm:mb-6">
        <Link href={divisionHref}>{divisionLabel}</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={categoryHref(category)}>{categoryLabel(category)}</Link>
          </>
        )}
      </nav>
      <div className="grid min-w-0 items-start gap-6 sm:gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rise flex min-h-[min(280px,55vw)] items-center justify-center rounded-2xl border border-ink/10 bg-white p-4 sm:min-h-[420px] sm:rounded-[2rem] sm:p-8">
          {product.image ? (
            <CatalogImage src={product.image} alt={productName} className="max-h-[520px] w-full object-contain" />
          ) : (
            <span className="font-display text-4xl text-ink/20">ITS</span>
          )}
        </div>
        <div className="min-w-0">
          <p className={tone === "tech" ? "text-sm font-semibold text-tech" : "text-sm font-semibold text-home"}>
            {divisionLabel}
          </p>
          <h1 className="mt-2 font-display text-2xl leading-tight sm:text-4xl">{productName}</h1>
          {categoryMk && categorySq && (
            <p className="mt-2 text-sm text-ink/55">{categoryMk} · {categorySq}</p>
          )}
          <div className="mt-4 rounded-2xl border border-ink/10 bg-surface/60 p-4 sm:mt-6 sm:rounded-3xl sm:p-5">
            <div className="flex flex-wrap items-end gap-2 sm:gap-3">
              <p className="font-display text-3xl leading-none sm:text-4xl">{formatPrice(product.price)}</p>
              {discount && product.regularPrice != null && (
                <p className="pb-1 text-ink/40 line-through">{formatPrice(product.regularPrice)}</p>
              )}
              {discount && <span className="mb-1 rounded-full bg-home px-2 py-1 text-xs font-bold text-white">-{discount}%</span>}
            </div>
            {product.customerDiscountPercent && (
              <p className="mt-2 text-sm font-semibold text-tech">{dict.customer.yourDiscount}</p>
            )}
            <p className="mt-2 text-sm text-ink/55">{stockAvailabilityLabel(product, dict)}</p>
            <div className="mt-5">
              <AddButton
                variant="detail"
                source={product.source}
                id={product.id}
                name={productName}
                names={product.names}
                price={product.price}
                image={product.image}
                unit={product.unit}
                unitLocked={Boolean(product.unit)}
                types={product.types}
                initialTypeId={initialTypeId}
              />
            </div>
          </div>
          {productExcerpt && <p className="mt-6 max-w-xl leading-7 text-ink/75">{productExcerpt}</p>}
          {product.types && product.types.length > 0 && <ProductTypesTable types={product.types} />}
          {product.tags && product.tags.length > 0 && <ProductTags tags={product.tags} className="mt-6" />}
          <div className="mt-6 flex flex-wrap gap-2">
            {product.categories.map((item) => (
              <Link key={item.id} href={categoryHref({ source: product.source, id: item.id })} className="rounded-full bg-surface px-3 py-1 text-sm hover:text-tech">
                {categoryLabel({ source: product.source, slug: item.slug, name: item.name })}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl">{dict.product.sameCategory}</h2>
          <div className="mt-5">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
