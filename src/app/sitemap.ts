import type { MetadataRoute } from "next";
import { categories, categoryHref, productHref, products, productsInCategory } from "@/lib/catalog";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/tehnologija",
    "/dom",
    "/katalog",
    "/za-nas",
    "/kontakt",
    "/ponuda",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${site.url}${path || "/"}`,
    lastModified: now,
  }));

  const categoryRoutes = categories
    .filter((category) => productsInCategory(category.source, category.id).length > 0)
    .map((category) => ({
      url: `${site.url}${categoryHref(category)}`,
      lastModified: now,
    }));

  const productRoutes = products.map((product) => ({
    url: `${site.url}${productHref(product)}`,
    lastModified: now,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
