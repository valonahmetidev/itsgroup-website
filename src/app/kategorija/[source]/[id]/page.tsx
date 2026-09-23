import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/CategoryView";
import { categories, categoryTrail, getCategory, isSource, productsInCategory } from "@/lib/catalog";
import { liveProductsInCategory } from "@/lib/catalog-live";
import {
  applyCatalogFilters,
  getPriceBounds,
  parseCatalogSearchParams,
  sortCatalogProducts,
} from "@/lib/catalog-filters";
import { categoryDisplayName } from "@/lib/i18n/catalog-labels";
import { getServerI18n, getServerLocale } from "@/lib/i18n/server";

const PAGE_SIZE = 24;

export function generateStaticParams() {
  return categories
    .filter((category) => productsInCategory(category.source, category.id).length > 0)
    .map((category) => ({ source: category.source, id: String(category.id) }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ source: string; id: string }>;
}): Promise<Metadata> {
  const { source, id } = await params;
  const category = getCategory(source, Number(id));
  if (!category) return { title: "Category" };
  const locale = await getServerLocale();
  return { title: categoryDisplayName(category, locale) };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ source: string; id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { source, id } = await params;
  const category = getCategory(source, Number(id));
  if (!category || !isSource(source)) notFound();

  const { locale } = await getServerI18n();
  const query = parseCatalogSearchParams(await searchParams);
  const base = await liveProductsInCategory(category.source, category.id, locale);
  const priceBounds = getPriceBounds(base);
  const matched = sortCatalogProducts(applyCatalogFilters(base, query), query.sort);
  const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const visible = matched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const trail = categoryTrail(category);
  const children = categories.filter(
    (item) => item.source === category.source && item.parent === category.id && productsInCategory(item.source, item.id).length > 0,
  );

  return (
    <CategoryView
      category={category}
      trail={trail}
      children={children}
      query={query}
      total={matched.length}
      page={page}
      pages={pages}
      visible={visible}
      priceBounds={priceBounds}
    />
  );
}
