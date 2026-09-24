import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/ProductView";
import { getCategory, getProductById, products } from "@/lib/catalog";
import { liveGetProduct, liveProducts } from "@/lib/catalog-live";
import { getServerI18n } from "@/lib/i18n/server";

export function generateStaticParams() {
  return products.map((product) => ({ id: String(product.id) }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { locale } = await getServerI18n();
  const { id } = await params;
  const base = getProductById(id);
  const source = base?.source ?? "its";
  const product = await liveGetProduct(source, id, locale);
  return {
    title: product?.name ?? "Product",
    description: product?.excerpt || undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { locale } = await getServerI18n();
  const { id } = await params;
  const base = getProductById(id);
  const source = base?.source ?? "its";
  const product = await liveGetProduct(source, id, locale);
  if (!product) notFound();

  const primaryCategory = base?.categories[0];
  const category = primaryCategory ? getCategory(product.source, primaryCategory.id) : undefined;
  const catalog = await liveProducts(locale);
  const relatedPool = primaryCategory
    ? catalog.filter(
        (item) =>
          item.source === product.source &&
          item.id !== product.id &&
          item.categories.some((entry) => entry.id === primaryCategory.id),
      )
    : catalog.filter((item) => item.source === product.source && item.id !== product.id);
  const related = relatedPool.slice(0, 4);

  return <ProductView product={product} category={category} related={related} />;
}
