"use client";

import Link from "next/link";
import { CatalogImage } from "@/components/CatalogImage";
import { AddButton } from "@/components/Inquiry";
import { useCurrency } from "@/components/CurrencyProvider";
import { useLocale } from "@/components/LocaleProvider";
import { customerDivisionLabel, customerDivisionTone } from "@/lib/division-display";
import { salePercent } from "@/lib/format";
import { stockAvailabilityLabel } from "@/lib/stock-label";
import { productHref } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { useProductName } from "@/lib/use-product-name";
import type { Product } from "@/lib/types";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { dict, locale } = useLocale();
  const { formatPrice } = useCurrency();
  const productName = useProductName(product);
  const href = productHref(product);
  const discount = product.onSale ? salePercent(product.price, product.regularPrice) : null;
  const tone = customerDivisionTone(product.source);
  const division = customerDivisionLabel(product.source, locale, dict);

  return (
    <article
      className="group rise flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-ink/10 bg-card p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lift"
      style={{ animationDelay: `${(index % 8) * 40}ms` }}
    >
      <Link href={href} className="relative flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-white">
        {product.image ? (
          <CatalogImage src={product.image} alt={productName} className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105" />
        ) : (
          <span className="font-display text-ink/30">{dict.product.placeholderInitials}</span>
        )}
        {discount && (
          <span className="absolute left-3 top-3 rounded-full bg-home px-2 py-1 text-xs font-bold text-white">-{discount}%</span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col px-1 pb-1 pt-3">
        <div className="space-y-0.5">
          <p className={tone === "tech" ? "text-xs font-semibold text-tech" : "text-xs font-semibold text-home"}>
            {division}
          </p>
          <p className="text-[11px] leading-snug text-ink/45">
            {stockAvailabilityLabel(product, dict)}
          </p>
        </div>
        <Link href={href} className="mt-1 line-clamp-2 min-h-12 font-medium leading-6 hover:text-tech">
          {productName}
        </Link>
        <div className="mt-auto min-w-0 space-y-2 pt-3">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="font-display text-lg leading-none">{formatPrice(product.price)}</p>
            {discount && product.regularPrice != null && (
              <p className="text-sm text-ink/40 line-through">{formatPrice(product.regularPrice)}</p>
            )}
          </div>
          {product.customerDiscountPercent && (
            <p className="text-xs font-semibold text-tech">{dict.customer.yourDiscount}</p>
          )}
          <AddButton
            source={product.source}
            id={product.id}
            name={productName}
            names={product.names}
            price={product.price}
            image={product.image}
            unit={product.unit}
            unitLocked={Boolean(product.unit)}
          />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, wide = false }: { products: Product[]; wide?: boolean }) {
  const { dict } = useLocale();

  if (products.length === 0) {
    return <p className="rounded-3xl border border-dashed border-ink/15 px-6 py-16 text-center text-ink/60">{dict.catalog.noProducts}</p>;
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        wide ? "lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "lg:grid-cols-3 xl:grid-cols-4",
      )}
    >
      {products.map((product, index) => (
        <ProductCard key={`${product.source}-${product.id}`} product={product} index={index} />
      ))}
    </div>
  );
}
