"use client";

import Link from "next/link";
import { AddButton } from "@/components/Inquiry";
import { ProductGrid } from "@/components/ProductCard";
import { useLocale } from "@/components/LocaleProvider";
import { categoryHref } from "@/lib/catalog";
import { fill } from "@/lib/i18n";
import { formatPrice, salePercent } from "@/lib/format";
import { sourceMeta } from "@/lib/site";
import type { Category, Product } from "@/lib/types";

export function ProductView({
  product,
  category,
  related,
}: {
  product: Product;
  category?: Category;
  related: Product[];
}) {
  const { dict, locale } = useLocale();
  const meta = sourceMeta[product.source];
  const discount = product.onSale ? salePercent(product.price, product.regularPrice) : null;
  const divisionLabel = product.source === "treco" ? dict.nav.technology : dict.nav.home;

  return (
    <div className="shell py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink/50">
        <Link href={meta.href}>{divisionLabel}</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={categoryHref(category)}>{category.name}</Link>
          </>
        )}
      </nav>
      <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rise flex min-h-[420px] items-center justify-center rounded-[2rem] border border-ink/10 bg-white p-8">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.name} className="max-h-[520px] w-full object-contain" />
          ) : (
            <span className="font-display text-4xl text-ink/20">ITS</span>
          )}
        </div>
        <div>
          <p className={meta.tone === "tech" ? "text-sm font-semibold text-tech" : "text-sm font-semibold text-home"}>
            {meta.brand}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight">{product.name}</h1>
          <div className="mt-5 flex items-end gap-3">
            <p className="font-display text-4xl">{formatPrice(product.price, locale, dict)}</p>
            {discount && product.regularPrice != null && (
              <p className="pb-1 text-ink/40 line-through">{formatPrice(product.regularPrice, locale, dict)}</p>
            )}
            {discount && <span className="mb-1 rounded-full bg-home px-2 py-1 text-xs font-bold text-white">-{discount}%</span>}
          </div>
          <p className="mt-2 text-sm text-ink/55">{product.inStock ? dict.product.inStock : dict.product.checkStock}</p>
          {product.excerpt && <p className="mt-6 max-w-xl leading-7 text-ink/75">{product.excerpt}</p>}
          <div className="mt-6 flex flex-wrap gap-2">
            {product.categories.map((item) => (
              <Link key={item.id} href={categoryHref({ source: product.source, id: item.id })} className="rounded-full bg-surface px-3 py-1 text-sm hover:text-tech">
                {item.name}
              </Link>
            ))}
          </div>
          <div className="mt-6 max-w-sm">
            <AddButton source={product.source} id={product.id} name={product.name} price={product.price} image={product.image} />
          </div>
          <a href={product.permalink} className="mt-4 inline-flex text-sm font-semibold text-tech" target="_blank" rel="noreferrer">
            {fill(dict.product.openOn, { site: meta.origin.replace("https://", "") })}
          </a>
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
