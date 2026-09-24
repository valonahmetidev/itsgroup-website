import { redirect } from "next/navigation";
import { CatalogView } from "@/components/CatalogView";
import {
  applyCatalogFilters,
  filterCatalogByDivision,
  getPriceBounds,
  parseCatalogSearchParams,
  sortCatalogProducts,
} from "@/lib/catalog-filters";
import { liveProducts, liveSearchProducts } from "@/lib/catalog-live";
import { catalogHref } from "@/lib/format";
import { getServerI18n } from "@/lib/i18n/server";

const PAGE_SIZE = 24;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const raw = await searchParams;
  if (raw.source && !raw.division) {
    redirect(catalogHref(parseCatalogSearchParams(raw)));
  }

  const { locale } = await getServerI18n();
  const query = parseCatalogSearchParams(raw);
  const catalog = await liveProducts(locale);
  const base = query.q
    ? await liveSearchProducts(query.q, query.division, locale)
    : filterCatalogByDivision(catalog, query.division);
  const priceBounds = getPriceBounds(base);
  const filtered = applyCatalogFilters(base, query);
  const matched = query.q && query.sort === "name" ? filtered : sortCatalogProducts(filtered, query.sort);
  const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  const visible = matched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <CatalogView
      query={query}
      total={matched.length}
      page={page}
      pages={pages}
      visible={visible}
      priceBounds={priceBounds}
    />
  );
}
