import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/CategoryView";
import { categories, categoryTrail, getCategory, productsInCategory } from "@/lib/catalog";
import { liveProductsInCategory } from "@/lib/catalog-live";
import { catalogDivisionToSource, isCatalogDivision, sourceToCatalogDivision } from "@/lib/divisions";
import { categoryDisplayName } from "@/lib/i18n/catalog-labels";

export function generateStaticParams() {
  return categories
    .filter((category) => productsInCategory(category.source, category.id).length > 0)
    .map((category) => ({
      division: sourceToCatalogDivision(category.source),
      id: String(category.id),
    }));
}

export const dynamic = "force-static";
export const dynamicParams = false;

/**
 * One cached document per category. Sort and stock filters stay in the query string
 * and are applied in the browser, so those URLs do not render again.
 */
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
  return { title: categoryDisplayName(category, "mk") };
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

  const products = await liveProductsInCategory(category.source, category.id);
  const trail = categoryTrail(category);
  const children = categories.filter(
    (item) =>
      item.source === category.source &&
      item.parent === category.id &&
      productsInCategory(item.source, item.id).length > 0,
  );

  return <CategoryView category={category} trail={trail} children={children} products={products} />;
}
