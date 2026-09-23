import { CatalogView } from "@/components/CatalogView";
import { liveProducts, liveSearchProducts } from "@/lib/catalog-live";
import {
  applyCatalogFilters,
  getPriceBounds,
  parseCatalogSearchParams,
  sortCatalogProducts,
} from "@/lib/catalog-filters";
import { getServerI18n } from "@/lib/i18n/server";
import type { Source } from "@/lib/types";

const PAGE_SIZE = 24;

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await getServerI18n();
  const query = parseCatalogSearchParams(await searchParams);
  const source = query.source === "all" ? undefined : (query.source as Source);
  const catalog = await liveProducts(locale);
  const base = query.q
    ? await liveSearchProducts(query.q, source, locale)
    : catalog.filter((product) => !source || product.source === source);
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
