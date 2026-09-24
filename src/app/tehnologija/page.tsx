import { DivisionPage } from "@/components/DivisionPage";
import { liveCatalogTotals } from "@/lib/catalog-live";
import { getServerI18n } from "@/lib/i18n/server";
import { createPageMetadata } from "@/lib/page-metadata";

export async function generateMetadata() {
  return createPageMetadata("technology");
}

export const dynamic = "force-dynamic";

export default async function TechnologyPage() {
  const { locale } = await getServerI18n();
  const totals = await liveCatalogTotals(locale);

  return <DivisionPage source="treco" productCount={totals.technology} catalogDivision="technology" />;
}
