import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProductJsonLd } from "@/components/ProductJsonLd";
import { ProductView } from "@/components/ProductView";
import { getCategory, getProductById, products, resolveLegacyProductId } from "@/lib/catalog";
import { publicProductPage } from "@/lib/catalog-live";
import { productJsonLd, productOgImageUrl, productSeoSiteUrl } from "@/lib/product-seo";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return products.map((product) => ({ id: String(product.id) }));
}

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resolved = resolveLegacyProductId(id);
  const base = resolved?.product ?? getProductById(id);
  const source = base?.source ?? "its";
  const productId = base ? String(base.id) : id;
  const { product } = await publicProductPage(source, productId);
  const title = product?.name ?? "Product";
  const description = product?.excerpt || undefined;
  const ogImage = product ? productOgImageUrl(product.image, productSeoSiteUrl) : undefined;
  const fullTitle = `${title} · ITS Group`;

  return {
    title,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: `${site.url}/proizvod/${productId}`,
      siteName: site.name,
      locale: "mk",
      type: "website",
      images: ogImage ? [{ url: ogImage, alt: title }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: fullTitle,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resolved = resolveLegacyProductId(id);

  if (resolved && String(resolved.product.id) !== id) {
    const typeQuery = resolved.typeId ? `?type=${encodeURIComponent(resolved.typeId)}` : "";
    redirect(`/proizvod/${resolved.product.id}${typeQuery}`);
  }

  const base = resolved?.product ?? getProductById(id);
  const source = base?.source ?? "its";
  const productId = base ? String(base.id) : id;
  const { product, related } = await publicProductPage(source, productId);
  if (!product) notFound();

  const primaryCategory = base?.categories[0];
  const category = primaryCategory ? getCategory(product.source, primaryCategory.id) : undefined;
  const jsonLd = productJsonLd(product, "mk", productSeoSiteUrl);

  return (
    <>
      <ProductJsonLd data={jsonLd} />
      <ProductView product={product} category={category} related={related} initialTypeId={resolved?.typeId ?? undefined} />
    </>
  );
}
