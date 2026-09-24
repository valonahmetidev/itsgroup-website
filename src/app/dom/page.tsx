import type { Metadata } from "next";
import { DivisionPage } from "@/components/DivisionPage";
import { liveCatalogTotals } from "@/lib/catalog-live";
import { getServerI18n } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Дом",
  description: "Готвење, кафе, нега, чистење и удобност од каталогот на ITS Group.",
};

export const dynamic = "force-dynamic";

export default async function HomeLivingPage() {
  const { locale } = await getServerI18n();
  const totals = await liveCatalogTotals(locale);

  return <DivisionPage source="tremark" productCount={totals.home} catalogDivision="home" />;
}
