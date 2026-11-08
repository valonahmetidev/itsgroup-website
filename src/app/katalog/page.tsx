import { CatalogView } from "@/components/CatalogView";
import { publicCatalog } from "@/lib/catalog-live";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-static";
export const revalidate = 120;

export function generateMetadata() {
  return createStaticPageMetadata("catalog");
}

export default async function CatalogPage() {
  const products = await publicCatalog();
  return <CatalogView products={products} />;
}
