import { catalogImageSrc } from "@/lib/catalog-image";
import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";

export function productOgImageUrl(image: string | null | undefined, siteUrl: string) {
  const src = catalogImageSrc(image);
  if (!src) return undefined;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("//")) return `https:${src}`;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${siteUrl.replace(/\/$/, "")}${path}`;
}

export function productJsonLd(product: Product, locale: Locale, siteUrl: string) {
  const image = productOgImageUrl(product.image, siteUrl);
  const description = product.excerpt?.trim() || undefined;
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    sku: String(product.id),
    url: `${siteUrl.replace(/\/$/, "")}/proizvod/${product.id}`,
  };
  if (image) base.image = image;
  if (product.price != null && product.price > 0) {
    base.offers = {
      "@type": "Offer",
      priceCurrency: product.currency || "MKD",
      price: product.price,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: base.url,
    };
  }
  if (locale) base.inLanguage = locale;
  return base;
}

export const productSeoSiteUrl = site.url;
