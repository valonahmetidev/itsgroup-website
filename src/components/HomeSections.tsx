"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { ProductGrid } from "@/components/ProductCard";
import { countProducts, formatCount } from "@/lib/format";
import { useCategoryLabel } from "@/lib/i18n/catalog-labels";
import { menuGroupTitle } from "@/lib/i18n/menu";
import type { Product } from "@/lib/types";

type CategoryCard = {
  group: string;
  groupKey: string;
  title: string;
  href: string;
  count: number;
  source: import("@/lib/types").Source;
  slug: string;
};

export function HomeSections({
  techFeatured,
  homeFeatured,
  itsFeatured,
  alevadoFeatured,
  techCategories,
  homeCategories,
  totals,
}: {
  techFeatured: Product[];
  homeFeatured: Product[];
  itsFeatured: Product[];
  alevadoFeatured: Product[];
  techCategories: CategoryCard[];
  homeCategories: CategoryCard[];
  totals: { treco: number; tremark: number; alevado: number; categories: number };
}) {
  const { dict } = useLocale();
  const categoryLabel = useCategoryLabel();

  return (
    <>
      <section className="shell py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tech">{dict.nav.technology}</p>
            <h2 className="mt-2 font-display text-3xl md:text-5xl">{dict.home.trecoTitle}</h2>
          </div>
          <Link href="/tehnologija" className="hidden text-sm font-semibold text-tech md:inline">
            {dict.home.allCategories}
          </Link>
        </div>
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {techCategories.map((category) => (
            <Link key={category.href} href={category.href} className="rounded-3xl border border-ink/10 bg-card p-5 transition hover:-translate-y-1 hover:shadow-lift">
              <p className="text-xs uppercase tracking-[0.14em] text-ink/40">
                {menuGroupTitle(dict, category.groupKey, category.group)}
              </p>
              <p className="mt-2 font-display text-2xl leading-tight">{categoryLabel(category)}</p>
              <p className="mt-3 text-sm text-ink/55">{countProducts(category.count, dict)}</p>
            </Link>
          ))}
        </div>
        <ProductGrid products={techFeatured} />
        {alevadoFeatured.length > 0 && (
          <div className="mt-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tech">{dict.catalog.alevadoProducts}</p>
                <h3 className="mt-2 font-display text-2xl md:text-4xl">{dict.home.alevadoTitle}</h3>
              </div>
              <Link href="/katalog?division=cables" className="hidden text-sm font-semibold text-tech md:inline">
                {dict.home.allCategories}
              </Link>
            </div>
            <ProductGrid products={alevadoFeatured} />
          </div>
        )}
      </section>

      <section className="bg-tech-deep text-cream">
        <div className="shell grid gap-8 py-16 md:grid-cols-3">
          <Stat value={formatCount(totals.treco)} label={dict.home.statTech} />
          <Stat value={formatCount(totals.tremark)} label={dict.home.statHome} />
          <Stat value={String(totals.categories)} label={dict.home.statCategories} />
        </div>
      </section>

      <section className="shell py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-home">{dict.nav.home}</p>
            <h2 className="mt-2 font-display text-3xl md:text-5xl">{dict.home.tremarkTitle}</h2>
          </div>
          <Link href="/dom" className="hidden text-sm font-semibold text-home md:inline">
            {dict.home.allCategories}
          </Link>
        </div>
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {homeCategories.map((category) => (
            <Link key={category.href} href={category.href} className="shrink-0 rounded-full border border-ink/10 bg-card px-4 py-2 text-sm font-medium hover:border-home hover:text-home">
              {categoryLabel(category)}
              <span className="ml-2 text-ink/40">{category.count}</span>
            </Link>
          ))}
        </div>
        <ProductGrid products={homeFeatured} />
      </section>

      {itsFeatured.length > 0 && (
        <section className="shell border-t border-ink/10 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">ITS Group</p>
              <h2 className="mt-2 font-display text-3xl md:text-5xl">{dict.home.itsTitle}</h2>
            </div>
            <Link href="/katalog?division=its" className="hidden text-sm font-semibold text-tech md:inline">
              {dict.home.allCategories}
            </Link>
          </div>
          <ProductGrid products={itsFeatured} />
        </section>
      )}

    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-5xl">{value}</p>
      <p className="mt-2 text-cream/70">{label}</p>
    </div>
  );
}
