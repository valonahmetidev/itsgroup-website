import { DivisionPage } from "@/components/DivisionPage";
import { publicCatalogTotals } from "@/lib/catalog-live";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-static";
export const revalidate = 120;

export function generateMetadata() {
  return createStaticPageMetadata("technology");
}

export default async function TechnologyPage() {
  const totals = await publicCatalogTotals();
  return <DivisionPage source="treco" productCount={totals.technology} catalogDivision="technology" />;
}
