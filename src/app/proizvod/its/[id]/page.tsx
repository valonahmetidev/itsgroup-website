import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/ProductView";
import { liveGetProduct, liveProducts } from "@/lib/catalog-live";
import { getServerI18n } from "@/lib/i18n/server";

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { locale } = await getServerI18n();
  const { id } = await params;
  const product = await liveGetProduct("its", id, locale);
  return {
    title: product?.name ?? "Product",
    description: product?.excerpt || undefined,
  };
}

export default async function ItsProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { locale } = await getServerI18n();
  const { id } = await params;
  const product = await liveGetProduct("its", id, locale);
  if (!product) notFound();

  const catalog = await liveProducts(locale);
  const related = catalog.filter((item) => item.source === "its" && item.id !== product.id).slice(0, 4);

  return <ProductView product={product} category={undefined} related={related} />;
}
