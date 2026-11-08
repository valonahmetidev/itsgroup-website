import { DivisionPage } from "@/components/DivisionPage";
import { publicCatalogTotals } from "@/lib/catalog-live";
import { createStaticPageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-static";
export const revalidate = 120;

export function generateMetadata() {
  return createStaticPageMetadata("homeDivision");
}

export default async function HomeLivingPage() {
  const totals = await publicCatalogTotals();
  return <DivisionPage source="tremark" productCount={totals.home} catalogDivision="home" />;
}
