import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryView } from "@/components/CategoryView";
import { categories, categoryTrail, getCategory, isSource, productsInCategory } from "@/lib/catalog";

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
  return { title: category?.name ?? "Category" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ source: string; id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { source, id } = await params;
  const category = getCategory(source, Number(id));
  if (!category || !isSource(source)) notFound();

  const page = Math.max(1, Number((await searchParams).page) || 1);
  const matched = productsInCategory(category.source, category.id);
  const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = matched.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const trail = categoryTrail(category);
  const children = categories.filter(
    (item) => item.source === category.source && item.parent === category.id && productsInCategory(item.source, item.id).length > 0,
  );

  return (
    <CategoryView
      category={category}
      trail={trail}
      children={children}
      total={matched.length}
      page={current}
      pages={pages}
      visible={visible}
    />
  );
}
