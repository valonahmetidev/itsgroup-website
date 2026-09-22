import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/ProductView";
import { getCategory, getProduct, products } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((product) => ({ source: product.source, id: String(product.id) }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ source: string; id: string }>;
}): Promise<Metadata> {
  const { source, id } = await params;
  const product = getProduct(source, Number(id));
  return {
    title: product?.name ?? "Product",
    description: product?.excerpt || undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ source: string; id: string }>;
}) {
  const { source, id } = await params;
  const product = getProduct(source, Number(id));
  if (!product) notFound();

  const primaryCategory = product.categories[0];
  const category = primaryCategory ? getCategory(product.source, primaryCategory.id) : undefined;
  const relatedPool = primaryCategory
    ? products.filter(
        (item) =>
          item.source === product.source &&
          item.id !== product.id &&
          item.categories.some((entry) => entry.id === primaryCategory.id),
      )
    : [];
  const withImage = relatedPool.filter((item) => item.image);
  const related = (withImage.length > 0 ? withImage : relatedPool).slice(0, 4);

  return <ProductView product={product} category={category} related={related} />;
}
