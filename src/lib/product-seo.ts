import { catalogImageSrc } from "@/lib/catalog-image";
import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { sourceLabels } from "@/lib/source-labels";
import type { Product } from "@/lib/types";

export function productOgImageUrl(image: string | null | undefined, siteUrl: string) {
  const src = catalogImageSrc(image);
  if (!src) return undefined;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("//")) return `https:${src}`;
  const path = src.startsWith("/") ? src : `/${src}`;
  return `${siteUrl.replace(/\/$/, "")}${path}`;
}

function productBrandName(product: Product): string {
  for (const category of product.categories) {
    const dash = category.name.lastIndexOf(" - ");
    if (dash >= 0) {
      const brand = category.name.slice(dash + 3).trim();
      if (brand) return brand;
    }
  }

  const tagBrand = product.tags?.find((tag) => tag.trim().length > 0);
  if (tagBrand) return tagBrand.trim();

  const firstToken = product.name.trim().split(/\s+/)[0];
  if (firstToken && firstToken.length >= 2 && /[A-Za-zÀ-ž]/.test(firstToken)) {
    return firstToken;
  }

  return sourceLabels(product.source).brand;
}

function merchantReturnPolicy() {
  const { applicableCountry, returnPolicyDays, returnPolicyUrl } = site.merchantListing;
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry,
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: returnPolicyDays,
    returnMethod: "https://schema.org/ReturnInStore",
    returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
    url: returnPolicyUrl,
  };
}

function offerShippingDetails(currency: string) {
  const {
    applicableCountry,
    shippingHandlingDaysMin,
    shippingHandlingDaysMax,
    shippingTransitDaysMin,
    shippingTransitDaysMax,
  } = site.merchantListing;

  return {
    "@type": "OfferShippingDetails",
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: applicableCountry,
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: shippingHandlingDaysMin,
        maxValue: shippingHandlingDaysMax,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: shippingTransitDaysMin,
        maxValue: shippingTransitDaysMax,
        unitCode: "DAY",
      },
    },
    shippingRate: {
      "@type": "MonetaryAmount",
      value: "0",
      currency,
    },
  };
}

function productOffer(product: Product, productUrl: string) {
  const currency = product.currency || "MKD";
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    priceCurrency: currency,
    availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    url: productUrl,
    seller: { "@id": `${site.url}/#organization` },
    itemCondition: "https://schema.org/NewCondition",
    hasMerchantReturnPolicy: merchantReturnPolicy(),
    shippingDetails: offerShippingDetails(currency),
  };

  if (product.price != null && product.price > 0) {
    offer.price = product.price;
  }

  return offer;
}

export function productJsonLd(product: Product, locale: Locale, siteUrl: string) {
  const image = productOgImageUrl(product.image, siteUrl);
  const description = product.excerpt?.trim() || undefined;
  const productUrl = `${siteUrl.replace(/\/$/, "")}/proizvod/${product.id}`;
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    sku: String(product.id),
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: productBrandName(product),
    },
    offers: productOffer(product, productUrl),
  };
  if (image) base.image = image;
  if (locale) base.inLanguage = locale;
  return base;
}

export const productSeoSiteUrl = site.url;
