"use client";

import Link from "next/link";
import { AddButton } from "@/components/Inquiry";
import { useLocale } from "@/components/LocaleProvider";
import { formatPrice, salePercent } from "@/lib/format";
import { productHref } from "@/lib/catalog";
import { sourceMeta } from "@/lib/site";
import type { Product } from "@/lib/types";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { dict, locale } = useLocale();
  const href = productHref(product);
  const discount = product.onSale ? salePercent(product.price, product.regularPrice) : null;
  const meta = sourceMeta[product.source];

  return (
    <article
      className="group rise flex h-full flex-col rounded-3xl border border-ink/10 bg-card p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lift"
      style={{ animationDelay: `${(index % 8) * 40}ms` }}
    >
      <Link href={href} className="relative flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-white">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105" />
        ) : (
          <span className="font-display text-ink/30">ITS</span>
        )}
        {discount && (
          <span className="absolute left-3 top-3 rounded-full bg-home px-2 py-1 text-xs font-bold text-white">-{discount}%</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        <p className={meta.tone === "tech" ? "text-xs font-semibold text-tech" : "text-xs font-semibold text-home"}>
          {meta.brand}
        </p>
        <Link href={href} className="mt-1 line-clamp-2 min-h-12 font-medium leading-6 hover:text-tech">
          {product.name}
        </Link>
        <div className="mt-auto pt-3">
          <p className="font-display text-lg">{formatPrice(product.price, locale, dict)}</p>
          {discount && product.regularPrice != null && (
            <p className="text-sm text-ink/40 line-through">{formatPrice(product.regularPrice, locale, dict)}</p>
          )}
          <p className="text-xs text-ink/45">{product.inStock ? dict.product.inStock : dict.product.checkStock}</p>
          <AddButton
            source={product.source}
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
          />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  const { dict } = useLocale();

  if (products.length === 0) {
    return <p className="rounded-3xl border border-dashed border-ink/15 px-6 py-16 text-center text-ink/60">{dict.catalog.noProducts}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={`${product.source}-${product.id}`} product={product} index={index} />
      ))}
    </div>
  );
}
