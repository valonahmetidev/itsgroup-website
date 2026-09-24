import { AboutView } from "@/components/AboutView";
import { liveCatalogTotals } from "@/lib/catalog-live";
import { getServerI18n } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const { locale } = await getServerI18n();
  const totals = await liveCatalogTotals(locale);

  return <AboutView totals={totals} />;
}
