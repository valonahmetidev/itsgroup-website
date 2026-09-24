import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProductView } from "@/components/ProductView";
import { getCategory, getProductById, products, resolveLegacyProductId } from "@/lib/catalog";
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
  const resolved = resolveLegacyProductId(id);
  const base = resolved?.product ?? getProductById(id);
  const source = base?.source ?? "its";
  const productId = base ? String(base.id) : id;
  const product = await liveGetProduct(source, productId, locale);
  return {
    title: product?.name ?? "Product",
    description: product?.excerpt || undefined,
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await getServerI18n();
  const { id } = await params;
  const query = await searchParams;
  const resolved = resolveLegacyProductId(id);

  if (resolved && String(resolved.product.id) !== id) {
    const typeQuery = resolved.typeId ? `?type=${encodeURIComponent(resolved.typeId)}` : "";
    redirect(`/proizvod/${resolved.product.id}${typeQuery}`);
  }

  const base = resolved?.product ?? getProductById(id);
  const source = base?.source ?? "its";
  const productId = base ? String(base.id) : id;
  const product = await liveGetProduct(source, productId, locale);
  if (!product) notFound();

  const initialTypeId = query.type ?? resolved?.typeId ?? undefined;
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

  return (
    <ProductView
      product={product}
      category={category}
      related={related}
      initialTypeId={initialTypeId}
    />
  );
}
