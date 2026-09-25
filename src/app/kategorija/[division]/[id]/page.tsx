import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CategoryView } from "@/components/CategoryView";
import { categories, categoryTrail, getCategory, productsInCategory } from "@/lib/catalog";
import { liveProductsInCategory } from "@/lib/catalog-live";
import { catalogDivisionToSource, isCatalogDivision, sourceToCatalogDivision } from "@/lib/divisions";
import { categoryDisplayName } from "@/lib/i18n/catalog-labels";
import { getServerI18n, getServerLocale } from "@/lib/i18n/server";

export function generateStaticParams() {
  return categories
    .filter((category) => productsInCategory(category.source, category.id).length > 0)
    .map((category) => ({
      division: sourceToCatalogDivision(category.source),
      id: String(category.id),
    }));
}

export const dynamicParams = false;

/** Filters/pagination use URL search params on the client so filter URLs stay static at the edge. */
export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ division: string; id: string }>;
}): Promise<Metadata> {
  const { division, id } = await params;
  if (!isCatalogDivision(division)) return { title: "Category" };
  const source = catalogDivisionToSource(division);
  if (source === "all") return { title: "Category" };
  const category = getCategory(source, Number(id));
  if (!category) return { title: "Category" };
  const locale = await getServerLocale();
  return { title: categoryDisplayName(category, locale) };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ division: string; id: string }>;
}) {
  const { division, id } = await params;
  if (!isCatalogDivision(division)) notFound();
  const source = catalogDivisionToSource(division);
  if (source === "all" || source === "its") notFound();

  const category = getCategory(source, Number(id));
  if (!category) notFound();

  const { locale } = await getServerI18n();
  const products = await liveProductsInCategory(category.source, category.id, locale);
  const trail = categoryTrail(category);
  const children = categories.filter(
    (item) =>
      item.source === category.source &&
      item.parent === category.id &&
      productsInCategory(item.source, item.id).length > 0,
  );

  return (
    <Suspense fallback={<div className="shell py-10 text-sm text-ink/55">…</div>}>
      <CategoryView category={category} trail={trail} children={children} products={products} />
    </Suspense>
  );
}
