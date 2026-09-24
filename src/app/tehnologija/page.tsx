import type { Metadata } from "next";
import { DivisionPage } from "@/components/DivisionPage";
import { liveCatalogTotals } from "@/lib/catalog-live";
import { getServerI18n } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Технологија",
  description: "Камери, мрежи, оптика, паметен дом и енергија од каталогот на ITS Group.",
};

export const dynamic = "force-dynamic";

export default async function TechnologyPage() {
  const { locale } = await getServerI18n();
  const totals = await liveCatalogTotals(locale);

  return <DivisionPage source="treco" productCount={totals.technology} catalogDivision="technology" />;
}
