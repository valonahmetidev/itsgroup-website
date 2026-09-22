"use client";

import Link from "next/link";
import { Pagination } from "@/components/Pagination";
import { ProductGrid } from "@/components/ProductCard";
import { useLocale } from "@/components/LocaleProvider";
import { categoryHref } from "@/lib/catalog";
import { countProducts } from "@/lib/format";
import { sourceMeta } from "@/lib/site";
import type { Category, Product, Source } from "@/lib/types";

export function CategoryView({
  category,
  trail,
  children,
  total,
  page,
  pages,
  visible,
}: {
  category: Category;
  trail: Category[];
  children: Category[];
  total: number;
  page: number;
  pages: number;
  visible: Product[];
}) {
  const { dict } = useLocale();
  const meta = sourceMeta[category.source as Source];

  return (
    <div className="shell py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-ink/50">
        <Link href={meta.href}>{category.source === "treco" ? dict.nav.technology : dict.nav.home}</Link>
        {trail.map((item) => (
          <span key={item.id} className="flex items-center gap-2">
            <span>/</span>
            <Link href={categoryHref(item)} className={item.id === category.id ? "text-ink" : ""}>
              {item.name}
            </Link>
          </span>
        ))}
      </nav>
      <h1 className="max-w-4xl font-display text-4xl leading-tight md:text-6xl">{category.name}</h1>
      <p className="mt-3 text-ink/60">{countProducts(total, dict)} · {meta.brand}</p>
      {children.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {children.map((child) => (
            <Link key={child.id} href={categoryHref(child)} className="rounded-full bg-surface px-4 py-2 text-sm hover:text-tech">
              {child.name}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-8">
        <ProductGrid products={visible} />
        <Pagination
          page={page}
          pages={pages}
          hrefFor={(nextPage) => (nextPage <= 1 ? categoryHref(category) : `${categoryHref(category)}?page=${nextPage}`)}
        />
      </div>
    </div>
  );
}
