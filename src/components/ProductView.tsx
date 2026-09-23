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
import { useCategoryLabel } from "@/lib/i18n/catalog-labels";
import { categoryDisplayName } from "@/lib/i18n/catalog-labels";
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
  const { formatPrice } = useCurrency();
  const categoryLabel = useCategoryLabel();
  const discount = product.onSale ? salePercent(product.price, product.regularPrice) : null;
  const divisionLabel = customerDivisionLabel(product.source, locale, dict);
  const tone = customerDivisionTone(product.source);
  const categoryMk = category ? categoryDisplayName(category, "mk") : null;
  const categorySq = category ? categoryDisplayName(category, "sq") : null;
  const divisionHref = product.source === "tremark" ? "/dom" : product.source === "its" ? "/katalog?source=its" : "/tehnologija";

  return (
    <div className="shell py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink/50">
        <Link href={divisionHref}>{divisionLabel}</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={categoryHref(category)}>{categoryLabel(category)}</Link>
          </>
        )}
      </nav>
      <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rise flex min-h-[420px] items-center justify-center rounded-[2rem] border border-ink/10 bg-white p-8">
          {product.image ? (
            <CatalogImage src={product.image} alt={product.name} className="max-h-[520px] w-full object-contain" />
          ) : (
            <span className="font-display text-4xl text-ink/20">ITS</span>
          )}
        </div>
        <div>
          <p className={tone === "tech" ? "text-sm font-semibold text-tech" : "text-sm font-semibold text-home"}>
            {divisionLabel}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight">{product.name}</h1>
          {categoryMk && categorySq && (
            <p className="mt-2 text-sm text-ink/55">{categoryMk} · {categorySq}</p>
          )}
          <div className="mt-6 rounded-3xl border border-ink/10 bg-surface/60 p-5">
            <div className="flex flex-wrap items-end gap-3">
              <p className="font-display text-4xl leading-none">{formatPrice(product.price)}</p>
              {discount && product.regularPrice != null && (
                <p className="pb-1 text-ink/40 line-through">{formatPrice(product.regularPrice)}</p>
              )}
              {discount && <span className="mb-1 rounded-full bg-home px-2 py-1 text-xs font-bold text-white">-{discount}%</span>}
            </div>
            {product.customerDiscountPercent && (
              <p className="mt-2 text-sm font-semibold text-tech">{dict.customer.yourDiscount}</p>
            )}
            <p className="mt-2 text-sm text-ink/55">{product.inStock ? dict.product.inStock : dict.product.checkStock}</p>
            <div className="mt-5">
              <AddButton
                variant="detail"
                source={product.source}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                unit={product.unit}
                unitLocked={Boolean(product.unit)}
              />
            </div>
          </div>
          {product.excerpt && <p className="mt-6 max-w-xl leading-7 text-ink/75">{product.excerpt}</p>}
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
