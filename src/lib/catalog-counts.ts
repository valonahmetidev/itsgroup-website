import type { CatalogDivision } from "@/lib/divisions";
import { divisionCatalogSources } from "@/lib/divisions";
import type { Product, Source } from "@/lib/types";

export type CatalogTotals = {
  /** Technology division: networks, surveillance, cables, ITS Group products, etc. */
  technology: number;
  /** Home division: appliances and home living. */
  home: number;
  treco: number;
  tremark: number;
  alevado: number;
  its: number;
  categories: number;
};

export function countProductsForSource(products: Product[], source: Source) {
  return products.filter((product) => product.source === source).length;
}

export function countProductsForDivision(
  products: Product[],
  division: CatalogDivision,
  itsCount = 0,
) {
  const sources = divisionCatalogSources(division);
  const fromCatalog = products.filter((product) => sources.includes(product.source)).length;
  if (!sources.includes("its")) return fromCatalog;
  const staticIts = countProductsForSource(products, "its");
  return fromCatalog - staticIts + itsCount;
}

export function productMatchesDivision(
  product: Product,
  division: CatalogDivision | "all",
) {
  if (division === "all") return true;
  return divisionCatalogSources(division).includes(product.source);
}

export function buildCatalogTotals(
  products: Product[],
  categoryCount: number,
  itsCount = 0,
): CatalogTotals {
  const treco = countProductsForSource(products, "treco");
  const tremark = countProductsForSource(products, "tremark");
  const alevado = countProductsForSource(products, "alevado");

  return {
    treco,
    tremark,
    alevado,
    its: itsCount,
    technology: countProductsForDivision(products, "technology", itsCount),
    home: countProductsForDivision(products, "home", itsCount),
    categories: categoryCount,
  };
}
