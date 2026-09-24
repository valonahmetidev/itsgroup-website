import { productMatchesDivision } from "@/lib/catalog-counts";
import { parseCatalogDivisionParam, type CatalogDivision } from "@/lib/divisions";
import type { CatalogQuery, Product } from "@/lib/types";

export type StockFilter = "all" | "in" | "out";
export type SaleFilter = "all" | "yes" | "no";
export type PriceTypeFilter = "all" | "priced" | "on-request";

export type ParsedCatalogQuery = {
  q: string;
  division: CatalogDivision | "all";
  sort: NonNullable<CatalogQuery["sort"]>;
  page: number;
  min?: number;
  max?: number;
  stock: StockFilter;
  sale: SaleFilter;
  priceType: PriceTypeFilter;
};

type SearchParams = {
  q?: string;
  division?: string;
  source?: string;
  sort?: string;
  page?: string;
  min?: string;
  max?: string;
  stock?: string;
  sale?: string;
  priceType?: string;
};

function parseNumber(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.round(parsed);
}

export function parseCatalogSearchParams(search: SearchParams): ParsedCatalogQuery {
  const division = parseCatalogDivisionParam(search.division ?? search.source);
  const sort: ParsedCatalogQuery["sort"] =
    search.sort === "price-asc" || search.sort === "price-desc" ? search.sort : "name";
  const stock: StockFilter = search.stock === "in" || search.stock === "out" ? search.stock : "all";
  const sale: SaleFilter = search.sale === "yes" || search.sale === "no" ? search.sale : "all";
  const priceType: PriceTypeFilter =
    search.priceType === "priced" || search.priceType === "on-request" ? search.priceType : "all";

  const min = parseNumber(search.min);
  const max = parseNumber(search.max);

  return {
    q: search.q?.trim() ?? "",
    division,
    sort,
    page: Math.max(1, Number(search.page) || 1),
    min: min !== undefined && max !== undefined && min > max ? max : min,
    max: min !== undefined && max !== undefined && min > max ? min : max,
    stock,
    sale,
    priceType,
  };
}

export function hasActiveFilters(query: ParsedCatalogQuery) {
  return (
    query.stock !== "all" ||
    query.sale !== "all" ||
    query.priceType !== "all" ||
    query.min !== undefined ||
    query.max !== undefined
  );
}

export type ActiveCatalogFilterChip = {
  id: string;
  patch: Partial<ParsedCatalogQuery>;
};

export function getActiveCatalogFilterChips(
  query: ParsedCatalogQuery,
  options: { showDivision?: boolean } = {},
): ActiveCatalogFilterChip[] {
  const { showDivision = true } = options;
  const chips: ActiveCatalogFilterChip[] = [];

  if (showDivision && query.division !== "all") {
    chips.push({ id: "division", patch: { division: "all", page: 1 } });
  }
  if (query.stock !== "all") {
    chips.push({ id: "stock", patch: { stock: "all", page: 1 } });
  }
  if (query.sale !== "all") {
    chips.push({ id: "sale", patch: { sale: "all", page: 1 } });
  }
  if (query.priceType !== "all") {
    chips.push({ id: "priceType", patch: { priceType: "all", page: 1 } });
  }
  if (query.min !== undefined || query.max !== undefined) {
    chips.push({ id: "priceRange", patch: { min: undefined, max: undefined, page: 1 } });
  }
  if (query.sort !== "name") {
    chips.push({ id: "sort", patch: { sort: "name", page: 1 } });
  }

  return chips;
}

export function hasVisibleActiveFilters(
  query: ParsedCatalogQuery,
  options: { showDivision?: boolean } = {},
) {
  return getActiveCatalogFilterChips(query, options).length > 0;
}

export function getPriceBounds(products: Product[]) {
  const prices = products.map((product) => product.price).filter((price): price is number => price != null && price > 0);
  if (prices.length === 0) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function filterCatalogByDivision(products: Product[], division: CatalogDivision | "all") {
  return products.filter((product) => productMatchesDivision(product, division));
}

export function applyCatalogFilters(products: Product[], query: ParsedCatalogQuery) {
  return products.filter((product) => {
    if (!productMatchesDivision(product, query.division)) return false;
    if (query.stock === "in" && !product.inStock) return false;
    if (query.stock === "out" && product.inStock) return false;
    if (query.sale === "yes" && !product.onSale) return false;
    if (query.sale === "no" && product.onSale) return false;
    if (query.priceType === "priced" && (product.price == null || product.price <= 0)) return false;
    if (query.priceType === "on-request" && product.price != null && product.price > 0) return false;

    if (query.min !== undefined || query.max !== undefined) {
      if (product.price == null || product.price <= 0) return false;
      if (query.min !== undefined && product.price < query.min) return false;
      if (query.max !== undefined && product.price > query.max) return false;
    }

    return true;
  });
}

export function sortCatalogProducts(list: Product[], sort: ParsedCatalogQuery["sort"]) {
  if (sort !== "price-asc" && sort !== "price-desc") return list;
  const direction = sort === "price-asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    if (a.price == null && b.price == null) return 0;
    if (a.price == null) return 1;
    if (b.price == null) return -1;
    return (a.price - b.price) * direction;
  });
}
